import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  Alert, Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// --- Types ---
type UserRole = 'Admin' | 'Staff';

interface UserProfile {
  name: string;
  email: string;
  role: UserRole;
  shopName: string;
}

// --- Mock Current User ---
// Change this to 'Staff' to see how the UI adapts!
const currentUser: UserProfile = {
  name: 'Aarav Patel',
  email: 'aarav@medbill.in',
  role: 'Admin', // 'Admin' or 'Staff'
  shopName: 'MedBill Pharmacy Main'
};

export default function SettingsScreen() {
  // --- State for Toggles ---
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [scannerBeep, setScannerBeep] = useState<boolean>(true);
  const [autoPrintReceipt, setAutoPrintReceipt] = useState<boolean>(true);

  const navigation: any = useNavigation();

  // --- Handlers ---
  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log Out", style: "destructive", onPress: () => console.log("Logged out") }
    ]);
  };

  // --- Reusable UI Components ---
  const SectionHeader = ({ title }: { title: string }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  const SettingRow = ({ 
    icon, title, subtitle, onPress, value, onValueChange, isDestructive 
  }: { 
    icon: keyof typeof Ionicons.glyphMap; 
    title: string; 
    subtitle?: string; 
    onPress?: () => void; 
    value?: boolean; 
    onValueChange?: (val: boolean) => void;
    isDestructive?: boolean;
  }) => (
    <TouchableOpacity 
      style={styles.settingRow} 
      onPress={onPress} 
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.settingIconContainer}>
        <Ionicons name={icon} size={22} color={isDestructive ? '#EF4444' : '#4B5563'} />
      </View>
      <View style={styles.settingTextContainer}>
        <Text style={[styles.settingTitle, isDestructive && styles.destructiveText]}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      
      {/* Render Switch if onValueChange is provided, else render Arrow */}
      {onValueChange ? (
        <Switch 
          value={value} 
          onValueChange={onValueChange} 
          trackColor={{ false: '#D1D5DB', true: '#0F766E' }}
          thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : (value ? '#FFFFFF' : '#F3F4F6')}
        />
      ) : (
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{currentUser.name.charAt(0)}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{currentUser.name}</Text>
            <Text style={styles.profileEmail}>{currentUser.email}</Text>

            <View style={[styles.roleBadge, currentUser.role === 'Admin' ? styles.adminBadge : styles.staffBadge]}>
              <Ionicons 
                name={currentUser.role === 'Admin' ? 'shield-checkmark' : 'person'} 
                size={12} 
                color={currentUser.role === 'Admin' ? '#D97706' : '#0284C7'} 
                style={{ marginRight: 4 }}
              />
              <Text style={[styles.roleText, currentUser.role === 'Admin' ? styles.adminText : styles.staffText]}>
                {currentUser.role}
                <Text style={styles.shopText}> • {currentUser.shopName}</Text>
              </Text>
            </View>
          </View>
        </View>

        {/* Admin Only Section: Shop & Staff Management */}
        {currentUser.role === 'Admin' && (
          <View style={styles.section}>
            <SectionHeader title="Shop Administration" />
            <View style={styles.card}>
              <SettingRow 
                icon="business-outline" 
                title="Shop Profile & GST" 
                subtitle="Manage tax details and address"
                onPress={() => navigation.navigate("ShopProfileSettings")} 
              />
              <View style={styles.divider} />
              <SettingRow 
                icon="people-outline" 
                title="Staff Management" 
                subtitle="Add cashiers and manage permissions"
                onPress={() => navigation.navigate("StaffManagementScreen")} 
              />
              <View style={styles.divider} />
              <SettingRow 
                icon="bar-chart-outline" 
                title="Detailed Analytics" 
                subtitle="Export monthly revenue reports"
                onPress={() => console.log('Go to Analytics')} 
              />
            </View>
          </View>
        )}

        {/* Utility & Hardware Settings */}
        <View style={styles.section}>
          <SectionHeader title="Hardware & Utility" />
          <View style={styles.card}>
            <SettingRow 
              icon="print-outline" 
              title="Receipt Printer" 
              subtitle="Connect via Bluetooth or Wi-Fi"
              onPress={() => navigation.navigate('PrinterSetup')} 
            />
            <View style={styles.divider} />
            <SettingRow 
              icon="volume-high-outline" 
              title="Scanner Beep Sound" 
              value={scannerBeep}
              onValueChange={setScannerBeep} 
            />
            <View style={styles.divider} />
            <SettingRow 
              icon="document-text-outline" 
              title="Auto-Print on Checkout" 
              value={autoPrintReceipt}
              onValueChange={setAutoPrintReceipt} 
            />
          </View>
        </View>

        {/* App Preferences */}
        <View style={styles.section}>
          <SectionHeader title="App Preferences" />
          <View style={styles.card}>
            <SettingRow 
              icon="moon-outline" 
              title="Dark Mode" 
              value={isDarkMode}
              onValueChange={setIsDarkMode} 
            />
            <View style={styles.divider} />
            <SettingRow 
              icon="lock-closed-outline" 
              title="Change Password" 
              onPress={() => console.log('Go to Change Password')} 
            />
          </View>
        </View>

        {/* Footer Actions */}
        <View style={styles.section}>
          <View style={styles.card}>
            <SettingRow 
              icon="help-circle-outline" 
              title="Help & Support" 
              onPress={() => console.log('Go to Support')} 
            />
            <View style={styles.divider} />
            <SettingRow 
              icon="log-out-outline" 
              title="Log Out" 
              isDestructive={true}
              onPress={handleLogout} 
            />
          </View>
        </View>

        <Text style={styles.versionText}>MedBill App v1.0.0</Text>

      </ScrollView>
    </SafeAreaView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  
  // Profile Header
  profileHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, paddingHorizontal: 8 },
  avatarCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#0F766E', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  avatarText: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  profileEmail: { fontSize: 14, color: '#6B7280', marginBottom: 6 },
  
  // roleBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  roleBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, flexDirection: 'row', alignItems: 'center', },
  adminBadge: { backgroundColor: '#FEF3C7' },
  adminText: { color: '#D97706', fontSize: 12, fontWeight: '600' },
  staffBadge: { backgroundColor: '#E0F2FE' },
  staffText: { color: '#0284C7', fontSize: 12, fontWeight: '600' },

  // Sections
  section: { marginBottom: 24 },
  sectionHeader: { fontSize: 14, fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', marginBottom: 8, marginLeft: 8 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, overflow: 'hidden', elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3 },
  
  // Setting Row
  settingRow: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#FFFFFF' },
  settingIconContainer: { width: 36, alignItems: 'flex-start' },
  settingTextContainer: { flex: 1, paddingRight: 16 },
  settingTitle: { fontSize: 16, color: '#1F2937', fontWeight: '500' },
  settingSubtitle: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  destructiveText: { color: '#EF4444' },
  
  divider: { height: 1, backgroundColor: '#E5E7EB', marginLeft: 18, marginRight: 18 },
  
  versionText: { textAlign: 'center', color: '#9CA3AF', fontSize: 12, marginTop: 8 },
  roleText: {fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
  shopText: { fontWeight: '400', opacity: 0.8, }
});