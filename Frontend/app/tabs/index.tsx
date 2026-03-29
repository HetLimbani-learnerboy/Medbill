import { Feather, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { BarcodeScanningResult, CameraView, useCameraPermissions } from 'expo-camera';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { useCart } from '../CartContext';

const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
const API_URL = `${BASE_URL}/api`;

interface FoodProductResponse {
  status: number;
  product?: { product_name?: string; brands?: string; };
}

export default function Index() {
  const [permission, requestPermission] = useCameraPermissions();
  const [zoom, setZoom] = useState<number>(0);
  const [scannedItem, setScannedItem] = useState<string | null>(null);
  const navigation: any = useNavigation();

  // Access Global Cart Context
  const { cart, setCart, clearCart, removeCartItem } = useCart();

  const isProcessing = useRef<boolean>(false);
  const [billModalVisible, setBillModalVisible] = useState<boolean>(false);
  const [inventory, setInventory] = useState<any[]>([]);

  // Add Item Modal States
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [addBarcode, setAddBarcode] = useState('');
  const [addName, setAddName] = useState('');
  const [addCompany, setAddCompany] = useState('');
  const [addPrice, setAddPrice] = useState('');
  const [addpriceplaceholder, setAddPricePlaceholder] = useState('');
  const [addQuantity, setAddQuantity] = useState('1');


  useEffect(() => {
    const fetchData = async () => {
      try {
        if (addBarcode && addBarcode.length >= 3) {
          const res = await fetch(`${API_URL}/inventory/${addBarcode}`);

          if (res.ok) {
            const data = await res.json();

            if (data.medicine_name !== addName) {
              setAddName(data.medicine_name || '');
            }

            setAddCompany(data.company || '');
            setAddPricePlaceholder(data.price?.toString() || '');

            if (!addPrice) {
              setAddPrice(data.price?.toString() || '');
            }
          }

          return;
        }

        if (addName && addName.length >= 2) {
          const res = await fetch(`${API_URL}/inventory/search?name=${addName}`);

          if (res.ok) {
            const data = await res.json();

            if (data.length > 0) {
              const item = data[0];

              if (item.barcode !== addBarcode) {
                setAddBarcode(item.barcode || '');
              }

              setAddCompany(item.company || '');
              setAddPricePlaceholder(item.price?.toString() || '');

              if (!addPrice) {
                setAddPrice(item.price?.toString() || '');
              }
            }
          }
        }

      } catch (err) {
        console.log("Search error", err);
      }
    };

    const timeout = setTimeout(fetchData, 300);
    return () => clearTimeout(timeout);

  }, [addName, addBarcode]);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const res = await fetch(`${API_URL}/inventory`);
        if (res.ok) {
          const data = await res.json();

          const mapped = data.map((m: any) => ({
            id: m.barcode?.toString(),
            name: m.medicine_name,
            company: m.company,
            price: m.price,
            quantity: m.quantity
          }));

          setInventory(mapped);
        }
      } catch (error) {
        console.error("Failed to fetch inventory for POS", error);
      }
    };

    fetchInventory();
  }, []);

  if (!permission?.granted) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.resetBtn} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Camera Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const resetScanner = () => {
    isProcessing.current = false;
    setScannedItem(null);
  };

  const resetAddModal = () => {
    setAddBarcode('');
    setAddName('');
    setAddCompany('');
    setAddPrice('');
    setAddQuantity('1');
    setModalVisible(false);
    resetScanner();
  };

  // --- NEW: Handle Manual Entry ---
  const handleManualEntry = () => {
    setAddBarcode('');
    setAddName('');
    setAddCompany('');
    setAddPrice('');
    setAddPricePlaceholder('');
    setAddQuantity('1');
    setModalVisible(true);
  };

  // const searchProductDetails = async (scannedBarcode: string) => {
  //   const existingItem = inventory.find(item => item.id === scannedBarcode);

  //   if (existingItem) {
  //     setAddBarcode(scannedBarcode);
  //     setAddName(existingItem.name);
  //     setAddCompany(existingItem.company);
  //     setAddPrice(existingItem.price.toString());
  //     setAddQuantity('1');
  //   } else {
  //     try {
  //       const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${scannedBarcode}.json`);
  //       const result: FoodProductResponse = await response.json();

  //       if (result.status === 1 && result.product) {
  //         setAddBarcode(scannedBarcode);
  //         setAddName(result.product.product_name || '');
  //         setAddCompany(result.product.brands || '');
  //         setAddPrice('');
  //         setAddQuantity('1');
  //       } else {
  //         setAddBarcode(scannedBarcode);
  //         setAddName('');
  //         setAddCompany('');
  //         setAddPrice('');
  //         setAddQuantity('1');
  //       }
  //     } catch (error) {
  //       console.error("API Fetch error", error);
  //       setAddBarcode(scannedBarcode);
  //       setAddQuantity('1');
  //     }
  //   }
  // };

  const searchProductDetails = async (scannedBarcode: string) => {
  setAddBarcode(scannedBarcode); // ✅ only trigger state
};

  const handleBarcodeScanned = async ({ data }: BarcodeScanningResult) => {
    if (isProcessing.current || modalVisible || billModalVisible) return;

    isProcessing.current = true;
    setScannedItem(data);

    await searchProductDetails(data);
    setModalVisible(true);
  };

  const handleAddItemToCart = () => {
    if (!addName || (!addPrice && !addpriceplaceholder)) {
      Alert.alert("Missing Fields", "Please enter Name and Price.");
      return;
    }

    const finalPrice = addPrice || addpriceplaceholder;

    const newItem = {
      code: addBarcode || 'manual',
      name: addName,
      price: parseFloat(finalPrice),
      quantity: parseInt(addQuantity, 10) || 1,
    };

    setCart((prevCart) => [...prevCart, newItem]);
    resetAddModal();
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleDeleteAll = () => {
    Alert.alert("Delete All?", "Are you sure you want to clear the cart?", [
      { text: "Cancel" },
      { text: "Delete All", style: "destructive", onPress: () => { clearCart(); setBillModalVisible(false); } }
    ]);
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        zoom={zoom}
        onBarcodeScanned={(isProcessing.current || modalVisible || billModalVisible) ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ["qr", "ean13", "code128"] }}
      />

      {/* TOP CONTROLS: Zoom & Manual Entry */}
      <View style={styles.topControls}>
        <TouchableOpacity style={styles.iconCircle} onPress={() => setZoom(prev => (prev === 0 ? 0.3 : 0))}>
          <Text style={styles.zoomText}>{zoom === 0 ? '1x' : '3x'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconCircle} onPress={handleManualEntry}>
          <Feather name="edit" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.overlay} pointerEvents="none">
        <View style={[styles.targetBox, { borderColor: scannedItem ? '#4CAF50' : '#FFF' }]} />
        <Text style={styles.hintText}>{scannedItem ? "Processing..." : "Align barcode inside box"}</Text>
      </View>

      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => cart.length > 0 ? setBillModalVisible(true) : Alert.alert("Empty", "Scan items first")}
        >
          <Text style={styles.nextButtonText}>Next ({cart.length})</Text>
        </TouchableOpacity>
      </View>

      {/* MODAL: ADD ITEM TO CART */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={resetAddModal}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={[styles.modalTitle, { marginBottom: 15 }]}>Add to Cart</Text>

              {/* Barcode Input */}
              <TextInput
                style={styles.input}
                placeholder="Barcode Number (Optional)"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={addBarcode}
                onChangeText={(val) => {
                  setAddBarcode(val);
                  if (val.length >= 3) {
                    searchProductDetails(val);
                  }
                }}
              />

              {/* Item Name Input */}
              <TextInput
                style={styles.input}
                placeholder="Item Name"
                placeholderTextColor="#9CA3AF"
                value={addName}
                onChangeText={setAddName}
              />
              <TextInput
                style={styles.input}
                placeholder="Company/Brand (Optional)"
                placeholderTextColor="#9CA3AF"
                value={addCompany}
                onChangeText={setAddCompany}
              />

              <TextInput
                style={styles.input}
                placeholder={addpriceplaceholder ? `₹${addpriceplaceholder}` : "Enter Price"}
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={addPrice}
                onChangeText={setAddPrice}
              />

              <TextInput
                style={styles.input}
                placeholder="Quantity"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={addQuantity}
                onChangeText={setAddQuantity}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelButton} onPress={resetAddModal}>
                  <Text style={{ color: '#6B7280', fontWeight: '600' }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={handleAddItemToCart}>
                  <Text style={{ color: "#fff", fontWeight: '600' }}>Add to Cart</Text>
                </TouchableOpacity>
              </View>

            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>

      {/* MODAL: SUMMARY */}
      <Modal visible={billModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '80%', width: '90%' }]}>
            <Text style={styles.modalTitle}>Cart Summary</Text>
            <ScrollView style={{ marginVertical: 10 }}>
              {cart.map((item, i) => (
                <View key={i} style={styles.billItemRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#1F2937' }}>{item.name}</Text>
                    <Text style={{ color: '#6B7280' }}>₹{item.price} x {item.quantity}</Text>
                  </View>
                  <TouchableOpacity onPress={() => removeCartItem(i)} style={styles.trashIcon}>
                    <Ionicons name="trash-outline" size={20} color="#E11D48" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
            <Text style={styles.finalTotalLabel}>Subtotal: ₹{calculateTotal().toFixed(2)}</Text>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setBillModalVisible(false)}>
                <Text style={{ color: '#6B7280', fontWeight: '600' }}>Scan More</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={() => { setBillModalVisible(false); navigation.navigate('Preview') }}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Preview Bill</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.deleteAllBtn} onPress={handleDeleteAll}>
              <Text style={{ color: '#E11D48', fontWeight: 'bold' }}>Clear Cart</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F9F9' },

  // Top Controls (Zoom & Manual Entry)
  topControls: {
    position: 'absolute', top: 20, right: 20, alignItems: 'center', gap: 12, zIndex: 10,
  },
  iconCircle: {
    width: 54, height: 54, borderRadius: 27, justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.8)', // Slightly translucent green
    borderWidth: 1.5, borderColor: '#4CAF50', elevation: 4,
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 5,
  },
  zoomText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', textAlign: 'center' },

  // Scanner Overlay
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)'
  },
  targetBox: {
    width: 260, height: 260, borderWidth: 3, borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.08)', borderColor: '#FFF',
  },
  hintText: {
    color: '#F0FDFA', marginTop: 24, backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    fontSize: 14, fontWeight: '600', overflow: 'hidden',
  },

  // Bottom Floating Button
  bottomButtonContainer: {
    position: 'absolute', bottom: 40, width: '100%',
    alignItems: 'center', paddingHorizontal: 20,
  },
  nextButton: {
    backgroundColor: '#4CAF50', width: '100%', maxWidth: 300,
    paddingVertical: 18, borderRadius: 16, flexDirection: 'row',
    justifyContent: 'center', alignItems: 'center', elevation: 8,
    shadowColor: '#0F766E', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 10,
  },
  nextButtonText: { color: '#FFF', fontSize: 18, fontWeight: '800', letterSpacing: 1 },

  // Modal Styles
  modalOverlay: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.7)', padding: 20
  },
  modalContent: {
    width: '100%', backgroundColor: '#fff', padding: 24,
    borderRadius: 16, elevation: 10
  },
  modalTitle: {
    fontSize: 22, fontWeight: '800', color: '#134E4A', textAlign: 'center'
  },

  // Inputs
  input: {
    borderWidth: 1, borderColor: '#D1D5DB', padding: 12,
    borderRadius: 8, marginBottom: 12, backgroundColor: '#F9FAFB',
    fontSize: 16, color: '#0F172A'
  },

  // Modal Actions
  modalActions: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
  cancelButton: {
    padding: 14, flex: 1, alignItems: 'center',
    backgroundColor: '#F1F5F9', borderRadius: 12
  },
  saveButton: {
    padding: 14, backgroundColor: '#0F766E', borderRadius: 12,
    flex: 1, alignItems: 'center'
  },

  // Cart Specific
  billItemRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  trashIcon: { padding: 8, backgroundColor: '#FFF1F2', borderRadius: 10 },
  finalTotalLabel: {
    fontSize: 18, fontWeight: '800', color: '#0F766E', textAlign: 'right', paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9'
  },
  deleteAllBtn: {
    marginTop: 20, padding: 14, alignItems: 'center', borderWidth: 1,
    borderColor: '#FDA4AF', borderRadius: 12, backgroundColor: '#FFF1F2',
  },
  resetBtn: {
    marginTop: 100, backgroundColor: '#0F766E', paddingVertical: 16,
    paddingHorizontal: 32, borderRadius: 14, alignSelf: 'center',
  },
});