 import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const LandingPage: React.FC = () => {
  const navigation: any = useNavigation();

  return (
    <ScrollView style={styles.container}>
      
      {/* Hero Section */}
      <View style={styles.hero}>
        <Image style={styles.logo} source={require("../assets/Medbill-logo.png")} />
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
          onPress={() => navigation.navigate("SignIn")}
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

  logo:{
     width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#14B8A6",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
    marginBottom: 25,
    alignSelf: "center"
  },

  container: {
    flex: 1,
    backgroundColor: "#E6F7F7",
    paddingHorizontal: 20,
  },

  /* Hero Section */

  hero: {
    alignItems: "center",
    marginTop: 60,
    marginBottom: 40,
  },

  title: {
    fontSize: 42,
    fontWeight: "900",
    color: "#0F766E",
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#475569",
    marginBottom: 30,
    paddingHorizontal: 10,
  },

  signupBtn: {
    width: "80%",
    backgroundColor: "#14B8A6",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#14B8A6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },

  loginBtn: {
    width: "80%",
    backgroundColor: "#0EA5E9",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#0EA5E9",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },

  btnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  /* Sections */

  section: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F766E",
    marginBottom: 12,
  },

  feature: {
    fontSize: 15,
    color: "#334155",
    marginBottom: 8,
    lineHeight: 22,
  },

  /* About */

  aboutText: {
    fontSize: 15,
    color: "#475569",
    marginBottom: 16,
    lineHeight: 22,
  },

  teamTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F766E",
    marginBottom: 8,
  },

  member: {
    fontSize: 15,
    color: "#334155",
    marginBottom: 4,
  },

  /* Footer */

  footer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
  },

  footerText: {
    color: "#64748B",
    fontSize: 14,
  },

});