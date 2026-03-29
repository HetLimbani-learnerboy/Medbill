import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
  StatusBar,
  Linking
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const scale = (size: number) => (width / 375) * size;

const LandingPage: React.FC = () => {
  const navigation: any = useNavigation();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" backgroundColor="#E6F7F7" />
      
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* HERO SECTION */}
        <View style={styles.hero}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>v2.0 AI Powered</Text>
          </View>
          <Image style={styles.logo} source={require("../assets/Medbill-logo.png")} />
          <Text style={styles.title}>Medbill</Text>
          <Text style={styles.subtitle}>
            Transform your pharmacy with Smart Billing, Inventory Insights, and AI-Driven Growth.
          </Text>

          <View style={styles.heroActions}>
            <TouchableOpacity
              style={styles.signupBtn}
              onPress={() => navigation.navigate("SignUp")}
            >
              <Text style={styles.btnText}>Get Started Free</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginBtn}
              onPress={() => navigation.navigate("SignIn")}
            >
              <Text style={styles.loginBtnText}>Owner Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ANALYTICS PREVIEW CARDS */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.iconCircle, { backgroundColor: '#CCFBF1' }]}>
              <Ionicons name="cash-outline" size={20} color="#0F766E" />
            </View>
            <Text style={styles.statValue}>₹2.4L</Text>
            <Text style={styles.statLabel}>Sales</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.iconCircle, { backgroundColor: '#E0F2FE' }]}>
              <Ionicons name="medkit-outline" size={20} color="#0EA5E9" />
            </View>
            <Text style={styles.statValue}>1,250+</Text>
            <Text style={styles.statLabel}>Items</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.iconCircle, { backgroundColor: '#F0FDF4' }]}>
              <Ionicons name="trending-up-outline" size={20} color="#10B981" />
            </View>
            <Text style={styles.statValue}>+18%</Text>
            <Text style={styles.statLabel}>Profit</Text>
          </View>
        </View>

        {/* AI INSIGHTS SECTION */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="sparkles" size={20} color="#0F766E" />
            <Text style={styles.sectionTitle}>AI Demand Prediction</Text>
          </View>
          <Text style={styles.sectionSubtext}>Our AI analyzes your history to predict upcoming shortages.</Text>
          
          <View style={styles.aiPredictionCard}>
            <View style={styles.aiRow}>
              <Text style={styles.aiMedName}>Paracetamol 500mg</Text>
              <Text style={styles.aiTagHigh}>High Demand Expected</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: '85%' }]} />
            </View>
            <Text style={styles.aiAdvice}>Stock up 20% more for next week.</Text>
          </View>
        </View>

        {/* CORE FEATURES LIST */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why Choose Medbill?</Text>
          {[
            { t: "QR/Barcode Billing", d: "Scan and bill in under 5 seconds.", i: "scan-outline" },
            { t: "Expiry Alerts", d: "Get notified before medicines expire.", i: "time-outline" },
            { t: "Digital Receipts", d: "Send PDF bills via WhatsApp/SMS.", i: "document-text-outline" },
            { t: "Cloud Sync", d: "Access your data from any device.", i: "cloud-done-outline" },
          ].map((item, i) => (
            <View key={i} style={styles.featureItem}>
              <Ionicons name={item.i as any} size={22} color="#0F766E" />
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{item.t}</Text>
                <Text style={styles.featureDesc}>{item.d}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* FAQ SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          {[
            { q: "Is my data secure?", a: "Yes, we use industry-standard AES encryption to protect your inventory and sales data." },
            { q: "Can I use it offline?", a: "Billing works offline and syncs automatically when you go online." },
            { q: "Does it support GST?", a: "Fully compliant with GST reporting and HSN code tracking." }
          ].map((faq, index) => (
            <TouchableOpacity key={index} style={styles.faqItem} onPress={() => toggleFaq(index)}>
              <View style={styles.faqHeader}>
                <Text style={styles.faqQuestion}>{faq.q}</Text>
                <Ionicons name={activeFaq === index ? "remove" : "add"} size={20} color="#64748B" />
              </View>
              {activeFaq === index && <Text style={styles.faqAnswer}>{faq.a}</Text>}
            </TouchableOpacity>
          ))}
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <View style={styles.socialRow}>
            <Ionicons name="logo-whatsapp" size={24} color="#64748B" style={{ marginRight: 20 }} />
            <Ionicons name="logo-facebook" size={24} color="#64748B" style={{ marginRight: 20 }} />
            <Ionicons name="mail-outline" size={24} color="#64748B" />
          </View>
          <Text style={styles.footerText}>© 2026 Medbill Technologies</Text>
          <Text style={styles.footerSubText}>Made for Indian Pharmacists 🇮🇳</Text>
        </View>
      </ScrollView>

      {/* FLOATING SUPPORT BUTTON */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => Linking.openURL('mailto:support@medbill.com')}
      >
        <Ionicons name="help-buoy" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

export default LandingPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  hero: {
    alignItems: "center",
    paddingTop: scale(60),
    paddingBottom: scale(40),
    paddingHorizontal: 25,
    backgroundColor: "#E6F7F7",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  badge: {
    backgroundColor: "#CCFBF1",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 15,
  },
  badgeText: {
    color: "#0F766E",
    fontSize: 12,
    fontWeight: "700",
  },
  logo: {
    width: scale(100),
    height: scale(100),
    borderRadius: 50,
    marginBottom: 15,
  },
  title: {
    fontSize: scale(40),
    fontWeight: "900",
    color: "#0F766E",
  },
  subtitle: {
    fontSize: scale(15),
    textAlign: "center",
    color: "#475569",
    lineHeight: 22,
    marginVertical: 15,
  },
  heroActions: {
    width: '100%',
    marginTop: 10,
  },
  signupBtn: {
    backgroundColor: "#14B8A6",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#14B8A6",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  loginBtn: {
    backgroundColor: "transparent",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#0EA5E9",
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
  loginBtnText: {
    color: "#0EA5E9",
    fontSize: 16,
    fontWeight: "800",
  },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 15,
    marginTop: -30,
    justifyContent: "space-between",
  },
  statCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 20,
    alignItems: "center",
    width: "31%",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: scale(16),
    fontWeight: "900",
    color: "#1E293B",
  },
  statLabel: {
    fontSize: scale(11),
    color: "#64748B",
    marginTop: 2,
  },
  section: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 24,
    marginTop: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: scale(18),
    fontWeight: "800",
    color: "#0F766E",
    marginLeft: 8,
  },
  sectionSubtext: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 15,
  },
  aiPredictionCard: {
    backgroundColor: "#F8FAFC",
    padding: 15,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#10B981",
  },
  aiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  aiMedName: {
    fontWeight: '700',
    color: '#334155',
  },
  aiTagHigh: {
    fontSize: 10,
    backgroundColor: '#DCFCE7',
    color: '#166534',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10B981',
  },
  aiAdvice: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 8,
    fontStyle: 'italic',
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  featureContent: {
    marginLeft: 15,
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E293B",
  },
  featureDesc: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingVertical: 15,
  },
  faqHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    flex: 1,
    marginRight: 10,
  },
  faqAnswer: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 10,
    lineHeight: 18,
  },
  footer: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  socialRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  footerText: {
    color: "#475569",
    fontSize: 14,
    fontWeight: "700",
  },
  footerSubText: {
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 5,
  },
  fab: {
    position: "absolute",
    bottom: 25,
    right: 25,
    backgroundColor: "#0F766E",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
  }
});