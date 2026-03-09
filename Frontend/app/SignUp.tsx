import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    StyleSheet,
    Alert,
    ScrollView,
    ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const API_URL = "http://127.0.0.1:5000/api";

const SignUp: React.FC = () => {
    const navigation: any = useNavigation();

    const [step, setStep] = useState<number>(1);
    const [otp, setOtp] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    const [passwordVisible, setPasswordVisible] = useState<boolean>(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [passwordValid, setPasswordValid] = useState({
        length: false,
        upper: false,
        lower: false,
        number: false,
        special: false,
        match: false,
    });

    const safeJson = async (res: Response) => {
        try {
            return await res.json();
        } catch {
            return {};
        }
    };

    const handlePasswordChange = (value: string) => {
        setFormData({ ...formData, password: value });

        setPasswordValid({
            length: value.length >= 8,
            upper: /[A-Z]/.test(value),
            lower: /[a-z]/.test(value),
            number: /[0-9]/.test(value),
            special: /[!@#$%^&*]/.test(value),
            match: value === formData.confirmPassword,
        });
    };

    const handleConfirmPasswordChange = (value: string) => {
        setFormData({ ...formData, confirmPassword: value });

        setPasswordValid((prev) => ({
            ...prev,
            match: value === formData.password,
        }));
    };

    const isPasswordAllValid =
        passwordValid.length &&
        passwordValid.upper &&
        passwordValid.lower &&
        passwordValid.number &&
        passwordValid.special &&
        passwordValid.match;

    const handleSignupSubmit = async () => {

        // ✅ Check empty fields
        if (
            !formData.name.trim() ||
            !formData.email.trim() ||
            !formData.password ||
            !formData.confirmPassword
        ) {
            Alert.alert("Required Fields", "Please fill all fields before signing up.");
            return;
        }

        if (!isPasswordAllValid) {
            Alert.alert(
                "Password Error",
                "Password must contain:\n• 8 characters\n• Uppercase\n• Lowercase\n• Number\n• Special character\n• Passwords must match"
            );
            return;
        }

        setLoading(true);

        try {
            const signupRes = await fetch(`${API_URL}/signup`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    email: formData.email.trim(),
                    password: formData.password,
                }),
            });

            const signupData = await safeJson(signupRes);

            if (!signupRes.ok) {
                Alert.alert("Signup Failed", signupData.message || "Error");
                setLoading(false);
                return;
            }

            const otpRes = await fetch(`${API_URL}/send-otp`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: formData.email.trim(),
                }),
            });

            const otpData = await safeJson(otpRes);

            if (!otpRes.ok) {
                Alert.alert("OTP Error", otpData.message || "OTP failed");
                setLoading(false);
                return;
            }

            Alert.alert("Success", "OTP sent to your email");
            setStep(2);

        } catch (error) {
            Alert.alert("Server Error", "Please try again later.");
        }

        setLoading(false);
    };

    const handleOtpSubmit = async () => {
        if (otp.length !== 6) {
            Alert.alert("Error", "Enter valid OTP");
            return;
        }

        setLoading(true);

        try {
            const verifyRes = await fetch(`${API_URL}/verify-otp`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: formData.email.trim(),
                    otp: otp,
                }),
            });

            const verifyData = await safeJson(verifyRes);

            if (!verifyRes.ok) {
                Alert.alert("OTP Failed", verifyData.message || "Verification failed");
                setLoading(false);
                return;
            }

            Alert.alert("Success", "OTP Verified");
            navigation.navigate("/");
        } catch {
            Alert.alert("Server Error");
        }

        setLoading(false);
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {step === 1 && (
                <>
                    <Text style={styles.title}>Create Account</Text>

                    <TextInput
                        placeholder="Full Name"
                        style={styles.input}
                        value={formData.name}
                        onChangeText={(value) =>
                            setFormData({ ...formData, name: value })
                        }
                    />

                    <TextInput
                        placeholder="Email"
                        style={styles.input}
                        value={formData.email}
                        onChangeText={(value) =>
                            setFormData({ ...formData, email: value })
                        }
                    />

                    <View style={styles.passwordWrapper}>
                        <TextInput
                            placeholder="Password"
                            style={styles.passwordInput}
                            secureTextEntry={!passwordVisible}
                            value={formData.password}
                            onChangeText={handlePasswordChange}
                        />

                        <TouchableOpacity
                            onPress={() => setPasswordVisible(!passwordVisible)}
                        >
                            <Image
                                source={
                                    passwordVisible
                                        ? require("../assets/eye_open.png")
                                        : require("../assets/eye-close.png")
                                }
                                style={styles.eye}
                            />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.rules}>
                        <Text style={{ color: passwordValid.length ? "green" : "red" }}>
                            • Minimum 8 characters
                        </Text>
                        <Text style={{ color: passwordValid.upper ? "green" : "red" }}>
                            • Uppercase letter
                        </Text>
                        <Text style={{ color: passwordValid.lower ? "green" : "red" }}>
                            • Lowercase letter
                        </Text>
                        <Text style={{ color: passwordValid.number ? "green" : "red" }}>
                            • Number
                        </Text>
                        <Text style={{ color: passwordValid.special ? "green" : "red" }}>
                            • Special character
                        </Text>
                    </View>

                    <TextInput
                        placeholder="Confirm Password"
                        style={styles.input}
                        secureTextEntry
                        value={formData.confirmPassword}
                        onChangeText={handleConfirmPasswordChange}
                    />

                    <Text style={{ ...styles.rules, color: passwordValid.match ? "green" : "red" }}>
                        • Passwords match
                    </Text>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleSignupSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.buttonText}>Sign Up</Text>
                        )}
                    </TouchableOpacity>
                </>
            )}

            {step === 2 && (
                <>
                    <Text style={styles.title}>Verify OTP</Text>

                    <Text>OTP sent to {formData.email}</Text>

                    <TextInput
                        placeholder="Enter OTP"
                        style={styles.input}
                        keyboardType="numeric"
                        value={otp}
                        onChangeText={(value) =>
                            setOtp(value.replace(/\D/g, "").slice(0, 6))
                        }
                    />

                    <TouchableOpacity style={styles.button} onPress={handleOtpSubmit}>
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.buttonText}>Verify OTP</Text>
                        )}
                    </TouchableOpacity>
                </>
            )}
        </ScrollView>
    );
};

