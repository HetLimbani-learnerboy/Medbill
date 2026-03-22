import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, 
  Modal, TextInput, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// --- Interfaces ---
type Role = 'Admin' | 'Cashier';

interface StaffMember {
  id: string;
  name: string;
  role: Role;
  phone: string;
  status: 'Active' | 'Inactive';
}

const initialStaff: StaffMember[] = [
  { id: '1', name: 'Aarav Patel', role: 'Admin', phone: '+91 80000 11111', status: 'Active' },
  { id: '2', name: 'Rohan Sharma', role: 'Cashier', phone: '+91 98765 43210', status: 'Active' },
  { id: '3', name: 'Aditi Desai', role: 'Cashier', phone: '+91 91234 56789', status: 'Inactive' },
];

export default function StaffManagementScreen() {
  const [staffList, setStaffList] = useState<StaffMember[]>(initialStaff);
  const [modalVisible, setModalVisible] = useState(false);
  
  // New Staff Form State
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState<Role>('Cashier');

  const handleAddStaff = () => {
    if (!newName || !newPhone) return;
    const newStaff: StaffMember = {
      id: Math.random().toString(),
      name: newName,
      phone: newPhone,
      role: newRole,
      status: 'Active'
    };
    setStaffList([newStaff, ...staffList]);
    setModalVisible(false);
    setNewName(''); setNewPhone(''); setNewRole('Cashier');
  };

  const renderStaffCard = ({ item }: { item: StaffMember }) => (
    <View style={styles.card}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.phone}>{item.phone}</Text>
        <View style={styles.badges}>
          <View style={[styles.badge, item.role === 'Admin' ? styles.adminBadge : styles.cashierBadge]}>
            <Text style={styles.badgeText}>{item.role}</Text>
          </View>
          <View style={[styles.badge, item.status === 'Active' ? styles.activeBadge : styles.inactiveBadge]}>
            <Text style={[styles.badgeText, item.status === 'Inactive' && { color: '#9CA3AF' }]}>{item.status}</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity style={styles.editBtn}>
        <Ionicons name="ellipsis-vertical" size={20} color="#6B7280" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={staffList}
        keyExtractor={(item) => item.id}
        renderItem={renderStaffCard}
        contentContainerStyle={styles.listContent}
      />

      {/* Floating Add Button */}
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Ionicons name="person-add" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Add Staff Modal */}
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add New Staff</Text>
              
              <Text style={styles.label}>Full Name</Text>
              <TextInput style={styles.input} value={newName} onChangeText={setNewName} placeholder="e.g., Priya Kumar" />
              
              <Text style={styles.label}>Phone Number</Text>
              <TextInput style={styles.input} value={newPhone} onChangeText={setNewPhone} placeholder="+91" keyboardType="phone-pad" />
              
              <Text style={styles.label}>Assign Role</Text>
              <View style={styles.roleSelector}>
                <TouchableOpacity 
                  style={[styles.roleOption, newRole === 'Cashier' && styles.roleOptionActive]}
                  onPress={() => setNewRole('Cashier')}
                >
                  <Text style={[styles.roleOptionText, newRole === 'Cashier' && styles.roleOptionTextActive]}>Cashier</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.roleOption, newRole === 'Admin' && styles.roleOptionActive]}
                  onPress={() => setNewRole('Admin')}
                >
                  <Text style={[styles.roleOptionText, newRole === 'Admin' && styles.roleOptionTextActive]}>Admin</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={handleAddStaff}>
                  <Text style={styles.saveButtonText}>Add Staff</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  listContent: { padding: 16 },
  
  // Card
  card: { flexDirection: 'row', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, marginBottom: 12, alignItems: 'center', elevation: 1 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  avatarText: { fontSize: 20, fontWeight: 'bold', color: '#4B5563' },
  cardInfo: { flex: 1 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  phone: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  badges: { flexDirection: 'row', marginTop: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginRight: 8 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  adminBadge: { backgroundColor: '#FEF3C7' },
  cashierBadge: { backgroundColor: '#E0F2FE' },
  activeBadge: { backgroundColor: '#D1FAE5' },
  inactiveBadge: { backgroundColor: '#F3F4F6' },
  editBtn: { padding: 8 },

  // FAB
  fab: { position: 'absolute', bottom: 24, right: 24, backgroundColor: '#0F766E', width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', elevation: 4 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 16, backgroundColor: '#F9FAFB' },
  
  roleSelector: { flexDirection: 'row', marginBottom: 24 },
  roleOption: { flex: 1, paddingVertical: 12, borderWidth: 1, borderColor: '#D1D5DB', alignItems: 'center', marginRight: 8, borderRadius: 8 },
  roleOptionActive: { backgroundColor: '#CCFBF1', borderColor: '#0F766E' },
  roleOptionText: { color: '#4B5563', fontWeight: '600' },
  roleOptionTextActive: { color: '#0F766E' },

  modalActions: { flexDirection: 'row' },
  cancelButton: { flex: 1, padding: 16, backgroundColor: '#F3F4F6', borderRadius: 12, alignItems: 'center', marginRight: 8 },
  cancelButtonText: { color: '#4B5563', fontWeight: 'bold', fontSize: 16 },
  saveButton: { flex: 1, padding: 16, backgroundColor: '#0F766E', borderRadius: 12, alignItems: 'center', marginLeft: 8 },
  saveButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 }
});