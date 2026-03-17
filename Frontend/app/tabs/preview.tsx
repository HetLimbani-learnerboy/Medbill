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
  Platform
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
  const [offer, setOffer] = useState("0");

  // ===== CALCULATIONS =====
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const gstPercent = parseFloat(gst || "0");
  const offerPercent = parseFloat(offer || "0");

  const gstAmount = (subtotal * gstPercent) / 100;
  const offerAmount = (subtotal * offerPercent) / 100;

  const finalTotal = subtotal + gstAmount - offerAmount;

  // ===== RESET =====
  const resetForm = () => {
    setUsername("");
    setContactValue("");
    setEmail("");
    setPhone("");
    setUserExists(false);
  };

  // ===== CHECK USER =====
  const fetchUserData = async (value: string) => {

    const isPhone = contactType === "phone" && value.length === 10;
    const isEmail = contactType === "email" && value.includes("@");

    if (!isPhone && !isEmail) return;

    setIsCheckingUser(true);

    try {
      const query = contactType === "phone"
        ? `phone=${value}`
        : `email=${value}`;

      const res = await fetch(`${API_URL}/receipts/check-user?${query}`);
      const data = await res.json();

      if (data.exists) {
        setUserExists(true);
        setUsername(data.customer_name);
        setEmail(data.email || "");
        setPhone(data.phone_number || "");
      } else {
        setUserExists(false);
        setUsername("");
        setEmail("");
        setPhone("");
      }

    } catch (err) {
      console.log(err);
    } finally {
      setIsCheckingUser(false);
    }
  };

  const handleContactChange = (text: string) => {
    setContactValue(text);
    fetchUserData(text);
  };

  // ===== CHECKOUT =====
  const handleCheckout = async () => {

    if (loading) return;

    if (cart.length === 0) {
      Alert.alert("Error", "Cart is empty");
      return;
    }

    // Validation
    if (!username.trim()) {
      Alert.alert("Error", "Enter customer name");
      return;
    }

    if (!contactValue.trim()) {
      Alert.alert("Error", "Enter contact");
      return;
    }

    if (!userExists) {
      if (!email.trim() && contactType === "phone") {
        Alert.alert("Error", "Enter email");
        return;
      }

      if (!phone.trim() && contactType === "email") {
        Alert.alert("Error", "Enter phone number");
        return;
      }
    }

    try {
      setLoading(true);

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

        items: cart.map((item) => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity
        }))
      };

      const res = await fetch(`${API_URL}/receipts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        Alert.alert("Success", `Receipt ID: ${data.receipt_id}`, [
          {
            text: "OK",
            onPress: () => {
              clearCart();
              resetForm();
              router.replace("/tabs");
            }
          }
        ]);
      } else {
        Alert.alert("Error", data.message || "Failed");
      }

    } catch (err) {
      Alert.alert("Server Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>

        <Text style={styles.header}>Checkout</Text>

        {/* CONTACT */}
        <Picker
          selectedValue={contactType}
          onValueChange={(val) => {
            setContactType(val);
            setContactValue("");
            setUserExists(false);
          }}
        >
          <Picker.Item label="Phone" value="phone" />
          <Picker.Item label="Email" value="email" />
        </Picker>

        <TextInput
          placeholder="Enter contact"
          value={contactValue}
          onChangeText={handleContactChange}
          style={styles.input}
        />

        {isCheckingUser && <Text>Checking user...</Text>}

        {/* NAME */}
        <TextInput
          placeholder="Customer Name"
          value={username}
          onChangeText={setUsername}
          style={styles.input}
        />

        {/* NEW USER EXTRA FIELDS */}
        {!userExists && (
          <>
            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
            />

            <TextInput
              placeholder="Phone"
              value={phone}
              onChangeText={setPhone}
              style={styles.input}
              keyboardType="phone-pad"
            />
          </>
        )}

        {/* ITEMS */}
        {cart.map((item, i) => (
          <Text key={i}>
            {item.name} - ₹{item.price} x {item.quantity}
          </Text>
        ))}

        <Text>Total: ₹{finalTotal.toFixed(2)}</Text>

        {/* BUTTON */}
        <TouchableOpacity
          style={[styles.btn, loading && { opacity: 0.6 }]}
          onPress={handleCheckout}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: "#fff" }}>Checkout</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  header: { fontSize: 24, fontWeight: "900", color: "#0F766E", textAlign: "center", marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "700", color: "#134E4A", marginBottom: 8, marginTop: 10 },
  input: { backgroundColor: "#FFF", borderWidth: 1.5, borderColor: "#E2E8F0", padding: 14, borderRadius: 12, marginBottom: 15, fontSize: 16 },
  inputChecking: { borderColor: "#14B8A6", borderStyle: "dashed" },
  checkingText: { fontSize: 12, color: "#0F766E", marginTop: -10, marginBottom: 10, marginLeft: 5 },
  pickerContainer: { backgroundColor: "#FFF", borderWidth: 1.5, borderColor: "#E2E8F0", borderRadius: 12, marginBottom: 15, overflow: "hidden" },
  subHeader: { fontSize: 18, fontWeight: "800", color: "#134E4A", marginVertical: 15 },
  itemBox: { flexDirection: "row", alignItems: "center", padding: 15, backgroundColor: "#FFF", borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: "#E2E8F0" },
  itemName: { fontWeight: "700", fontSize: 16, color: "#1E293B" },
  itemSubText: { fontSize: 13, color: "#64748B", marginTop: 2 },
  itemTotal: { fontWeight: "800", color: "#0F766E", fontSize: 16 },
  footer: { marginTop: 20, padding: 20, backgroundColor: "#FFF", borderRadius: 16, borderWidth: 1, borderColor: "#CCFBF1" },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  summaryLabel: { fontSize: 15, color: "#64748B", fontWeight: "600" },
  summaryValue: { fontSize: 15, fontWeight: "700", color: "#1E293B" },
  smallInput: { borderWidth: 1, borderColor: "#CBD5E1", width: 60, padding: 8, borderRadius: 8, textAlign: "center", fontWeight: "700" },
  finalTotalContainer: { marginTop: 15, paddingTop: 15, borderTopWidth: 2, borderTopColor: "#5EEAD4", flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 25 },
  finalTotalLabel: { fontSize: 20, fontWeight: "900", color: "#134E4A" },
  finalTotalValue: { fontSize: 22, fontWeight: "900", color: "#0F766E" },
  checkoutBtn: { backgroundColor: "#0F766E", padding: 18, borderRadius: 14, alignItems: "center" },
  btnText: { color: "white", fontWeight: "800", fontSize: 18 },
  btn: {
    backgroundColor: "green",
    padding: 15,
    alignItems: "center",
    marginTop: 20
  }
});