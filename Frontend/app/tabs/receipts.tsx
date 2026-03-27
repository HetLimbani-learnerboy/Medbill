import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Modal, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { captureRef } from 'react-native-view-shot';

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

  // --- Add these to your state variables ---
	const [fromDate, setFromDate] = useState<Date | null>(null);
	const [toDate, setToDate] = useState<Date | null>(null);
	const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
	const [datePickerType, setDatePickerType] = useState<'from' | 'to'>('from');

	// For Printing
  const receiptRef = useRef(null);

  const handleShareReceiptUI = async () => {
    try {
      // This captures the exact UI of the View we attach the ref to
      const localUri = await captureRef(receiptRef, {
        format: 'png',
        quality: 1,
      });

      // Opens the native share sheet to save to photos, send via WhatsApp, etc.
      await Sharing.shareAsync(localUri);
    } catch (e) {
      console.log("Screenshot failed", e);
    }
  };

	//  Helper Functions for date picker
const openDatePicker = (type: 'from' | 'to') => {
  setDatePickerType(type);
  setShowDatePicker(true);
};

const handleDateChange = (event: any, selectedDate?: Date) => {
  setShowDatePicker(Platform.OS === 'ios'); // Keep open on iOS, close on Android
  if (selectedDate) {
    if (datePickerType === 'from') {
      setFromDate(selectedDate);
    } else {
      setToDate(selectedDate);
    }
  }
  if (Platform.OS === 'android') {
    setShowDatePicker(false);
  }
};

