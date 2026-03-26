import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, SafeAreaView, ScrollView, ActivityIndicator, TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";

const screenWidth = Dimensions.get("window").width;

// --- Interfaces ---
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
  gst_percent: number;
  gst_amount: number;
  offer_percent: number;
  offer_amount: number;
  billAmount: number;
  shopName: string;
  shopPhone: string;
  creatorName: string;
  items: Item[];
  payment: Payment;
}

export default function ReceiptsDashboard() {
  const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
  const API_URL = `${BASE_URL}/api/receipts`;

  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalReceipts, setTotalReceipts] = useState(0);
  const [topMedicines, setTopMedicines] = useState<any[]>([]);
  const [dailyRevenue, setDailyRevenue] = useState<any[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);

  const fetchAnalytics = async () => {
    try {
      const revenueRes = await fetch(`${BASE_URL}/api/analytics/total-revenue`);
      const revenueData = await revenueRes.json();

      const topRes = await fetch(`${BASE_URL}/api/analytics/top-medicines`);
      const topData = await topRes.json();

      const dailyRes = await fetch(`${BASE_URL}/api/analytics/daily-revenue`);
      const dailyData = await dailyRes.json();

      setTotalRevenue(revenueData.total_revenue);
      setTotalReceipts(revenueData.total_receipts);
      setTopMedicines(topData);
      setDailyRevenue(dailyData);
    } catch (e) {
      console.log("Analytics Error:", e);
    }
  };

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL);
      const data = await res.json();
      setReceipts(data);
    } catch (e) {
      console.log("Receipts Error:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchReceiptById = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/${id}`);
      const data = await res.json();
      setSelectedReceipt(data);
      setModalVisible(true);
    } catch (e) {
      console.log("Single Receipt Error:", e);
    }
  };

  useEffect(() => {
    fetchReceipts();
    fetchAnalytics();
  }, []);

  const filteredReceipts = useMemo(() => {
    if (!searchQuery) return receipts;
    const query = searchQuery.toLowerCase();
    return receipts.filter((item) =>
      item.customerName?.toLowerCase().includes(query) ||
      item.customerPhone?.toLowerCase().includes(query) ||
      item.billAmount.toString().includes(query)
    );
  }, [searchQuery, receipts]);

  const renderReceiptItem = ({ item }: { item: Receipt }) => (
    <TouchableOpacity
      style={styles.receiptCard}
      onPress={() => fetchReceiptById(item.id)}
      activeOpacity={0.7}
    >
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
  const handleRefresh = async () => {
    setLoading(true);
    await fetchReceipts();
    await fetchAnalytics();
    setLoading(false);
  };
  const renderHeader = () => (

    <View style={{ marginBottom: 20 }}>
      {/* TOP CARDS */}
      <View style={styles.topRow}>
        <TouchableOpacity style={styles.refreshCard} onPress={handleRefresh}>
          <Ionicons name="refresh" size={24} color="#0F766E" />
          <Text style={styles.cardValue}>Refresh</Text>
        </TouchableOpacity>
        <View style={styles.card}>
          <Ionicons name="wallet-outline" size={22} color="#0F766E" />
          <Text style={styles.cardValue}>₹{totalRevenue.toFixed(2)}</Text>
          <Text style={styles.cardLabel}>Revenue</Text>
        </View>

        <View style={styles.card}>
          <Ionicons name="receipt-outline" size={22} color="#0F766E" />
          <Text style={styles.cardValue}>{totalReceipts}</Text>
          <Text style={styles.cardLabel}>Bills</Text>
        </View>
      </View>

      {/* REVENUE CHART */}
      {dailyRevenue.length > 0 && (
        <View style={{ paddingHorizontal: 5, marginBottom: 20 }}>
          <Text style={[styles.sectionHeading, { marginLeft: 10 }]}>Revenue Trend</Text>
          <LineChart
            data={{
              labels: dailyRevenue.map((d) => d.date.slice(5)), // MM-DD
              datasets: [{ data: dailyRevenue.map((d) => d.revenue) }]
            }}
            width={screenWidth - 42}
            height={180}
            chartConfig={{
              backgroundColor: "#fff",
              backgroundGradientFrom: "#fff",
              backgroundGradientTo: "#fff",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(15, 118, 110, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
              propsForDots: { r: "4", strokeWidth: "2", stroke: "#0F766E" }
            }}
            bezier
            style={{ borderRadius: 12, marginVertical: 8 }}
          />
        </View>
      )}

      <Text style={[styles.sectionHeading, { marginLeft: 10, marginTop: 10 }]}>Recent Receipts</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainerOuter}>
        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Search by name, phone or amount..."
            placeholderTextColor="#9CA3AF"
            style={styles.searchInput}
            value={searchInput}
            onChangeText={setSearchInput}
            returnKeyType="search"
            onSubmitEditing={() => setSearchQuery(searchInput)} // Trigger on keyboard 'Search'
          />
          <TouchableOpacity onPress={() => setSearchQuery(searchInput)}>
            <Ionicons name="search" size={20} color="#0F766E" />
          </TouchableOpacity>
          {searchInput.length > 0 && (
            <TouchableOpacity onPress={() => { setSearchInput(''); setSearchQuery(''); }}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#0F766E" />
        </View>
      ) : (
        <FlatList
          data={filteredReceipts}
          keyExtractor={(item) => item.id}
          renderItem={renderReceiptItem}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
        />
      )}

      {/* MODAL */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedReceipt && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalHeader}>
                  <Text style={styles.shopName}>{selectedReceipt.shopName}</Text>
                  <Text style={styles.subText}>Phone: {selectedReceipt.shopPhone}</Text>
                  <Text style={styles.subText}>Billed by: {selectedReceipt.creatorName}</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.section}>
                  <Text style={styles.sectionHeading}>Customer Details</Text>
                  <Text style={styles.detailText}>Name: {selectedReceipt.customerName}</Text>
                  <Text style={styles.detailText}>Email: {selectedReceipt.customerEmail}</Text>
                  <Text style={styles.detailText}>Phone: {selectedReceipt.customerPhone}</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.section}>
                  <Text style={styles.sectionHeading}>Items Purchased</Text>
                  {selectedReceipt.items.map((item, index) => (
                    <View key={index} style={styles.itemRow}>
                      <View style={{ flex: 2 }}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <Text style={styles.itemQty}>
                          {item.qty} x ₹{item.pricePerUnit.toFixed(2)}
                        </Text>
                      </View>
                      <Text style={styles.itemTotal}>₹{item.total.toFixed(2)}</Text>
                    </View>
                  ))}

                  <View style={styles.taxContainer}>
                    <View style={styles.taxRow}>
                      <Text style={styles.detailText}>GST ({selectedReceipt.gst_percent}%):</Text>
                      <Text style={styles.detailText}>₹{selectedReceipt.gst_amount.toFixed(2)}</Text>
                    </View>
                    <View style={styles.taxRow}>
                      <Text style={styles.detailText}>Offer ({selectedReceipt.offer_percent}%):</Text>
                      <Text style={[styles.detailText, styles.offerText]}>
                        -₹{selectedReceipt.offer_amount.toFixed(2)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Grand Total</Text>
                    <Text style={styles.totalAmount}>
                      ₹{selectedReceipt.billAmount.toFixed(2)}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.section}>
                  <Text style={styles.sectionHeading}>Payment Details</Text>
                  <Text style={styles.detailText}>Method: {selectedReceipt.payment?.method}</Text>
                  <Text style={styles.detailText}>Txn ID: {selectedReceipt.payment?.transactionId}</Text>
                  <Text style={styles.detailText}>Time: {selectedReceipt.payment?.time}</Text>
                </View>

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
  searchContainerOuter: {
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: '#F3F4F6',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
    height: '100%',
  },
 refreshCard: { 
  flex: 1, 
  backgroundColor: '#FFFFFF', 
  padding: 16, 
  borderRadius: 12, 
  marginHorizontal: 4, 
  elevation: 2, 
  shadowColor: '#000', 
  shadowOpacity: 0.05, 
  shadowRadius: 4,
  justifyContent: 'center', 
  alignItems: 'center',    
},
  refreshLabel: {
    fontSize: 12,
    color: '#6B7280', 
    fontWeight: '600',
    marginTop: 4
  },
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
  taxContainer: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  taxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  offerText: {
    color: '#10B981',
    fontWeight: '500'
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  totalLabel: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  totalAmount: { fontSize: 18, fontWeight: 'bold', color: '#0F766E' },

  closeButton: { backgroundColor: '#0F766E', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 24, marginBottom: 12 },
  closeButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 16
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginHorizontal: 5,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4
  },
  cardValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 6,
    color: '#111827'
  },
  cardLabel: {
    fontSize: 12,
    color: '#6B7280'
  },
  medicineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    elevation: 1
  }
});