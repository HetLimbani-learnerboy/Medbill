import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Linking, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  { id: '1', question: 'How do I add a new cashier?', answer: 'Go to Settings > Staff Management. Tap the floating "+" button, enter their details, select "Cashier" as the role, and save.' },
  { id: '2', question: 'My barcode scanner is not working.', answer: 'Ensure you have granted Camera permissions to the MedBill app. If using an external Bluetooth scanner, verify it is paired in your device settings.' },
  { id: '3', question: 'How do I process a return/refund?', answer: 'Currently, returns are processed by opening the specific receipt in the Dashboard and clicking "Issue Refund" (Admin only).' },
];

export default function SupportScreen() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleContact = (method: 'phone' | 'email') => {
    if (method === 'phone') Linking.openURL('tel:+918000011111');
    if (method === 'email') Linking.openURL('mailto:support@medbill.in');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Contact Cards */}
        <Text style={styles.sectionTitle}>Contact Us</Text>
        <View style={styles.contactRow}>
          <TouchableOpacity style={styles.contactCard} onPress={() => handleContact('phone')}>
            <View style={[styles.iconBg, { backgroundColor: '#E0E7FF' }]}>
              <Ionicons name="call" size={24} color="#4F46E5" />
            </View>
            <Text style={styles.contactTitle}>Call Support</Text>
            <Text style={styles.contactSub}>Mon-Sat, 9AM-6PM</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactCard} onPress={() => handleContact('email')}>
            <View style={[styles.iconBg, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="mail" size={24} color="#D97706" />
            </View>
            <Text style={styles.contactTitle}>Email Us</Text>
            <Text style={styles.contactSub}>Replies in 24 hrs</Text>
          </TouchableOpacity>
        </View>

        {/* FAQs */}
        <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Frequently Asked Questions</Text>
        <View style={styles.faqContainer}>
          {faqs.map((faq, index) => (
            <View key={faq.id} style={[styles.faqItem, index !== faqs.length - 1 && styles.faqBorder]}>
              <TouchableOpacity style={styles.faqQuestionRow} onPress={() => toggleExpand(faq.id)}>
                <Text style={styles.faqQuestion}>{faq.question}</Text>
                <Ionicons name={expandedId === faq.id ? "chevron-up" : "chevron-down"} size={20} color="#6B7280" />
              </TouchableOpacity>
              {expandedId === faq.id && (
                <Text style={styles.faqAnswer}>{faq.answer}</Text>
              )}
            </View>
          ))}
        </View>

        {/* Report Issue Button */}
        <TouchableOpacity style={styles.reportBtn}>
          <Ionicons name="bug-outline" size={20} color="#EF4444" style={{marginRight: 8}} />
          <Text style={styles.reportBtnText}>Report a Bug or Issue</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  scrollContent: { padding: 16 },
  
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#4B5563', textTransform: 'uppercase', marginBottom: 12, marginLeft: 4 },
  
  contactRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  contactCard: { width: '48%', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, alignItems: 'center', elevation: 1 },
  iconBg: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  contactTitle: { fontSize: 15, fontWeight: 'bold', color: '#1F2937', marginBottom: 4 },
  contactSub: { fontSize: 12, color: '#6B7280' },

  faqContainer: { backgroundColor: '#FFFFFF', borderRadius: 12, elevation: 1, overflow: 'hidden', marginBottom: 32 },
  faqItem: { padding: 16 },
  faqBorder: { borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  faqQuestionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQuestion: { flex: 1, fontSize: 15, fontWeight: '500', color: '#1F2937', paddingRight: 16 },
  faqAnswer: { marginTop: 12, fontSize: 14, color: '#4B5563', lineHeight: 20 },

  reportBtn: { flexDirection: 'row', backgroundColor: '#FEE2E2', padding: 16, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  reportBtnText: { color: '#EF4444', fontWeight: 'bold', fontSize: 16 }
});