const clearDates = () => {
  setFromDate(null);
  setToDate(null);
};

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
    <View>
      <Text style={[styles.sectionTitle, { marginLeft: 10, marginTop: 10, marginBottom: 20 }]}>Recent Receipts</Text>
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

      {/* NEW: Date Filters */}
      <View style={styles.dateFilterRow}>
        <TouchableOpacity 
          style={styles.dateInput} 
          onPress={() => openDatePicker('from')}
        >
          <Ionicons name="calendar-outline" size={18} color={fromDate ? "#0F766E" : "#9CA3AF"} />
          <Text style={[styles.dateText, fromDate && styles.dateTextActive]}>
            {fromDate ? fromDate.toLocaleDateString('en-IN') : 'From Date'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.dateSeparator}></Text>

        <TouchableOpacity 
          style={styles.dateInput} 
          onPress={() => openDatePicker('to')}
        >
          <Ionicons name="calendar-outline" size={18} color={toDate ? "#0F766E" : "#9CA3AF"} />
          <Text style={[styles.dateText, toDate && styles.dateTextActive]}>
            {toDate ? toDate.toLocaleDateString('en-IN') : 'To Date'}
          </Text>
        </TouchableOpacity>

        {/* Clear Button (only shows if a date is selected) */}
        {(fromDate || toDate) && (
          <TouchableOpacity onPress={clearDates} style={styles.clearDateBtn}>
             <Ionicons name="close-circle" size={20} color="#EF4444" />
          </TouchableOpacity>
        )}
      </View>

      {/* Native Date Picker Component */}
      {/* Native Date Picker Component */}
      {Platform.OS === 'ios' ? (
        <Modal visible={showDatePicker} transparent animationType="slide">
          {/* Dark background overlay */}
          <View style={styles.datePickerModalOverlay}>
            <View style={styles.datePickerModalContent}>
              
              {/* Header with a Done button */}
              <View style={styles.datePickerHeader}>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.datePickerDoneText}>Done</Text>
                </TouchableOpacity>
              </View>

              {/* The actual spinner wheel */}
              <DateTimePicker
                value={(datePickerType === 'from' ? fromDate : toDate) || new Date()}
                mode="date"
                display="spinner" // Forces the classic wheel look on iOS
                onChange={handleDateChange}
                maximumDate={new Date()}
                textColor="#111827"
              />
            </View>
          </View>
        </Modal>
      ) : (
        // Android handles its own popup dialog automatically!
        showDatePicker && (
          <DateTimePicker
            value={(datePickerType === 'from' ? fromDate : toDate) || new Date()}
            mode="date"
            display="default"
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )
      )}

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
                
                {/* --- WRAPPER FOR SCREENSHOT --- */}
                <View 
                  ref={receiptRef} 
                  collapsable={false} 
                  style={{ backgroundColor: '#FFFFFF', padding: 10 }}
                >
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

                    <View style={styles.calculationContainer}>
                      <View style={styles.calcRow}>
                          <Text style={styles.calcLabel}>GST ({selectedReceipt.gst_percent}%)</Text>
                          <Text style={styles.calcValue}>₹{selectedReceipt.gst_amount.toFixed(2)}</Text>
                      </View>
                      <View style={styles.calcRow}>
                          <Text style={styles.calcLabel}>Offer ({selectedReceipt.offer_percent}%)</Text>
                          <Text style={[styles.calcValue, styles.offerValue]}>
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
                </View>
                {/* --- END OF WRAPPER --- */}

                {/* Updated Action Buttons */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
                  <TouchableOpacity
                    style={[styles.closeButton, { flex: 1, marginRight: 8, backgroundColor: '#CCFBF1' }]}
                    onPress={handleShareReceiptUI}
                  >
                    <Text style={[styles.closeButtonText, { color: '#0F766E' }]}>Download/Print</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.closeButton, { flex: 1, marginLeft: 8 }]}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.closeButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>

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
        paddingBottom: 10,
        backgroundColor: '#F3F4F6',
    },

    // --- iOS Date Picker Modal Styles ---
    datePickerModalOverlay: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0,0,0,0.4)', // Dims the background
    },
    datePickerModalContent: {
      backgroundColor: '#FFFFFF',
      paddingBottom: 0, // Safe area padding
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
    },
    datePickerHeader: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      padding: 16,
      backgroundColor: '#F3F4F6',
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#E5E7EB',
    },
    datePickerDoneText: {
      color: '#0F766E',
      fontWeight: 'bold',
      fontSize: 16,
    },

		// --- Date Filter Styles ---
		dateFilterRow: {
      flexDirection: 'row',
			alignItems: 'center',
			paddingHorizontal: 16,
			marginBottom: 16,
		},
		dateInput: {
      borderRadius: 12,
      paddingHorizontal: 12,
      height: 50,
			flex: 1,
			flexDirection: 'row',
			alignItems: 'center',
			backgroundColor: '#FFFFFF',
			borderWidth: 1,
			borderColor: '#D1D5DB',
			paddingVertical: 10,
		},
		dateText: {
			fontSize: 14,
			color: '#9CA3AF',
			marginLeft: 8,
		},
		dateTextActive: {
			color: '#111827',
			fontWeight: '500',
		},
		dateSeparator: {
			marginHorizontal: 8,
			color: '#6B7280',
			fontWeight: 'bold',
		},
		clearDateBtn: {
			marginLeft: 8,
			padding: 4,
		},

    // --- Calculation Area Styles (GST & Offers) ---
    calculationContainer: { 
        marginTop: 8, 
        paddingTop: 12, 
        borderTopWidth: 1, 
        borderTopColor: '#F3F4F6' // Very subtle separator after items
    },
    calcRow: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        marginBottom: 4 
    },
    calcLabel: { 
        fontSize: 14, 
        color: '#6B7280', // Muted text for labels
        fontWeight: '400'
    },
    calcValue: { 
        fontSize: 14, 
        fontWeight: '500', 
        color: '#374151' 
    },
    offerValue: { 
        color: '#10B981', // A pleasant green to indicate savings
        fontWeight: '600'
    },
    // Add these inside your styles = StyleSheet.create({ ... })
    statsContainer: { 
        marginTop: -12,
        marginBottom: 10, 
        paddingHorizontal: 8 
    },
    headerTitleRow: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 12 
    },
    sectionTitle: { 
        fontSize: 18, 
        fontWeight: '700', 
        color: '#111827' 
    },
    statsRow: { 
        flexDirection: 'row', 
        justifyContent: 'space-between' 
    },
    statCard: { 
        flex: 1, 
        backgroundColor: '#FFFFFF', 
        padding: 16, 
        borderRadius: 12, 
        marginHorizontal: 4, 
        elevation: 2, 
        shadowColor: '#000', 
        shadowOpacity: 0.05, 
        shadowRadius: 4 
    },
    statValue: { 
        fontSize: 22, 
        fontWeight: 'bold', 
        color: '#111827', 
        marginTop: 8 
    },
    statLabel: { 
        fontSize: 12, 
        color: '#6B7280', 
        marginTop: 4 
    },
    statTrendUp: { 
        fontSize: 11, 
        color: '#10B981', 
        marginTop: 8, 
        fontWeight: '500' 
    },
    sectionHeading: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#374151',
        marginBottom: 8,
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
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#E5E7EB', marginBottom: -6 },
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
  },
});