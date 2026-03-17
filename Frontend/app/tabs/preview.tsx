import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  ActivityIndicator,
  Platform,
  Keyboard
} from "react-native";

import { useCart } from "../CartContext";
import { useRouter } from "expo-router";
import { Picker } from "@react-native-picker/picker";

export default function Preview() {
  const API_URL = `${process.env.EXPO_PUBLIC_BACKEND_URL}/api`;
  const { cart, clearCart } = useCart();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [isCheckingUser, setIsCheckingUser] = useState(false);
  const [userExists, setUserExists] = useState(false);

  const [username, setUsername] = useState("");
  const [contactType, setContactType] = useState("phone");
  const [contactValue, setContactValue] = useState("");

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [gst, setGst] = useState("18");
  const [offer, setOffer] = useState("10");

  // ===== CALCULATIONS =====
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const gstPercent = parseFloat(gst || "0");
  const offerPercent = parseFloat(offer || "0");

  const gstAmount = (subtotal * gstPercent) / 100;
  const offerAmount = (subtotal * offerPercent) / 100;
  const finalTotal = subtotal + gstAmount - offerAmount;

  const resetForm = () => {
    setUsername("");
    setContactValue("");
    setEmail("");
    setPhone("");
    setGst("18");
    setOffer("10");
    setUserExists(false);
    clearCart();
  };

  const handleContactChange = (text: string) => {
    setContactValue(text);
    setUserExists(false);
    setUsername("");
    setEmail("");
    setPhone("");

    if (contactType === "phone" && text.length === 10) {
      fetchUserData(text);
    } else if (contactType === "email" && /\S+@\S+\.\S+/.test(text)) {
      fetchUserData(text);
    }
  };

  const fetchUserData = async (value: string) => {
    try {
      setIsCheckingUser(true);
      const query = contactType === "phone" ? `phone=${value}` : `email=${value}`;
      const res = await fetch(`${API_URL}/receipts/check-user?${query}`);
      const data = await res.json();

      if (data.exists) {
        setUserExists(true);
        setUsername(data.customer_name || "");
        setEmail(data.email || "");
        setPhone(data.phone_number || "");
      } else {
        setUserExists(false);
      }
    } catch (err) {
      console.log("Fetch user error:", err);
    } finally {
      setIsCheckingUser(false);
    }
  };

  const handleCheckout = async () => {
    Keyboard.dismiss();

    if (cart.length === 0) {
      Alert.alert("Error", "Cart is empty");
      return;
    }

    if (!username.trim() || !contactValue.trim()) {
      Alert.alert("Error", "Name and Contact are required");
      return;
    }

    if (!userExists) {
      if (contactType === "phone" && (!email.includes("@"))) {
        Alert.alert("Error", "Valid email required for new users");
        return;
      }
      if (contactType === "email" && phone.length !== 10) {
        Alert.alert("Error", "10-digit phone required for new users");
        return;
      }
    }

    const payload = {
      customer_name: username,
      email: contactType === "email" ? contactValue : email,
      phone_number: contactType === "phone" ? contactValue : phone,
      subtotal,
      gst_percent: gstPercent,
      gst_amount: gstAmount,
      offer_percent: offerPercent,
      offer_amount: offerAmount,
      total_amount: finalTotal,
      items: cart.map(item => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity
      }))
    };

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/receipts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        Alert.alert("Success", "Order Confirmed! Your receipt and medicine details have been sent to your registered contact info. Thank you for choosing us!🎉", [
          { text: "OK", onPress: () => { resetForm(); router.replace("/tabs"); } }
        ]);
      } else {
        Alert.alert("Error", "Failed to save record");
      }
    } catch (err) {
      Alert.alert("Server error", "Check your connection");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Invoice Preview</Text>

          <Text style={styles.label}>Contact Method *</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={contactType}
              onValueChange={(val) => {
                setContactType(val);
                setContactValue("");
                setUserExists(false);
                setUsername("");
              }}
            >
              <Picker.Item label="Phone Number" value="phone" />
              <Picker.Item label="Email Address" value="email" />
            </Picker>
          </View>

          <Text style={styles.label}>
            Contact ({contactType === "phone" ? "Phone" : "Email"}) *
          </Text>
          <TextInput
            placeholder={contactType === "phone" ? "10-digit Phone" : "Email Address"}
            value={contactValue}
            onChangeText={handleContactChange}
            style={styles.input}
            keyboardType={contactType === "phone" ? "phone-pad" : "email-address"}
            maxLength={contactType === "phone" ? 10 : undefined}
          />

          {isCheckingUser && <Text style={styles.checkingText}>Searching records...</Text>}

          <Text style={styles.label}>Customer Name *</Text>
          <TextInput
            placeholder="Enter Name"
            value={username}
            onChangeText={setUsername}
            style={styles.input}
          />

          {!userExists && contactValue.length > 5 && (
            <View style={styles.newUserBox}>
              <Text style={styles.infoText}>New Customer Detected</Text>
              {contactType === "phone" ? (
                <>
                  <Text style={styles.label}>Email Address *</Text>
                  <TextInput
                    placeholder="example@mail.com"
                    value={email}
                    onChangeText={setEmail}
                    style={styles.input}
                    keyboardType="email-address"
                  />
                </>
              ) : (
                <>
                  <Text style={styles.label}>Phone Number *</Text>
                  <TextInput
                    placeholder="10-digit Mobile"
                    value={phone}
                    onChangeText={setPhone}
                    style={styles.input}
                    keyboardType="phone-pad"
                    maxLength={10}
                  />
                </>
              )}
            </View>
          )}

          <View style={styles.dashedLine} />

          <Text style={styles.subHeader}>Medicines</Text>
          {cart.map((item, i) => (
            <View key={i} style={styles.itemRow}>
              <View>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemQty}>₹{item.price} x {item.quantity}</Text>
              </View>
              <Text style={styles.itemTotal}>₹{(item.price * item.quantity).toFixed(2)}</Text>
            </View>
          ))}

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>₹{subtotal.toFixed(2)}</Text>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.summaryLabel}>GST (%)</Text>
              <TextInput
                style={styles.smallInput}
                value={gst}
                onChangeText={setGst}
                keyboardType="numeric"
              />
            </View>
            <Text style={styles.summaryValue}>+ ₹{gstAmount.toFixed(2)}</Text>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.summaryLabel}>Offer (%)</Text>
              <TextInput
                style={styles.smallInput}
                value={offer}
                onChangeText={setOffer}
                keyboardType="numeric"
              />
            </View>
            <Text style={[styles.summaryValue, { color: "#E11D48" }]}>- ₹{offerAmount.toFixed(2)}</Text>
          </View>

          <View style={styles.finalTotalContainer}>
            <Text style={styles.totalLabel}>Grand Total</Text>
            <Text style={styles.totalValue}>₹{finalTotal.toFixed(2)}</Text>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.7 }]}
            onPress={handleCheckout}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Complete Checkout</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: "#E6F7F7", padding: 20, paddingTop: 50 },
  card: { backgroundColor: "white", padding: 25, borderRadius: 20, elevation: 6 },
  title: { fontSize: 28, fontWeight: "900", color: "#0F766E", marginBottom: 20, textAlign: "center" },
  label: { fontSize: 14, fontWeight: "700", color: "#134E4A", marginBottom: 6 },
  input: { backgroundColor: "#F1F5F9", padding: 14, borderRadius: 12, borderWidth: 1, borderColor: "#CBD5F5", marginBottom: 16 },
  newUserBox: {
    backgroundColor: "#F0FDFA",
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#5EEAD4",
    marginBottom: 15,
  },
  infoText: {
    fontSize: 12,
    color: "#0D9488",
    fontWeight: "800",
    marginBottom: 10,
    textTransform: "uppercase"
  },
  checkingText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#14B8A6",
    marginTop: -12,
    marginBottom: 15,
    marginLeft: 5,
    fontStyle: "italic",
  },
  pickerWrapper: { backgroundColor: "#F1F5F9", borderRadius: 12, borderWidth: 1, borderColor: "#CBD5F5", marginBottom: 16, overflow: "hidden" },
  dashedLine: { borderWidth: 1, borderColor: "#CBD5F5", borderStyle: "dashed", height: 0, width: "100%", marginVertical: 15 },
  subHeader: { fontSize: 18, fontWeight: "800", color: "#0F766E", marginVertical: 10 },
  itemRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
  itemName: { fontSize: 16, fontWeight: "600", color: "#1E293B" },
  itemQty: { fontSize: 13, color: "#64748B" },
  itemTotal: { fontSize: 16, fontWeight: "700", color: "#0F766E" },
  divider: { height: 1, backgroundColor: "#E2E8F0", marginVertical: 15 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  summaryLabel: { color: "#64748B", fontSize: 14, fontWeight: "600" },
  summaryValue: { fontWeight: "700", color: "#1E293B", fontSize: 15 },
  smallInput: { backgroundColor: "#F8FAFC", borderWidth: 1, borderColor: "#CBD5E1", width: 60, padding: 5, borderRadius: 8, textAlign: "center", marginTop: 4 },
  finalTotalContainer: { flexDirection: "row", justifyContent: "space-between", marginTop: 10, paddingTop: 15, borderTopWidth: 2, borderTopColor: "#14B8A6" },
  totalLabel: { fontSize: 20, fontWeight: "900", color: "#0F766E" },
  totalValue: { fontSize: 22, fontWeight: "900", color: "#14B8A6" },
  button: { backgroundColor: "#14B8A6", padding: 16, borderRadius: 12, alignItems: "center", marginTop: 25 },
  buttonText: { color: "white", fontSize: 18, fontWeight: "bold" }
});