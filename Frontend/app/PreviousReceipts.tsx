import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, Modal, Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import RevenueChart from './RevenueChart';

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

  useEffect(() => {
    fetchReceipts();
    fetchAnalytics();
  }, []);

  const handleDownloadRange = () => {
    console.log("Donload started...")
  }

  return (
    <SafeAreaView style={styles.container}>


      <View style={styles.statsContainer}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.sectionTitle}>This Month's Overview</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="receipt-outline" size={24} color="#0F766E" />
            <Text style={styles.statValue}>{totalReceipts}</Text>
            <Text style={styles.statLabel}>Bills Generated</Text>
            {/* Note: These percentages are static for now. You can link them to API data later! */}
            <Text style={styles.statTrendUp}>↑ 12% vs last month</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="wallet-outline" size={24} color="#0F766E" />
            <Text style={styles.statValue}>₹{totalRevenue.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Total Revenue</Text>
            <Text style={styles.statTrendUp}>↑ 8% vs last month</Text>
          </View>
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#0F766E" />
        </View>
      ) : (
        <RevenueChart />
      )}
      {/* NEW: Date Filters */}
      <View style={styles.headerTitleRow}>
        <Text style={styles.sectionTitle}>Custom Period Report</Text>
        <TouchableOpacity 
          style={[styles.downloadReportBtn, (!fromDate || !toDate) && styles.downloadReportBtnDisabled]} 
          onPress={handleDownloadRange} // Replace with your actual download function
          disabled={!fromDate || !toDate} // Prevents tapping if dates aren't picked
        >
          <Ionicons 
            name="download-outline" 
            size={18} 
            color={(!fromDate || !toDate) ? "#9CA3AF" : "#FFFFFF"} 
          />
          <Text style={[styles.downloadReportText, (!fromDate || !toDate) && styles.downloadReportTextDisabled]}>
            Download
          </Text>
        </TouchableOpacity>
      </View>
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

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F4F6' },
    listContent: { padding: 16 },

    headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Pushes title left, button right
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  downloadReportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F766E', // Matches your active calendar icon color
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4, // Adds a small space between the icon and text
  },
  downloadReportBtnDisabled: {
    backgroundColor: '#E5E7EB', // Gray background when disabled
  },
  downloadReportText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  downloadReportTextDisabled: {
    color: '#9CA3AF', // Gray text when disabled
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

    // Add these inside your styles = StyleSheet.create({ ... })
    statsContainer: { 
        marginTop: 20,
        marginBottom: 10, 
        paddingHorizontal: 8 
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