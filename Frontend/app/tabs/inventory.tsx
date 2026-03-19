// import { Ionicons } from '@expo/vector-icons';
// import React, { useMemo, useState } from 'react';
// import {
//     Alert,
//     FlatList,
//     Keyboard,
//     KeyboardAvoidingView,
//     Modal,
//     Platform,
//     SafeAreaView,
//     StyleSheet,
//     Text,
//     TextInput,
//     TouchableOpacity,
//     TouchableWithoutFeedback,
//     View
// } from 'react-native';

// // --- TypeScript Interfaces ---
// interface InventoryItem {
//   id: string;
//   name: string;
//   company: string;
//   price: number;
//   quantity: number;
// }

// // --- Initial Dummy Data ---
// const initialInventory: InventoryItem[] = [
//   { id: '101', name: 'Paracetamol 500mg', company: 'Emcure', price: 50, quantity: 120 },
//   { id: '102', name: 'Vitamin C Supplements', company: 'Tata', price: 350, quantity: 45 },
//   { id: '103', name: 'Cough Syrup 100ml', company: 'Apollo', price: 120, quantity: 15 },
//   { id: '104', name: 'First Aid Kit', company: 'Piramal', price: 730, quantity: 8 },
//   { id: '105', name: 'Whey Protein 1kg', company: 'Cipla', price: 1000, quantity: 5 },
//   { id: '106', name: 'Ibuprofen 400mg', company: 'Sun Pharma', price: 85, quantity: 200 },
//   { id: '107', name: 'Digital Thermometer', company: 'Equipment', price: 250, quantity: 22 },
// ];

// export default function InventoryScreen() {
//   // --- State Management ---
//   const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
//   const [searchQuery, setSearchQuery] = useState<string>('');
  
//   // Modal State
//   const [modalVisible, setModalVisible] = useState<boolean>(false);
//   const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
//   const [editQuantity, setEditQuantity] = useState<string>('');

//   // --- Search Logic (Memoized for performance) ---
//   const filteredInventory = useMemo(() => {
//     if (!searchQuery.trim()) return inventory;
//     return inventory.filter(item => 
//       item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       item.company.toLowerCase().includes(searchQuery.toLowerCase())
//     );
//   }, [searchQuery, inventory]);

//   // --- Handlers ---
//   const openEditModal = (item: InventoryItem) => {
//     setSelectedItem(item);
//     setEditQuantity(item.quantity.toString());
//     setModalVisible(true);
//   };

//   const handleSaveQuantity = () => {
//     if (selectedItem) {
//       const newQuantity = parseInt(editQuantity, 10);
      
//       // Update the inventory array
//       setInventory(prevInventory => 
//         prevInventory.map(item => 
//           item.id === selectedItem.id 
//             ? { ...item, quantity: isNaN(newQuantity) ? 0 : newQuantity } 
//             : item
//         )
//       );
//     }
//     setModalVisible(false);
//     setSelectedItem(null);
//   };

//   // --- UI Components ---
//   const renderItem = ({ item }: { item: InventoryItem }) => {
//     // Determine color based on stock levels (e.g., Low stock is red)
//     const isLowStock = item.quantity < 20;

//     return (
//       <View style={styles.itemCard}>
//         <View style={styles.itemInfo}>
//           <Text style={styles.itemName}>{item.name}</Text>
//           <Text style={styles.itemDetails}>{item.company} • ₹{item.price}</Text>
//         </View>
        
//         <View style={styles.actionContainer}>
//           <View style={[styles.quantityBadge, isLowStock && styles.lowStockBadge]}>
//             <Text style={[styles.quantityText, isLowStock && styles.lowStockText]}>
//               {item.quantity} in stock
//             </Text>
//           </View>
          
//           <TouchableOpacity 
//             style={styles.editButton} 
//             onPress={() => openEditModal(item)}
//           >
//             <Ionicons name="pencil" size={18} color="#0F766E" />
//           </TouchableOpacity>
//         </View>
//       </View>
//     );
//   };

//   // --- Add Item State ---
//   const [addModalVisible, setAddModalVisible] = useState<boolean>(false);
//   const [newItem, setNewItem] = useState({
//     name: '', company: '', price: '', quantity: ''
//   });

