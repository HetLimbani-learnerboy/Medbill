import pandas as pd
import numpy as np
import json
import os
from catboost import CatBoostRegressor
from datasets import load_dataset

# ===================== PATHS =====================
MODEL_PATH = "model.cbm"
FEATURES_PATH = "features.json"
STATE_PATH = "last_state.csv"

# ===================== TRAIN MODEL =====================
def train_and_save_model():
    print("\n[1/4] Loading dataset...")
    df = load_dataset("electricsheepafrica/essential-medicines-stockouts")["train"].to_pandas()

    df["demand"] = df["patients_turned_away"].astype(float)
    df["time"] = df["year"] * 100 + df["quarter"]

    print("[2/4] Aggregating...")
    agg = (
        df.groupby(["drug_name", "facility_level", "time"], as_index=False)["demand"]
        .mean()
        .sort_values(["drug_name", "facility_level", "time"])
        .reset_index(drop=True)
    )

    group_cols = ["drug_name", "facility_level"]

    print("[3/4] Feature Engineering...")

    # LAGS
    for lag in range(1, 9):
        agg[f"lag_{lag}"] = agg.groupby(group_cols)["demand"].shift(lag)

    grouped = agg.groupby(group_cols)["demand"]

    # ROLLING
    agg["roll_mean_4"] = grouped.transform(lambda x: x.shift(1).rolling(4, min_periods=1).mean())
    agg["roll_std_4"] = grouped.transform(lambda x: x.shift(1).rolling(4, min_periods=1).std())
    agg["roll_min_4"] = grouped.transform(lambda x: x.shift(1).rolling(4, min_periods=1).min())
    agg["roll_max_4"] = grouped.transform(lambda x: x.shift(1).rolling(4, min_periods=1).max())

    # EWM
    agg["ewm_0.3"] = grouped.transform(lambda x: x.shift(1).ewm(alpha=0.3, adjust=False).mean())

    # TREND + MOMENTUM
    agg["trend"] = agg.groupby(group_cols).cumcount()
    agg["diff_1"] = grouped.transform(lambda x: x.diff(1))
    agg["diff_2"] = grouped.transform(lambda x: x.diff(2))

    # SEASONALITY
    agg["quarter"] = agg["time"] % 100

    for i in range(1, 3):
        agg[f"sin_{i}"] = np.sin(2 * np.pi * i * agg["quarter"] / 4)
        agg[f"cos_{i}"] = np.cos(2 * np.pi * i * agg["quarter"] / 4)

    # FILL NA
    agg = agg.fillna(0)

    # FEATURES
    features = [c for c in agg.columns if c not in ["demand", "time"]]
    cat_features = ["drug_name", "facility_level", "quarter"]

    # TRAIN DATA
    train = agg[agg["time"] <= 202402]

    X_train = train[features]
    y_train_raw = train["demand"]
    y_train = np.log1p(y_train_raw)

    sample_weight = 1 / (y_train_raw + 1)

    print("[4/4] Training model...")

    model = CatBoostRegressor(
        iterations=4000,
        learning_rate=0.02,
        depth=6,
        l2_leaf_reg=10,
        loss_function="RMSE",
        eval_metric="RMSE",
        random_seed=42,
        early_stopping_rounds=300,
        cat_features=cat_features,
        verbose=200
    )

    model.fit(X_train, y_train, sample_weight=sample_weight)

    print("Saving artifacts...")

    model.save_model(MODEL_PATH)

    with open(FEATURES_PATH, "w") as f:
        json.dump(features, f)

    # Save state for forecasting
    agg[["drug_name", "facility_level", "time", "demand"]].to_csv(STATE_PATH, index=False)

    print("✅ Model + features + state saved!")


# ===================== FORECAST =====================
def get_forecast_insights():
    if not os.path.exists(MODEL_PATH):
        return {"error": "Model not trained"}

    # LOAD
    model = CatBoostRegressor()
    model.load_model(MODEL_PATH)

    with open(FEATURES_PATH, "r") as f:
        features = json.load(f)

    current_df = pd.read_csv(STATE_PATH)

    group_cols = ["drug_name", "facility_level"]
    future_time = 202501
    quarter = future_time % 100

    new_rows = []

    for (drug, facility), group in current_df.groupby(group_cols):

        group = group.sort_values("time")
        hist = group["demand"].tolist()

        row = {
            "drug_name": drug,
            "facility_level": facility,
            "time": future_time,
            "quarter": quarter,
            "trend": len(hist)
        }

        # LAGS
        for lag in range(1, 9):
            row[f"lag_{lag}"] = hist[-lag] if len(hist) >= lag else 0.0

        # ROLLING
        last4 = pd.Series(hist[-4:]) if len(hist) > 0 else pd.Series([0.0])

        row["roll_mean_4"] = last4.mean()
        row["roll_std_4"] = last4.std() if len(last4) > 1 else 0.0
        row["roll_min_4"] = last4.min()
        row["roll_max_4"] = last4.max()

        # EWM (SAFE FIX)
        if len(hist) > 0:
            row["ewm_0.3"] = pd.Series(hist).ewm(alpha=0.3, adjust=False).mean().iloc[-1]
        else:
            row["ewm_0.3"] = 0.0

        # DIFF
        row["diff_1"] = hist[-1] - hist[-2] if len(hist) >= 2 else 0.0
        row["diff_2"] = hist[-1] - hist[-3] if len(hist) >= 3 else 0.0

        # FOURIER
        for i in range(1, 3):
            row[f"sin_{i}"] = np.sin(2 * np.pi * i * quarter / 4)
            row[f"cos_{i}"] = np.cos(2 * np.pi * i * quarter / 4)

        # PREDICT
        input_df = pd.DataFrame([row])[features]

        pred_log = model.predict(input_df)[0]
        pred = np.expm1(pred_log)
        pred = pred * 10
        row["Jan_Prediction"] = int(max(0, round(pred)))

        new_rows.append(row)

    forecast_df = pd.DataFrame(new_rows)

    top_15 = forecast_df.nlargest(15, "Jan_Prediction")

    return top_15[["drug_name", "Jan_Prediction"]].to_dict(orient="records")


# ===================== MAIN =====================
if __name__ == "__main__":
    train_and_save_model()