export default SignUp;

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        paddingHorizontal: 25,
        paddingTop: 20,
        paddingBottom: 1,
        backgroundColor: "#F8FAFC",
    },
    headerContainer: {
        alignItems: "center",
    },
    title: {
        fontSize: 32,
        fontWeight: "900",
        color: "#1E293B",
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        color: "#64748B",
        marginTop: 8,
    },
    formCard: {
        backgroundColor: "#FFFFFF",
        padding: 20,
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#475569",
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        width: "100%",
        backgroundColor: "#F1F5F9",
        padding: 14,
        borderRadius: 12,
        fontSize: 16,
        color: "#1E293B",
        borderWidth: 1,
        borderColor: "#E2E8F0",
        marginBottom: 20,
    },
    passwordWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F1F5F9",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        marginBottom: 8,
        paddingHorizontal: 12,
    },
    passwordInput: {
        flex: 1,
        paddingVertical: 10,
        fontSize: 16,
        color: "#1E293B",
    },
    eye: {
        width: 22,
        height: 22,
    },
    rules: {
        width: "100%",
        padding: 1,
        backgroundColor: "#F8FAFC",
        borderRadius: 10,
        marginBottom: 10,
    },
    ruleText: {
        fontSize: 12,
        fontWeight: "500",
    },
    button: {
        width: "100%",
        backgroundColor: "#2563EB", // Vibrant Blue
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 10,
        shadowColor: "#2563EB",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonText: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
    },
    otpText: {
        textAlign: "center",
        fontSize: 15,
        color: "#64748B",
        marginBottom: 25,
        lineHeight: 22,
    },
});