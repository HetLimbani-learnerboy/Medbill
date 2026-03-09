 import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const LandingPage: React.FC = () => {
  const navigation: any = useNavigation();

  return (
    <ScrollView style={styles.container}>
      
      {/* Hero Section */}
      <View style={styles.hero}>
        <Text style={styles.title}>Medbill</Text>
        <Text style={styles.subtitle}>
          Smart Billing & Inventory Insights for Pharmacies
        </Text>

        <TouchableOpacity
          style={styles.signupBtn}
          onPress={() => navigation.navigate("SignUp")}
        >
          <Text style={styles.btnText}>Create Account</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginBtn}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.btnText}>Sign In</Text>
        </TouchableOpacity>
      </View>

      {/* Product Functions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Product Functions</Text>

        <Text style={styles.feature}>
          • Automatic bill and receipt generation through QR/barcode scanning
        </Text>

        <Text style={styles.feature}>
          • Medicine-level sales data storage and management
        </Text>

        <Text style={styles.feature}>
          • Visualization of weekly, monthly, yearly, and custom-filtered sales
        </Text>

        <Text style={styles.feature}>
          • AI/ML-based demand prediction and decision support
        </Text>

        <Text style={styles.feature}>
          • Intelligent reporting for inventory optimization
        </Text>
      </View>

      {/* About Us */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About Us</Text>

        <Text style={styles.aboutText}>
          Medbill is designed to help pharmacies manage billing, sales tracking,
          and demand prediction efficiently using modern technologies like AI
          and Machine Learning.
        </Text>

        <Text style={styles.teamTitle}>Bill Wizards Team</Text>

        <Text style={styles.member}>1. Het Limbani</Text>
        <Text style={styles.member}>2. Shriman Dasadiya</Text>
        <Text style={styles.member}>3. Kaloliya Gaurav</Text>
        <Text style={styles.member}>4. Saiyam Shah</Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2026 Medbill</Text>
      </View>
    </ScrollView>
  );
};

export default LandingPage;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F8FAFC",
  },

  hero: {
    padding: 30,
    alignItems: "center",
  },

  title: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#1E293B",
  },

  subtitle: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 25,
  },

  signupBtn: {
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginBottom: 12,
    width: "80%",
    alignItems: "center",
  },

  loginBtn: {
    backgroundColor: "#1E293B",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    width: "80%",
    alignItems: "center",
  },

  btnText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },

  section: {
    paddingHorizontal: 25,
    marginTop: 30,
  },

  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 15,
  },

  feature: {
    fontSize: 15,
    color: "#334155",
    marginBottom: 10,
    lineHeight: 22,
  },

  aboutText: {
    fontSize: 15,
    color: "#475569",
    marginBottom: 20,
    lineHeight: 22,
  },

  teamTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#1E293B",
  },

  member: {
    fontSize: 15,
    color: "#334155",
    marginBottom: 5,
  },

  footer: {
    marginTop: 40,
    alignItems: "center",
    paddingBottom: 30,
  },

  footerText: {
    color: "#94A3B8",
  },
});