//   const handleAddItem = () => {
//     if (!newItem.name || !newItem.price || !newItem.quantity) {
//       Alert.alert("Missing Fields", "Please fill in the name, price, and quantity.");
//       return;
//     }

//     const newItemData: InventoryItem = {
//       id: Math.random().toString(), // Simple ID generation for now
//       name: newItem.name,
//       company: newItem.company || 'Uncategorized',
//       price: parseFloat(newItem.price) || 0,
//       quantity: parseInt(newItem.quantity, 10) || 0,
//     };

//     setInventory(prev => [newItemData, ...prev]);
//     setAddModalVisible(false);
//     setNewItem({ name: '', company: '', price: '', quantity: '' }); // Reset form
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       {/* Search Header */}
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>Inventory Management</Text>
//         <View style={styles.searchContainer}>
//           <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
//           <TextInput
//             style={styles.searchInput}
//             placeholder="Search medicines, categories..."
//             placeholderTextColor="#9CA3AF"
//             value={searchQuery}
//             onChangeText={setSearchQuery}
//           />
//           {searchQuery.length > 0 && (
//             <TouchableOpacity onPress={() => setSearchQuery('')}>
//               <Ionicons name="close-circle" size={20} color="#9CA3AF" />
//             </TouchableOpacity>
//           )}
//         </View>
//       </View>

//       {/* Inventory List */}
//       <FlatList
//         data={filteredInventory}
//         keyExtractor={(item) => item.id}
//         renderItem={renderItem}
//         contentContainerStyle={styles.listContent}
//         showsVerticalScrollIndicator={false}
//         ListEmptyComponent={
//           <Text style={styles.emptyText}>No items found matching "{searchQuery}"</Text>
//         }
//         keyboardShouldPersistTaps="handled" 
//         keyboardDismissMode="on-drag" // Also helpful: dismisses when the user scrolls
//       />

//       {/* Edit Quantity Modal */}
//       <Modal
//         animationType="fade"
//         transparent={true}
//         visible={modalVisible}
//         onRequestClose={() => setModalVisible(false)}
//       >
//         <KeyboardAvoidingView 
//           behavior={Platform.OS === "ios" ? "padding" : "height"}
//           style={styles.modalOverlay}
//         >
//           <View style={styles.modalContent}>
//             {selectedItem && (
//               <>
//                 <Text style={styles.modalTitle}>Update Stock</Text>
//                 <Text style={styles.modalSubtitle}>{selectedItem.name}</Text>
                
//                 <Text style={styles.inputLabel}>New Quantity</Text>
//                 <TextInput
//                   style={styles.quantityInput}
//                   keyboardType="numeric"
//                   value={editQuantity}
//                   onChangeText={setEditQuantity}
//                   autoFocus={true}
//                   selectTextOnFocus={true}
//                 />

//                 <View style={styles.modalActions}>
//                   <TouchableOpacity 
//                     style={styles.cancelButton} 
//                     onPress={() => setModalVisible(false)}
//                   >
//                     <Text style={styles.cancelButtonText}>Cancel</Text>
//                   </TouchableOpacity>
                  
//                   <TouchableOpacity 
//                     style={styles.saveButton} 
//                     onPress={handleSaveQuantity}
//                   >
//                     <Text style={styles.saveButtonText}>Save Changes</Text>
//                   </TouchableOpacity>
//                 </View>
//               </>
//             )}
//           </View>
//         </KeyboardAvoidingView>
//       </Modal>

//       {/* Floating Action Button */}
//       <TouchableOpacity 
//         style={styles.fab} 
//         onPress={() => setAddModalVisible(true)}
//       >
//         <Ionicons name="add" size={30} color="#FFFFFF" />
//       </TouchableOpacity>

//       {/* Add New Item Modal */}
//       <Modal
//         animationType="slide"
//         transparent={true}
//         visible={addModalVisible}
//         onRequestClose={() => setAddModalVisible(false)}
//       >
//         <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
//           <KeyboardAvoidingView 
//             behavior={Platform.OS === "ios" ? "padding" : "height"}
//             style={styles.modalOverlay}
//           >
//             <View style={styles.modalContent}>
//               <Text style={styles.modalTitle}>Add New Item</Text>
              
