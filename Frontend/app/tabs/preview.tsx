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
  Platform
} from "react-native";

import { useCart } from "../CartContext";
import { useRouter } from "expo-router";
import { Picker } from "@react-native-picker/picker";

export default function Preview() {

  const { cart, clearCart } = useCart();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [contactType, setContactType] = useState("phone");
  const [contactValue, setContactValue] = useState("");
  const [gst, setGst] = useState("18");
  const [offer, setOffer] = useState("0");

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const gstPercent = parseFloat(gst || "0");
  const offerPercent = parseFloat(offer || "0");

  const gstAmount = (subtotal * gstPercent) / 100;
  const offerAmount = (subtotal * offerPercent) / 100;

  const finalTotal = subtotal + gstAmount - offerAmount;

  const resetForm = () => {
    setUsername("");
    setContactType("phone");
    setContactValue("");
    setGst("18");
    setOffer("0");
  };

  const handleCheckout = () => {

    if (cart.length === 0) {
      Alert.alert("Error", "Your cart is empty.");
      return;
    }

    if (!username.trim()) {
      Alert.alert("Required Field", "Please enter customer name.");
      return;
    }

    if (!contactValue.trim()) {
      Alert.alert(
        "Required Field",
        `Please enter customer ${contactType === "phone" ? "phone number" : "email"}`
      );
      return;
    }

    Alert.alert(
      "Success",
      `Order for ${username} processed!\nInvoice sent to ${contactValue}`,
      [
        {
          text: "OK",
          onPress: () => {
            clearCart();
            resetForm();
            router.replace("/tabs");
          }
        }
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: "#F0F9F9" }}
    >
      <ScrollView contentContainerStyle={styles.container}>

        <Text style={styles.header}>Medicine Checkout</Text>

        {/* Customer Name */}
        <Text style={styles.label}>Customer Name</Text>
        <TextInput
          placeholder="e.g. John Doe"
          value={username}
          onChangeText={setUsername}
          style={styles.input}
        />

        {/* Contact Method */}
        <Text style={styles.label}>Contact Method</Text>

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={contactType}
            onValueChange={(itemValue) => {
              setContactType(itemValue);
              setContactValue("");
            }}
          >
            <Picker.Item label="Phone Number" value="phone" />
            <Picker.Item label="Email Address" value="email" />
          </Picker>
        </View>

        {/* Contact Input */}
        <Text style={styles.label}>
          {contactType === "phone" ? "Phone Number" : "Email Address"}
        </Text>

        <TextInput
          placeholder={
            contactType === "phone"
              ? "Enter 10 digit number"
              : "Enter email address"
          }
          value={contactValue}
          onChangeText={setContactValue}
          keyboardType={
            contactType === "phone" ? "phone-pad" : "email-address"
          }
          autoCapitalize="none"
          maxLength={contactType === "phone" ? 10 : undefined}
          style={styles.input}
        />

        {/* Cart Items */}
        <Text style={styles.subHeader}>
          Scanned Items ({cart.length})
        </Text>

        {cart.map((item, index) => (
          <View key={index} style={styles.itemBox}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemSubText}>
                ₹{item.price} x {item.quantity}
              </Text>
            </View>

            <Text style={styles.itemTotal}>
              ₹{(item.price * item.quantity).toFixed(2)}
            </Text>
          </View>
        ))}

        {/* Bill Summary */}
        <View style={styles.footer}>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal:</Text>
            <Text style={styles.summaryValue}>
              ₹{subtotal.toFixed(2)}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.summaryLabel}>GST (%):</Text>
            <TextInput
              keyboardType="numeric"
              value={gst}
              onChangeText={setGst}
              style={styles.smallInput}
            />
          </View>

          <View style={styles.row}>
            <Text style={styles.summaryLabel}>Offer (%):</Text>
            <TextInput
              keyboardType="numeric"
              value={offer}
              onChangeText={setOffer}
              style={styles.smallInput}
            />
          </View>

          <View style={styles.finalTotalContainer}>
            <Text style={styles.finalTotalLabel}>
              Final Total
            </Text>

            <Text style={styles.finalTotalValue}>
              ₹{finalTotal.toFixed(2)}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.checkoutBtn}
            onPress={handleCheckout}
          >
            <Text style={styles.btnText}>
              Process to Checkout
            </Text>
          </TouchableOpacity>

        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
    container: { padding: 20 },
    header: {
        fontSize: 26,
        fontWeight: "900",
        marginBottom: 25,
        color: "#0F766E",
        textAlign: 'center'
    },
    label: {
        fontSize: 14,
        fontWeight: "700",
        color: "#134E4A",
        marginBottom: 8,
        marginLeft: 4
    },
    input: {
        backgroundColor: "#FFF",
        borderWidth: 1.5,
        borderColor: "#E2E8F0",
        padding: 14,
        borderRadius: 12,
        marginBottom: 20,
        fontSize: 16
    },
    pickerContainer: {
        backgroundColor: "#FFF",
        borderWidth: 1.5,
        borderColor: "#E2E8F0",
        borderRadius: 12,
        marginBottom: 20,
        overflow: 'hidden'
    },
    subHeader: {
        fontSize: 18,
        fontWeight: "800",
        color: "#134E4A",
        marginTop: 10,
        marginBottom: 15
    },
    itemBox: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: "#FFF",
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#E2E8F0"
    },
    itemName: { fontWeight: "700", fontSize: 16, color: "#1E293B" },
    itemSubText: { fontSize: 13, color: "#64748B", marginTop: 2 },
    itemTotal: { fontWeight: '800', color: '#0F766E', fontSize: 16 },

    footer: {
        marginTop: 25,
        padding: 20,
        backgroundColor: "#FFF",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#CCFBF1"
    },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    summaryLabel: { fontSize: 15, color: "#64748B", fontWeight: '600' },
    summaryValue: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
    smallInput: {
        borderWidth: 1,
        borderColor: "#CBD5E1",
        width: 60,
        padding: 8,
        borderRadius: 8,
        textAlign: 'center',
        fontWeight: '700'
    },
    finalTotalContainer: {
        marginTop: 15,
        paddingTop: 15,
        borderTopWidth: 2,
        borderTopColor: "#5EEAD4",
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 25
    },
    finalTotalLabel: { fontSize: 20, fontWeight: "900", color: "#134E4A" },
    finalTotalValue: { fontSize: 22, fontWeight: "900", color: "#0F766E" },
    checkoutBtn: {
        backgroundColor: "#0F766E",
        padding: 18,
        borderRadius: 14,
        alignItems: "center",
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4
    },
    btnText: { color: "white", fontWeight: "800", fontSize: 18, letterSpacing: 0.5 }
});

