import { Ionicons } from "@expo/vector-icons";
import { BarcodeScanningResult, CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from "expo-router";
import React, { useRef, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView, StyleSheet,
  Text,
  TextInput, TouchableOpacity,
  View
} from 'react-native';
import { useCart } from '../CartContext';

interface FoodProductResponse {
  status: number;
  product?: { product_name?: string; };
}

export default function Index(){
  const [permission, requestPermission] = useCameraPermissions();
  const [zoom, setZoom] = useState<number>(0);
  const [scannedItem, setScannedItem] = useState<string | null>(null);
  const router = useRouter();
  
  // Access Global Cart Context
  const { cart, setCart, clearCart, removeCartItem } = useCart();

  const isProcessing = useRef<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [currentItem, setCurrentItem] = useState<{name: string, code: string} | null>(null);
  const [priceInput, setPriceInput] = useState<string>('');
  const [quantityInput, setQuantityInput] = useState<string>('1');
  const [billModalVisible, setBillModalVisible] = useState<boolean>(false);

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

  const handleAddItem = () => {
    // FIX: Sanitize price (e.g., "0.8.7" becomes "0.8")
    let sanitizedPrice = priceInput;
    const parts = priceInput.split('.');
    if (parts.length > 2) {
      sanitizedPrice = `${parts[0]}.${parts[1]}`;
    }

    if (!sanitizedPrice || sanitizedPrice.trim() === "" || isNaN(parseFloat(sanitizedPrice))) {
      Alert.alert("Invalid Price", "Please enter a valid numeric price.");
      return;
    }
    
    if (currentItem) {
      const newItem = {
        code: currentItem.code,
        name: currentItem.name,
        price: parseFloat(sanitizedPrice), 
        quantity: parseInt(quantityInput, 10) || 1, 
      };
      
      setCart((prevCart) => [...prevCart, newItem]);
    }

    setModalVisible(false);
    resetScanner();
  };

  const handleBarcodeScanned = async ({ data }: BarcodeScanningResult) => {
    // Prevent scanning if a modal is open or already processing
    if (isProcessing.current || modalVisible || billModalVisible) return;
    
    isProcessing.current = true;
    setScannedItem(data); 

    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${data}.json`);
      const result: FoodProductResponse = await response.json();

      if (result.status === 1 && result.product) {
        setCurrentItem({ name: result.product.product_name || "Unknown Item", code: data });
        setPriceInput('');
        setQuantityInput('1');
        setModalVisible(true);
      } else {
        Alert.alert("Not Found", "Item not in database.", [{ text: "OK", onPress: resetScanner }]);
      }
    } catch (error) {
      Alert.alert("Error", "Check your internet connection.");
      resetScanner();
    }
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleRescan = () => {
    setModalVisible(false);
    setBillModalVisible(false);
    resetScanner();
  };

  const handleDeleteAll = () => {
    Alert.alert("Delete All?", "Are you sure you want to clear the cart?", [
      { text: "Cancel" },
      { text: "Delete All", style: "destructive", onPress: () => { clearCart(); setBillModalVisible(false); }}
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

      <TouchableOpacity style={styles.zoomCircle} onPress={() => setZoom(prev => (prev === 0 ? 0.3 : 0))}>
        <Text style={styles.zoomText}>{zoom === 0 ? '1x' : '3x'}</Text>
      </TouchableOpacity>

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

      {/* MODAL: ADD ITEM */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Item Found</Text>
            <Text style={styles.modalSubtext}>{currentItem?.name}</Text>
            <TextInput style={styles.input} placeholder="Price" keyboardType="numeric" value={priceInput} onChangeText={setPriceInput} />
            <TextInput style={styles.input} placeholder="Quantity" keyboardType="numeric" value={quantityInput} onChangeText={setQuantityInput} />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.rescanBtn} onPress={handleRescan}><Text>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={styles.addBtn} onPress={handleAddItem}><Text style={{color:'#fff'}}>Add</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL: SUMMARY */}
      <Modal visible={billModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, {maxHeight: '80%'}]}>
            <Text style={styles.modalTitle}>Cart Summary</Text>
            <ScrollView style={{marginVertical: 10}}>
              {cart.map((item, i) => (
                <View key={i} style={styles.billItemRow}>
                  <View style={{flex: 1}}>
                    <Text style={{fontWeight: 'bold'}}>{item.name}</Text>
                    <Text>₹{item.price} x {item.quantity}</Text>
                  </View>
                  <TouchableOpacity onPress={() => removeCartItem(i)}>
                    <Ionicons name="trash-outline" size={20} color="red" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
            <Text style={styles.finalTotalLabel}>Subtotal: ₹{calculateTotal().toFixed(2)}</Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.rescanBtn} onPress={handleRescan}><Text>Scan More</Text></TouchableOpacity>
              <TouchableOpacity style={styles.addBtn} onPress={() => { setBillModalVisible(false); router.push('/tabs/preview'); }}>
                <Text style={{color:'#fff', fontWeight: 'bold'}}>Preview</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.deleteAllBtn} onPress={handleDeleteAll}>
              <Text style={{color: 'red', fontWeight: 'bold'}}>Delete All Items</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  // Root Container
  container: { 
    flex: 1, 
    backgroundColor: '#F0F9F9' 
  },

  // Camera Zoom Control
  zoomCircle: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 54,
    height: 54,
    borderRadius: 27, 
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#4CAF50',
    zIndex: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  zoomText: { 
    color: '#fff', 
    backgroundColor: 'transparent',
    fontWeight: '700', 
    fontSize: 14 
  },

  // Permission Button Text
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  
  // Scanner Overlay
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)' 
  },
  targetBox: {
    width: 260,
    height: 260,
    borderWidth: 3,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: '#FFF', 
  },
  hintText: {
    color: '#F0FDFA',
    marginTop: 24,
    backgroundColor: 'rgba(0,0,0,0.7)', 
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    fontSize: 14,
    fontWeight: '600',
    overflow: 'hidden',
  },

  // Bottom Floating Button
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  nextButton: {
    backgroundColor: '#4CAF50', 
    width: '100%',
    maxWidth: 300,
    paddingVertical: 18,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#0F766E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  nextButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#134E4A', 
    textAlign: 'center',
    marginBottom: 4,
  },
  modalSubtext: {
    textAlign: 'center',
    color: '#64748B', 
    fontSize: 15,
    marginBottom: 20,
  },

  // Form Inputs
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    fontSize: 16,
    color: '#0F172A',
  },

  // Bill Summary Totals (Matched to your component)
  finalTotalLabel: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F766E', // Primary teal
    textAlign: 'right',
    marginTop: 10,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: '#5EEAD4',
  },

  // Modal Buttons
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  rescanBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  addBtn: {
    flex: 1,
    backgroundColor: '#0F766E', 
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },

  // List Items (Cart)
  billItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },

  // Error/Reset/Danger Actions
  deleteAllBtn: {
    marginTop: 20,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FDA4AF',
    borderRadius: 12,
    backgroundColor: '#FFF1F2',
  },
  resetBtn: {
    marginTop: 100,
    backgroundColor: '#0F766E',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 14,
    alignSelf: 'center',
  },
})

// import React, { useState, useRef } from 'react';
// import { 
//   Text, View, TextInput, TouchableOpacity, Modal, 
//   Alert, ScrollView, StyleSheet, Platform 
// } from 'react-native';
// import { useRouter } from "expo-router";
// import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
// import { useCart } from '../CartContext'; 
// import { Ionicons } from "@expo/vector-icons";
// import { useIsFocused } from '@react-navigation/native';

// interface FoodProductResponse {
//   status: number;
//   product?: { product_name?: string; };
// }

// export default function Index() {
//   const [permission, requestPermission] = useCameraPermissions();
//   const isFocussed = useIsFocused()
//   const [zoom, setZoom] = useState<number>(0);
//   const [scannedItem, setScannedItem] = useState<string | null>(null);
//   const router = useRouter();
  
//   // Access Global Cart Context
//   const { cart, setCart, clearCart, removeCartItem } = useCart();

//   const isProcessing = useRef<boolean>(false);
//   const [modalVisible, setModalVisible] = useState<boolean>(false);
//   const [manualModalVisible, setManualModalVisible] = useState<boolean>(false);
//   const [manualBarcode, setManualBarcode] = useState<string>('');

//   const [currentItem, setCurrentItem] = useState<{name: string, code: string} | null>(null);
//   const [priceInput, setPriceInput] = useState<string>('');
//   const [quantityInput, setQuantityInput] = useState<string>('1');
//   const [billModalVisible, setBillModalVisible] = useState<boolean>(false);

//   if (!permission?.granted) {
//     return (
//       <View style={styles.container}>
//         <TouchableOpacity style={styles.resetBtn} onPress={requestPermission}>
//           <Text style={styles.buttonText}>Grant Camera Permission</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   const resetScanner = () => {
//     isProcessing.current = false;
//     setScannedItem(null);
//     setManualBarcode('');
//   };

//   // Reusable Product Fetcher
//   const fetchProductData = async (barcode: string) => {
//     if (isProcessing.current || modalVisible) return;
    
//     isProcessing.current = true;
//     setScannedItem(barcode); 

//     try {
//       const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
//       const result: FoodProductResponse = await response.json();

//       if (result.status === 1 && result.product) {
//         setCurrentItem({ name: result.product.product_name || "Unknown Item", code: barcode });
//         setPriceInput('');
//         setQuantityInput('1');
//         setManualModalVisible(false); // Close manual input if it was open
//         setModalVisible(true);
//       } else {
//         Alert.alert("Not Found", "Item not in database.", [{ text: "OK", onPress: resetScanner }]);
//       }
//     } catch (error) {
//       Alert.alert("Error", "Check your internet connection.");
//       resetScanner();
//     }
//   };

//   const handleBarcodeScanned = ({ data }: BarcodeScanningResult) => {
//     if (modalVisible || billModalVisible || manualModalVisible) return;
//     fetchProductData(data);
//   };

//   const handleManualSubmit = () => {
//     if (!manualBarcode.trim()) {
//       Alert.alert("Error", "Please enter a barcode number.");
//       return;
//     }
//     fetchProductData(manualBarcode.trim());
//   };

//   const handleAddItem = () => {
//     let sanitizedPrice = priceInput;
//     const parts = priceInput.split('.');
//     if (parts.length > 2) {
//       sanitizedPrice = `${parts[0]}.${parts[1]}`;
//     }

//     if (!sanitizedPrice || sanitizedPrice.trim() === "" || isNaN(parseFloat(sanitizedPrice))) {
//       Alert.alert("Invalid Price", "Please enter a valid numeric price.");
//       return;
//     }
    
//     if (currentItem) {
//       const newItem = {
//         code: currentItem.code,
//         name: currentItem.name,
//         price: parseFloat(sanitizedPrice), 
//         quantity: parseInt(quantityInput, 10) || 1, 
//       };
      
//       setCart((prevCart) => [...prevCart, newItem]);
//     }

//     setModalVisible(false);
//     resetScanner();
//   };

//   const calculateTotal = () => {
//     return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
//   };

//   const handleRescan = () => {
//     setModalVisible(false);
//     setBillModalVisible(false);
//     setManualModalVisible(false);
//     resetScanner();
//   };

//   const handleDeleteAll = () => {
//     Alert.alert("Delete All?", "Are you sure you want to clear the cart?", [
//       { text: "Cancel" },
//       { text: "Delete All", style: "destructive", onPress: () => { clearCart(); setBillModalVisible(false); }}
//     ]);
//   };

//   return (
//     <View style={styles.container}>
//       {isFocussed && <CameraView
//         style={StyleSheet.absoluteFillObject}
//         zoom={zoom}
//         onBarcodeScanned={(isProcessing.current || modalVisible || billModalVisible || manualModalVisible) ? undefined : handleBarcodeScanned}
//         barcodeScannerSettings={{ barcodeTypes: ["qr", "ean13", "code128"] }}
//       />}

//       {/* TOP CONTROLS */}
//       <View style={styles.topControls}>
//         <TouchableOpacity style={styles.iconCircle} onPress={() => setZoom(prev => (prev === 0 ? 0.3 : 0))}>
//            <Text style={styles.zoomText}>{zoom === 0 ? '1x' : '3x'}</Text>
//         </TouchableOpacity>

//         <TouchableOpacity style={styles.iconCircle} onPress={() => setManualModalVisible(true)}>
//           <Ionicons name={"keyboard-outline" as any} size={24} color="white" />
//         </TouchableOpacity>
//       </View>

//       <View style={styles.overlay} pointerEvents="none">
//         <View style={[styles.targetBox, { borderColor: scannedItem ? '#4CAF50' : '#FFF' }]} />
//         <Text style={styles.hintText}>{scannedItem ? "Processing..." : "Align barcode inside box"}</Text>
//       </View>

//       <View style={styles.bottomButtonContainer}>
//           <TouchableOpacity 
//             style={styles.nextButton} 
//             onPress={() => cart.length > 0 ? setBillModalVisible(true) : Alert.alert("Empty", "Scan items first")}
//           >
//             <Text style={styles.nextButtonText}>Next ({cart.length})</Text>
//           </TouchableOpacity>
//       </View>

//       {/* MODAL: MANUAL BARCODE ENTRY */}
//       <Modal visible={manualModalVisible} transparent animationType="fade">
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContainer}>
//             <View style={styles.modalHeaderIcon}>
//                <Ionicons name="barcode-outline" size={32} color="#0F766E" />
//             </View>
//             <Text style={styles.modalTitle}>Manual Entry</Text>
//             <Text style={styles.modalSubtext}>Type the barcode number found on the product</Text>
            
//             <TextInput 
//               style={styles.input} 
//               placeholder="Ex: 7311070032611" 
//               keyboardType="numeric" 
//               value={manualBarcode} 
//               onChangeText={setManualBarcode}
//               autoFocus={true}
//             />

//             <View style={styles.modalButtons}>
//               <TouchableOpacity style={styles.rescanBtn} onPress={() => setManualModalVisible(false)}>
//                 <Text>Cancel</Text>
//               </TouchableOpacity>
//               <TouchableOpacity style={styles.addBtn} onPress={handleManualSubmit}>
//                 <Text style={{color:'#fff', fontWeight: 'bold'}}>Find Item</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>

//       {/* MODAL: ADD ITEM DETAILS */}
//       <Modal visible={modalVisible} transparent animationType="fade">
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContainer}>
//             <Text style={styles.modalTitle}>Item Found</Text>
//             <Text style={styles.modalSubtext}>{currentItem?.name}</Text>
            
//             <Text style={styles.manualInputLabel}>Price (₹)</Text>
//             <TextInput style={styles.input} placeholder="0.00" keyboardType="numeric" value={priceInput} onChangeText={setPriceInput} />
            
//             <Text style={styles.manualInputLabel}>Quantity</Text>
//             <TextInput style={styles.input} placeholder="1" keyboardType="numeric" value={quantityInput} onChangeText={setQuantityInput} />
            
//             <View style={styles.modalButtons}>
//               <TouchableOpacity style={styles.rescanBtn} onPress={handleRescan}><Text>Cancel</Text></TouchableOpacity>
//               <TouchableOpacity style={styles.addBtn} onPress={handleAddItem}><Text style={{color:'#fff', fontWeight: 'bold'}}>Add to Cart</Text></TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>

//       {/* MODAL: SUMMARY */}
//       <Modal visible={billModalVisible} transparent animationType="slide">
//         <View style={styles.modalOverlay}>
//           <View style={[styles.modalContainer, {maxHeight: '80%'}]}>
//             <Text style={styles.modalTitle}>Cart Summary</Text>
//             <ScrollView style={{marginVertical: 10}}>
//               {cart.map((item, i) => (
//                 <View key={i} style={styles.billItemRow}>
//                   <View style={styles.itemInfo}>
//                     <Text style={{fontWeight: 'bold', fontSize: 16}}>{item.name}</Text>
//                     <Text style={styles.itemPriceText}>₹{item.price} x {item.quantity}</Text>
//                   </View>
//                   <TouchableOpacity style={styles.trashIcon} onPress={() => removeCartItem(i)}>
//                     <Ionicons name="trash-outline" size={20} color="#E11D48" />
//                   </TouchableOpacity>
//                 </View>
//               ))}
//             </ScrollView>
//             <Text style={styles.finalTotalLabel}>Subtotal: ₹{calculateTotal().toFixed(2)}</Text>
            
//             <View style={styles.modalButtons}>
//               <TouchableOpacity style={styles.rescanBtn} onPress={handleRescan}><Text>Scan More</Text></TouchableOpacity>
//               <TouchableOpacity style={styles.addBtn} onPress={() => { setBillModalVisible(false); router.push('/tabs/preview'); }}>
//                 <Text style={{color:'#fff', fontWeight: 'bold'}}>Preview Bill</Text>
//               </TouchableOpacity>
//             </View>

//             <TouchableOpacity style={styles.deleteAllBtn} onPress={handleDeleteAll}>
//               <Text style={{color: '#E11D48', fontWeight: 'bold'}}>Clear Cart</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { 
//     flex: 1, 
//     backgroundColor: '#F0F9F9' 
//   },
//   topControls: {
//     position: 'absolute',
//     top: 20,
//     right: 10,
//     alignItems: 'center',
//     gap: 10,
//     zIndex: 20,
//   },
//   iconCircle: {
//     width: 54,
//     height: 54,
//     borderRadius: 27,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#4CAF50',
//     borderWidth: 1.5,
//     borderColor: '#4CAF50',
//     elevation: 5,
//     shadowColor: '#000',
//     shadowOpacity: 0.3,
//     shadowRadius: 5,
//   },
//   zoomText: { 
//     color: '#fff', 
//     fontWeight: '700', 
//     fontSize: 14 
//   },
//   overlay: {
//     ...StyleSheet.absoluteFillObject,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0,0,0,0.2)' 
//   },
//   targetBox: {
//     width: 260,
//     height: 260,
//     borderWidth: 3,
//     borderRadius: 24,
//     backgroundColor: 'rgba(255,255,255,0.08)',
//     borderColor: '#FFF', 
//   },
//   hintText: {
//     color: '#F0FDFA',
//     marginTop: 24,
//     backgroundColor: 'rgba(0,0,0,0.7)', 
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 20,
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   bottomButtonContainer: {
//     position: 'absolute',
//     bottom: 40,
//     width: '100%',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//   },
//   nextButton: {
//     backgroundColor: '#4CAF50', 
//     width: '100%',
//     maxWidth: 300,
//     paddingVertical: 18,
//     borderRadius: 16,
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     elevation: 8,
//   },
//   nextButtonText: {
//     color: '#FFF',
//     fontSize: 18,
//     fontWeight: '800',
//     letterSpacing: 1,
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(15, 23, 42, 0.7)', 
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContainer: {
//     width: '90%',
//     backgroundColor: '#FFFFFF',
//     borderRadius: 24,
//     padding: 24,
//     elevation: 10,
//   },
//   modalHeaderIcon: {
//     alignSelf: 'center',
//     marginBottom: 10,
//     backgroundColor: '#F0FDFA',
//     padding: 12,
//     borderRadius: 50,
//   },
//   modalTitle: {
//     fontSize: 22,
//     fontWeight: '800',
//     color: '#134E4A', 
//     textAlign: 'center',
//     marginBottom: 4,
//   },
//   modalSubtext: {
//     textAlign: 'center',
//     color: '#64748B', 
//     fontSize: 15,
//     marginBottom: 20,
//   },
//   manualInputLabel: {
//     fontSize: 14,
//     fontWeight: '700',
//     color: '#64748B',
//     marginBottom: 8,
//     textAlign: 'left',
//     width: '100%',
//   },
//   input: {
//     backgroundColor: '#F8FAFC',
//     borderWidth: 1.5,
//     borderColor: '#E2E8F0',
//     borderRadius: 12,
//     padding: 14,
//     marginBottom: 12,
//     fontSize: 16,
//     color: '#0F172A',
//   },
//   modalButtons: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 16,
//     gap: 12,
//   },
//   rescanBtn: {
//     flex: 1,
//     backgroundColor: '#F1F5F9',
//     padding: 16,
//     borderRadius: 12,
//     alignItems: 'center',
//   },
//   addBtn: {
//     flex: 1,
//     backgroundColor: '#0F766E', 
//     padding: 16,
//     borderRadius: 12,
//     alignItems: 'center',
//   },
//   billItemRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 14,
//     borderBottomWidth: 1,
//     borderBottomColor: '#F1F5F9',
//   },
//   itemInfo: {
//     flex: 1,
//   },
//   itemPriceText: {
//     fontSize: 14,
//     color: '#64748B',
//     marginTop: 2,
//   },
//   trashIcon: {
//     padding: 8,
//     backgroundColor: '#FFF1F2',
//     borderRadius: 10,
//   },
//   finalTotalLabel: {
//     fontSize: 18,
//     fontWeight: '800',
//     color: '#0F766E',
//     textAlign: 'right',
//     marginTop: 10,
//     paddingTop: 12,
//     borderTopWidth: 2,
//     borderTopColor: '#5EEAD4',
//   },
//   deleteAllBtn: {
//     marginTop: 20,
//     padding: 14,
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#FDA4AF',
//     borderRadius: 12,
//     backgroundColor: '#FFF1F2',
//   },
//   resetBtn: {
//     marginTop: 100,
//     backgroundColor: '#0F766E',
//     paddingVertical: 16,
//     paddingHorizontal: 32,
//     borderRadius: 14,
//     alignSelf: 'center',
//   },
//   buttonText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: '700',
//     textAlign: 'center',
//   },
// });