//               <TextInput
//                 style={styles.input}
//                 placeholder="Item Name (e.g., Aspirin)"
//                 value={newItem.name}
//                 onChangeText={(text) => setNewItem({...newItem, name: text})}
//               />
//               <TextInput
//                 style={styles.input}
//                 placeholder="company (e.g., Medicine)"
//                 value={newItem.company}
//                 onChangeText={(text) => setNewItem({...newItem, company: text})}
//               />
//               <View style={styles.row}>
//                 <TextInput
//                   style={[styles.input, { flex: 1, marginRight: 8 }]}
//                   placeholder="Price (₹)"
//                   keyboardType="numeric"
//                   value={newItem.price}
//                   onChangeText={(text) => setNewItem({...newItem, price: text})}
//                 />
//                 <TextInput
//                   style={[styles.input, { flex: 1, marginLeft: 8 }]}
//                   placeholder="Quantity"
//                   keyboardType="numeric"
//                   value={newItem.quantity}
//                   onChangeText={(text) => setNewItem({...newItem, quantity: text})}
//                 />
//               </View>

//               <View style={styles.modalActions}>
//                 <TouchableOpacity 
//                   style={styles.cancelButton} 
//                   onPress={() => setAddModalVisible(false)}
//                 >
//                   <Text style={styles.cancelButtonText}>Cancel</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity 
//                   style={styles.saveButton} 
//                   onPress={handleAddItem}
//                 >
//                   <Text style={styles.saveButtonText}>Add Item</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </KeyboardAvoidingView>
//         </TouchableWithoutFeedback>
//       </Modal>
//     </SafeAreaView>
//   );
// }

// // --- Styles ---
// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#F3F4F6' },
  
//   // Header & Search
//   header: { padding: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
//   headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 16 },
//   searchContainer: { 
//     flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', 
//     borderRadius: 12, paddingHorizontal: 12, height: 44 
//   },
//   searchIcon: { marginRight: 8 },
//   searchInput: { flex: 1, fontSize: 16, color: '#111827' },
  
//   // List
//   listContent: { padding: 16 },
//   emptyText: { textAlign: 'center', marginTop: 32, color: '#6B7280', fontSize: 16 },
  
//   // Item Card
//   itemCard: { 
//     flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
//     backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, marginBottom: 12,
//     elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3 
//   },
//   itemInfo: { flex: 1, paddingRight: 12 },
//   itemName: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 4 },
//   itemDetails: { fontSize: 13, color: '#6B7280' },
  
//   actionContainer: { flexDirection: 'row', alignItems: 'center' },
//   quantityBadge: { backgroundColor: '#E0F2FE', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 16, marginRight: 12 },
//   quantityText: { fontSize: 12, fontWeight: '600', color: '#0369A1' },
//   lowStockBadge: { backgroundColor: '#FEE2E2' },
//   lowStockText: { color: '#B91C1C' },
  
//   editButton: { 
//     backgroundColor: '#F0FDFA', padding: 8, borderRadius: 8, 
//     borderWidth: 1, borderColor: '#CCFBF1' 
//   },

//   // Modal
//   modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
//   modalContent: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24, elevation: 5 },
//   modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', textAlign: 'center' },
//   modalSubtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 20, marginTop: 4 },
  
//   inputLabel: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
//   quantityInput: { 
//     borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 12, 
//     fontSize: 18, color: '#111827', textAlign: 'center', marginBottom: 24 
//   },
  
//   modalActions: { flexDirection: 'row', justifyContent: 'space-between' },
//   cancelButton: { flex: 1, paddingVertical: 12, borderRadius: 8, backgroundColor: '#F3F4F6', marginRight: 8, alignItems: 'center' },
//   cancelButtonText: { color: '#4B5563', fontSize: 16, fontWeight: '600' },
//   saveButton: { flex: 1, paddingVertical: 12, borderRadius: 8, backgroundColor: '#0F766E', marginLeft: 8, alignItems: 'center' },
//   saveButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },

