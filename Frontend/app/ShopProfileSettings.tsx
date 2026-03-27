import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  SafeAreaView, ScrollView, KeyboardAvoidingView, Platform, Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// --- Interfaces ---
interface ShopDetails {
  shopName: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  gstin: string;
  drugLicenseNo: string;
}

export default function ShopProfileScreen() {
  const [shopDetails, setShopDetails] = useState<ShopDetails>({
    shopName: 'MedBill Pharmacy Main',
    ownerName: 'Aarav Patel',
    phone: '+91 80000 11111',
    email: 'contact@medbill.in',
    address: '123 Health Avenue, Science City Road, Ahmedabad',
    gstin: '24AAAAA0000A1Z5',
    drugLicenseNo: 'GJ-AHD-123456'
  });

  const handleSave = () => {
    // Here you would typically dispatch to Redux or make an API call
    Alert.alert("Success", "Shop profile updated successfully!");
  };

  const InputField = ({ label, value, onChangeText, placeholder, keyboardType = 'default' }: any) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={styles.textInput}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        keyboardType={keyboardType}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Ionicons name="business" size={32} color="#0F766E" />
            </View>
            <Text style={styles.headerTitle}>Shop Information</Text>
            <Text style={styles.headerSubtitle}>Manage your public business details</Text>
          </View>

          <View style={styles.card}>
            <InputField 
              label="Shop Name" 
              value={shopDetails.shopName} 
              onChangeText={(t: string) => setShopDetails({...shopDetails, shopName: t})} 
            />
            <InputField 
              label="Owner Name" 
              value={shopDetails.ownerName} 
              onChangeText={(t: string) => setShopDetails({...shopDetails, ownerName: t})} 
            />
            <InputField 
              label="Contact Phone" 
              value={shopDetails.phone} 
              onChangeText={(t: string) => setShopDetails({...shopDetails, phone: t})} 
              keyboardType="phone-pad"
            />
            <InputField 
              label="Email Address" 
              value={shopDetails.email} 
              onChangeText={(t: string) => setShopDetails({...shopDetails, email: t})} 
              keyboardType="email-address"
            />
            <InputField 
              label="Full Address" 
              value={shopDetails.address} 
              onChangeText={(t: string) => setShopDetails({...shopDetails, address: t})} 
            />
          </View>

          <View style={styles.header}>
            <Text style={styles.headerTitle}>Legal & Tax Details</Text>
          </View>

          <View style={styles.card}>
            <InputField 
              label="GSTIN Number" 
              value={shopDetails.gstin} 
              onChangeText={(t: string) => setShopDetails({...shopDetails, gstin: t})} 
            />
            <InputField 
              label="Drug License Number" 
              value={shopDetails.drugLicenseNo} 
              onChangeText={(t: string) => setShopDetails({...shopDetails, drugLicenseNo: t})} 
            />
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 20, marginTop: 10 },
  iconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#CCFBF1', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  headerSubtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 24, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4 },
  inputContainer: { marginBottom: 16 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#4B5563', marginBottom: 6 },
  textInput: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 12, fontSize: 16, color: '#1F2937', backgroundColor: '#F9FAFB' },
  saveButton: { backgroundColor: '#0F766E', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  saveButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }
});