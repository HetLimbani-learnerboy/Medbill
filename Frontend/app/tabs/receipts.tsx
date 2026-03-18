import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, SafeAreaView, ScrollView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// --- TypeScript Interfaces ---
interface Item {
  name: string;
  qty: number;
  pricePerUnit: number;
  total: number;
}

interface Payment {
  method: string;
  transactionId: string;
  customerId: string;
  time: string;
}

interface Receipt {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  dateTime: string;
  billAmount: number;
  shopName: string;
  shopPhone: string;
  creatorName: string;
  items: Item[];
  payment: Payment;
}

// --- Dummy Data ---
const dummyReceipts: Receipt[] = [
  {
    id: '1',
    customerName: 'Aarav Patel',
    customerEmail: 'aarav.p@example.com',
    customerPhone: '+91 98765 43210',
    dateTime: '17 Mar 2026, 10:30 AM',
    billAmount: 1450.00,
    shopName: 'MedBill Pharmacy',
    shopPhone: '+91 80000 11111',
    creatorName: 'Rohan (Cashier)',
    items: [
      { name: 'Paracetamol 500mg', qty: 2, pricePerUnit: 50, total: 100 },
      { name: 'Vitamin C Supplements', qty: 1, pricePerUnit: 350, total: 350 },
      { name: 'Whey Protein 1kg', qty: 1, pricePerUnit: 1000, total: 1000 },
    ],
    payment: {
      method: 'UPI',
      transactionId: 'UPI9876543210XZ',
      customerId: 'aarav@okicici',
      time: '17 Mar 2026, 10:31 AM'
    }
  },
  {
    id: '2',
    customerName: 'Priya Sharma',
    customerEmail: 'priya.s@example.com',
    customerPhone: '+91 91234 56789',
    dateTime: '16 Mar 2026, 04:15 PM',
    billAmount: 850.50,
    shopName: 'MedBill Pharmacy',
    shopPhone: '+91 80000 11111',
    creatorName: 'Aditi (Cashier)',
    items: [
      { name: 'Cough Syrup', qty: 1, pricePerUnit: 120.50, total: 120.50 },
      { name: 'First Aid Kit', qty: 1, pricePerUnit: 730, total: 730 },
    ],
    payment: {
      method: 'Credit Card',
      transactionId: 'TXN-CC-445566',
      customerId: 'Visa ending in 4012',
      time: '16 Mar 2026, 04:16 PM'
    }
  }
];

export default function ReceiptsDashboard() {
  // Added type definitions to state
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);

  const openReceipt = (receipt: Receipt) => {
    setSelectedReceipt(receipt);
    setModalVisible(true);
  };

  // --- UI Components ---
  const renderHeader = () => (
    <View style={styles.statsContainer}>
      <Text style={styles.sectionTitle}>This Month's Overview</Text>
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Ionicons name="receipt-outline" size={24} color="#0F766E" />
          <Text style={styles.statValue}>342</Text>
          <Text style={styles.statLabel}>Bills Generated</Text>
          <Text style={styles.statTrendUp}>↑ 12% vs last mo</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="wallet-outline" size={24} color="#0F766E" />
          <Text style={styles.statValue}>₹45,200</Text>
          <Text style={styles.statLabel}>Total Revenue</Text>
          <Text style={styles.statTrendUp}>↑ 8% vs last mo</Text>
        </View>
      </View>
    </View>
  );

  // Typed the item prop destructured from FlatList
  const renderReceiptItem = ({ item }: { item: Receipt }) => (
    <TouchableOpacity style={styles.receiptCard} onPress={() => openReceipt(item)} activeOpacity={0.7}>
      <View style={styles.receiptHeader}>
        <Text style={styles.customerName}>{item.customerName}</Text>
        <Text style={styles.billAmount}>₹{item.billAmount.toFixed(2)}</Text>
      </View>
      <View style={styles.receiptFooter}>
        <Text style={styles.dateTime}>{item.dateTime}</Text>
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={dummyReceipts}
        keyExtractor={(item) => item.id}
        renderItem={renderReceiptItem}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Detailed Receipt Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedReceipt && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Shop Info */}
                <View style={styles.modalHeader}>
                  <Text style={styles.shopName}>{selectedReceipt.shopName}</Text>
                  <Text style={styles.subText}>Phone: {selectedReceipt.shopPhone}</Text>
                  <Text style={styles.subText}>Billed by: {selectedReceipt.creatorName}</Text>
                </View>

                <View style={styles.divider} />

                {/* Customer Info */}
                <View style={styles.section}>
                  <Text style={styles.sectionHeading}>Customer Details</Text>
                  <Text style={styles.detailText}>Name: {selectedReceipt.customerName}</Text>
                  <Text style={styles.detailText}>Email: {selectedReceipt.customerEmail}</Text>
                  <Text style={styles.detailText}>Phone: {selectedReceipt.customerPhone}</Text>
                </View>

                <View style={styles.divider} />

                {/* Items List */}
                <View style={styles.section}>
                  <Text style={styles.sectionHeading}>Items Purchased</Text>
                  {selectedReceipt.items.map((item, index) => (
                    <View key={index} style={styles.itemRow}>
                      <View style={{flex: 2}}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <Text style={styles.itemQty}>{item.qty} x ₹{item.pricePerUnit.toFixed(2)}</Text>
                      </View>
                      <Text style={styles.itemTotal}>₹{item.total.toFixed(2)}</Text>
                    </View>
                  ))}
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Grand Total</Text>
                    <Text style={styles.totalAmount}>₹{selectedReceipt.billAmount.toFixed(2)}</Text>
                  </View>
                </View>

                <View style={styles.divider} />

                {/* Payment Info */}
                <View style={styles.section}>
                  <Text style={styles.sectionHeading}>Payment Details</Text>
                  <Text style={styles.detailText}>Method: {selectedReceipt.payment.method}</Text>
                  <Text style={styles.detailText}>Txn ID: {selectedReceipt.payment.transactionId}</Text>
                  <Text style={styles.detailText}>A/C: {selectedReceipt.payment.customerId}</Text>
                  <Text style={styles.detailText}>Time: {selectedReceipt.payment.time}</Text>
                </View>

                {/* Close Button */}
                <TouchableOpacity 
                  style={styles.closeButton} 
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Close Receipt</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  listContent: { padding: 16 },
  
  statsContainer: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 12 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statCard: { flex: 1, backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, marginHorizontal: 4, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4 },
  statValue: { fontSize: 22, fontWeight: 'bold', color: '#111827', marginTop: 8 },
  statLabel: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  statTrendUp: { fontSize: 11, color: '#10B981', marginTop: 8, fontWeight: '500' },

  receiptCard: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, marginBottom: 12, elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3 },
  receiptHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  customerName: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  billAmount: { fontSize: 16, fontWeight: '700', color: '#0F766E' },
  receiptFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateTime: { fontSize: 13, color: '#6B7280' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '90%' },
  modalHeader: { alignItems: 'center', marginBottom: 16 },
  shopName: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  subText: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 16 },
  
  section: { marginBottom: 8 },
  sectionHeading: { fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 12 },
  detailText: { fontSize: 14, color: '#4B5563', marginBottom: 6 },
  
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  itemName: { fontSize: 14, fontWeight: '500', color: '#1F2937' },
  itemQty: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  itemTotal: { fontSize: 14, fontWeight: '600', color: '#111827' },
  
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  totalLabel: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  totalAmount: { fontSize: 18, fontWeight: 'bold', color: '#0F766E' },

  closeButton: { backgroundColor: '#0F766E', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 24, marginBottom: 12 },
  closeButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' }
});