//   // Floating Action Button
//   fab: {
//     position: 'absolute', bottom: 24, right: 24, backgroundColor: '#0F766E', width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', elevation: 5, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 4, shadowOffset: { width: 0, height: 2 },
//   },
  
//   // Add Modal Specifics
//   input: {
//     borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 12, fontSize: 16, color: '#111827', marginBottom: 16,backgroundColor: '#F9FAFB'
//   },
//   row: {
//     flexDirection: 'row',
//     justifyContent: 'space-between'
//   }
// });

import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState, useEffect } from 'react';
import {
    Alert,
    FlatList,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
    ActivityIndicator
} from 'react-native';

// 🔥 IMPORTANT: Set your IP address here (e.g., http://192.168.1.5:5000/api)
// Do not use 'localhost' if testing on a physical device.
const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
const API_URL = `${BASE_URL}/api`;

interface InventoryItem {
  id: string;
  name: string;
  company: string;
  price: number;
  quantity: number;
}

export default function InventoryScreen() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [editQuantity, setEditQuantity] = useState('');

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '', company: '', price: '', quantity: ''
  });

  // ✅ FETCH DATA
  const fetchInventory = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/inventory`);
      const data = await res.json();

      const mapped = data.map((m: any) => ({
        id: m.medicine_id.toString(), // Ensure ID is a string for FlatList
        name: m.medicine_name,
        company: m.company,
        price: m.price,
        quantity: m.quantity
      }));

      setInventory(mapped);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to fetch data from server");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // 🔍 SEARCH LOGIC
  const filteredInventory = useMemo(() => {
    if (!searchQuery.trim()) return inventory;
    return inventory.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.company.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, inventory]);

  // ✏️ OPEN EDIT
  const openEditModal = (item: InventoryItem) => {
    setSelectedItem(item);
    setEditQuantity(item.quantity.toString());
    setModalVisible(true);
  };

  // ✅ UPDATE STOCK
  const handleSaveQuantity = async () => {
    if (!selectedItem) return;
    const qty = parseInt(editQuantity, 10);

    try {
      const res = await fetch(
        `${API_URL}/inventory/medicine-name/${encodeURIComponent(selectedItem.name)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity: isNaN(qty) ? 0 : qty })
        }
      );

      if (res.ok) {
        fetchInventory();
        setModalVisible(false);
      } else {
        const errorData = await res.json();
        Alert.alert("Update Failed", errorData.message || "Could not update stock");
      }
    } catch (error) {
      Alert.alert("Network Error", "Check your backend connection");
    }
  };

  // ➕ ADD ITEM
  const handleAddItem = async () => {
    if (!newItem.name || !newItem.price || !newItem.quantity) {
      Alert.alert("Missing Fields", "Please enter name, price, and quantity");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/inventory`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medicine_name: newItem.name,
          company: newItem.company || "Default Company",
          price: parseFloat(newItem.price),
          quantity: parseInt(newItem.quantity, 10)
        })
      });

      if (res.status === 201) {
        fetchInventory();
        setAddModalVisible(false);
        setNewItem({ name: '', company: '', price: '', quantity: '' });
      } else {
        Alert.alert("Error", "Failed to add medicine to inventory");
      }
    } catch (error) {
      Alert.alert("Network Error", "Check your backend connection");
    }
  };

  const renderItem = ({ item }: { item: InventoryItem }) => {
    const isLowStock = item.quantity < 20;

    return (
      <View style={styles.itemCard}>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.itemDetails}>{item.company} • ₹{item.price}</Text>
        </View>

        <View style={styles.actionContainer}>
          <View style={[styles.quantityBadge, isLowStock && styles.lowStockBadge]}>
            <Text style={[styles.quantityText, isLowStock && styles.lowStockText]}>
              {item.quantity} in stock
            </Text>
          </View>

          <TouchableOpacity style={styles.editButton} onPress={() => openEditModal(item)}>
            <Ionicons name="pencil" size={18} color="#0F766E" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Inventory Management</Text>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search medicines..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#0F766E" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={filteredInventory}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={styles.emptyText}>No items found</Text>}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => setAddModalVisible(true)}>
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      {/* EDIT MODAL */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedItem && (
              <>
                <Text style={styles.modalTitle}>Update Stock</Text>
                <Text style={styles.modalSubtitle}>{selectedItem.name}</Text>

                <TextInput
                  style={styles.quantityInput}
                  keyboardType="numeric"
                  value={editQuantity}
                  onChangeText={setEditQuantity}
                  selectTextOnFocus
                  autoFocus
                />

                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                    <Text style={{color: '#6B7280'}}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.saveButton} onPress={handleSaveQuantity}>
                    <Text style={{ color: "#fff", fontWeight: '600' }}>Save</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ADD MODAL */}
      <Modal visible={addModalVisible} transparent animationType="slide" onRequestClose={() => setAddModalVisible(false)}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={[styles.modalTitle, {marginBottom: 15}]}>Add New Item</Text>

              <TextInput style={styles.input} placeholder="Medicine Name"
                placeholderTextColor="#9CA3AF"
                value={newItem.name}
                onChangeText={(t) => setNewItem({ ...newItem, name: t })}
              />

              <TextInput style={styles.input} placeholder="Company Name"
                placeholderTextColor="#9CA3AF"
                value={newItem.company}
                onChangeText={(t) => setNewItem({ ...newItem, company: t })}
              />

              <TextInput style={styles.input} placeholder="Price (₹)"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={newItem.price}
                onChangeText={(t) => setNewItem({ ...newItem, price: t })}
              />

              <TextInput style={styles.input} placeholder="Current Quantity"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={newItem.quantity}
                onChangeText={(t) => setNewItem({ ...newItem, quantity: t })}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setAddModalVisible(false)}>
                  <Text style={{color: '#6B7280'}}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.saveButton, {flex: 1}]} onPress={handleAddItem}>
                  <Text style={{ color: "#fff", fontWeight: '600' }}>Add to Inventory</Text>
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
  header: { padding: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 12, paddingHorizontal: 10 },
  searchInput: { flex: 1, height: 40, marginLeft: 8 },
  listContent: { padding: 16 },
  emptyText: { textAlign: 'center', color: '#9CA3AF', marginTop: 20 },
  itemCard: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    backgroundColor: '#fff', 
    padding: 16, 
    borderRadius: 12, 
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2
  },
  itemInfo: { flex: 1, paddingRight: 8 },
  itemName: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  itemDetails: { color: '#6B7280', marginTop: 4, fontSize: 13 },
  actionContainer: { flexDirection: 'row', alignItems: 'center' },
  quantityBadge: { backgroundColor: '#E0F2FE', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  lowStockBadge: { backgroundColor: '#FEE2E2' },
  quantityText: { fontSize: 11, fontWeight: '700', color: '#0369A1' },
  lowStockText: { color: '#B91C1C' },
  editButton: { marginLeft: 10, padding: 4 },
  fab: { 
    position: 'absolute', 
    bottom: 30, 
    right: 20, 
    backgroundColor: '#0F766E', 
    width: 56, 
    height: 56, 
    borderRadius: 28, 
    justifyContent: 'center', 
    alignItems: 'center',
    elevation: 5
  },
  modalOverlay: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 20 },
  modalContent: { backgroundColor: '#fff', padding: 24, borderRadius: 16 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  modalSubtitle: { color: '#6B7280', textAlign: 'center', marginTop: 5, marginBottom: 15 },
  quantityInput: { 
    borderWidth: 1, 
    borderColor: '#D1D5DB', 
    borderRadius: 8, 
    padding: 12, 
    fontSize: 20, 
    textAlign: 'center', 
    marginVertical: 15 
  },
  modalActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cancelButton: { padding: 12, flex: 1, alignItems: 'center' },
  saveButton: { padding: 12, backgroundColor: '#0F766E', borderRadius: 8, flex: 1, alignItems: 'center' },
  input: { 
    borderWidth: 1, 
    borderColor: '#D1D5DB', 
    padding: 12, 
    borderRadius: 8, 
    marginBottom: 12,
    backgroundColor: '#F9FAFB' 
  }
});