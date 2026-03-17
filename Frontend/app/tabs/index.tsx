// // Bugs: there occurs a case when if you click on "Next", the same moment when any qr code is scanned, the "Next" button becomes unresponsive
// // Fix: If price="0.8.7", then price=0.8
// // tryremovingdown

// import React, { useState, useRef } from 'react';
// import { 
//   Text, View, TextInput, TouchableOpacity, Modal, 
//   Alert, ScrollView, Linking,
//   StyleSheet, Platform
// } from 'react-native';
// import { useRouter } from "expo-router";
// import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';

// // Define the shape of the API response
// interface FoodProductResponse {
//   status: number;
//   product?: {
//     product_name?: string;
//   };
// }

// // Define the shape of our Cart Item
// interface CartItem {
//   code: string;
//   name: string;
//   price: number;
//   quantity: number;
// }

// export default function Index() {
//   const [permission, requestPermission] = useCameraPermissions();
//   const [zoom, setZoom] = useState<number>(0);
//   const [scannedItem, setScannedItem] = useState<string | null>(null);
//   const customerPhone = "1231231234";
//   const router=useRouter();
  
//   // Ref for the "Lock"
//   const isProcessing = useRef<boolean>(false);

//   // States for Cart & Item Modal
//   const [cart, setCart] = useState<CartItem[]>([]);
//   const [modalVisible, setModalVisible] = useState<boolean>(false);
//   const [currentItem, setCurrentItem] = useState<{name: string, code: string} | null>(null);
//   const [priceInput, setPriceInput] = useState<string>('');
//   const [quantityInput, setQuantityInput] = useState<string>('1');

//   // NEW: State for Bill Summary Modal
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

//   // Helper function to reset locks
//   const resetScanner = () => {
//     isProcessing.current = false;
//     setScannedItem(null);
//   };

//   // Show the Item Entry Modal
//   const showSuccessAlert = (name: string, code: string) => {
//     setCurrentItem({ name, code });
//     setPriceInput('');      
//     setQuantityInput('1');  
//     setModalVisible(true);  
//   };
  
//   // Handle adding to cart
//   const handleAddItem = () => {
//     // For price validation
//     if (priceInput.split('.').length > 2) {
//       alert("Please enter a proper price")
//       return;
//     }
//     if (!priceInput || priceInput.trim() === "") {
//       alert("Please enter a price.");
//       return;
//     }
//     const numericPrice = parseFloat(priceInput);
//     if (isNaN(numericPrice) || numericPrice <= 0) {
//       alert("Please enter a valid price greater than zero.");
//       return;
//     }
    
//     if (currentItem) {
//       const newItem: CartItem = {
//         code: currentItem.code,
//         name: currentItem.name,
//         price: parseFloat(priceInput) || 0, 
//         quantity: parseInt(quantityInput, 10) || 1, 
//       };
      
//       setCart((prevCart) => [...prevCart, newItem]);
//     }

//     setModalVisible(false);
//     resetScanner();
//   };

//   // // Handle rescanning (canceling Item Modal)
//   // const handleRescan = () => {
//   //   setBillModalVisible(false);
//   //   resetScanner();
//   // };

//   const handleBarcodeScanned = async ({ data }: BarcodeScanningResult) => {
//     if (isProcessing.current) return;
    
//     isProcessing.current = true;
//     setScannedItem(data); 

//     try {
//       const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${data}.json`);
//       const result: FoodProductResponse = await response.json();

//       if (result.status === 1 && result.product) {
//         const productName = result.product.product_name || "Unknown Item";
//         showSuccessAlert(productName, data);
//       } else {
//         Alert.alert(
//           "Not Found", 
//           `Barcode ${data} not in global database. Manual entry needed.`,
//           [{ text: "OK", onPress: resetScanner }]
//         );
//       }
//     } catch (error) {
//       console.error(error);
//       Alert.alert("Error", "Failed to fetch product data.");
//       resetScanner();
//     }
//   };

//   // Calculate Bill Totals
//   const calculateBill = () => {
//     const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
//     const gstRate = 0.18; // 18% GST - adjust as needed
//     const gstAmount = subtotal * gstRate;
//     const finalTotal = subtotal + gstAmount;

//     return { subtotal, gstAmount, finalTotal };
//   };
  
//   const { subtotal, gstAmount, finalTotal } = calculateBill();

//   // handling Buttons for Bill summary


//   // 1. Scan More (just close modal and trigger camera)
//   const handleRescan = () => {
//     setModalVisible(false);
//     setBillModalVisible(false);
//     resetScanner();
//   };

//   // 2. Delete All (With confirmation)
//   const handleDeleteAll = () => {
//     Alert.alert(
//       "Delete Everything?",
//       "This will clear all items. This action cannot be undone.",
//       [
//         { text: "Cancel", style: "cancel" },
//         { text: "Delete", style: "destructive", onPress: () => {setCart([]); setBillModalVisible(false);} }
//       ]
//     );
//   };

//   // 3. Create Bill and send bill to customer using SMS
//   // const handleCreateSMS = (phoneNumber: String) => {
//   //   // const message = `Invoice total: ${priceInput}`;
//   //   // const url = `sms:${phoneNumber}${Platform.OS === 'ios' ? '&' : '?'}body=${encodeURIComponent(message)}`;
    
//   //   // Linking.openURL(url).catch(err => console.error("Error opening SMS", err));
//   //   console.log("SMS sent")
//   //   // use the backend logic
//   //   setCart([]);
//   //   setBillModalVisible(false);
//   // };

//   // 4. Create Bill and Print (Placeholder for printing logic)
//   // const handlePrint = () => {
//   //   console.log("Sending to printer...");
//   //   // You would typically use react-native-print here
//   //   setCart([]);
//   //   setBillModalVisible(false);
//   // };

//   const handlePreivew=()=>{
//     router.replace('/tabs/preview')
//   }
  

//   return (
//     <View style={styles.container}>
//       <CameraView
//         style={StyleSheet.absoluteFillObject}
//         zoom={zoom}
//         // Prevent scanning if processing, OR if the Item modal is open, OR if the Bill modal is open
//         // tryremovingdown to isProcessing.current || modalVisible || billModalVisible to scannedItem
//         onBarcodeScanned={(isProcessing.current || modalVisible || billModalVisible) ? undefined : handleBarcodeScanned}
//         barcodeScannerSettings={{
//           barcodeTypes: ["qr", "ean13", "code128"],
//         }}
//       />

//       <TouchableOpacity 
//         style={styles.zoomCircle} 
//         onPress={() => setZoom(prev => (prev === 0 ? 0.3 : 0))}
//       >
//         <Text style={styles.zoomText}>{zoom === 0 ? '1x' : '3x'}</Text>
//       </TouchableOpacity>

//       <View style={styles.overlay} pointerEvents="none">
//         <View 
//           style={[
//             styles.targetBox, 
//             { borderColor: scannedItem ? '#4CAF50' : '#FFF' }
//           ]} 
//         />
//         <Text style={styles.hintText}>
//           {scannedItem ? "Processing..." : "Align barcode inside box"}
//         </Text>
//       </View>

//       <View style={styles.bottomButtonContainer}>
//           <TouchableOpacity 
//             style={styles.nextButton} 
//             onPress={() => {

//               // tryremovingdown the below line
//               // Prevent clicking next if currently fetching an item
//               if (isProcessing.current) return;
              
//               if (cart.length === 0) {
//                 Alert.alert("Cart is Empty", "Please scan some items first.");
//                 return;
//               }
//               setBillModalVisible(true);
//           }}>
//             <Text style={styles.nextButtonText}>Next({cart.length})</Text>
//           </TouchableOpacity>
//       </View>

//       {/* --- MODAL 1: ADD ITEM (PRICE & QUANTITY) --- */}
//       <Modal
//         animationType="fade"
//         transparent={true}
//         visible={modalVisible}
//         onRequestClose={handleRescan}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContainer}>
//             <Text style={styles.modalTitle}>Item Found!</Text>
//             <Text style={styles.modalSubtext}>{currentItem?.name}</Text>

//             <View style={styles.inputGroup}>
//               <Text style={styles.inputLabel}>Price</Text>
//               <TextInput
//                 style={styles.input}
//                 placeholder="0.00"
//                 keyboardType="numeric"
//                 value={priceInput}
//                 onChangeText={setPriceInput}
//               />
//             </View>

//             <View style={styles.inputGroup}>
//               <Text style={styles.inputLabel}>Quantity</Text>
//               <TextInput
//                 style={styles.input}
//                 keyboardType="numeric"
//                 value={quantityInput}
//                 onChangeText={setQuantityInput}
//               />
//             </View>

//             <View style={styles.modalButtons}>
//               <TouchableOpacity style={[styles.modalBtn, styles.rescanBtn]} onPress={handleRescan}>
//                 <Text style={styles.rescanBtnText}>Rescan</Text>
//               </TouchableOpacity>
//               <TouchableOpacity style={[styles.modalBtn, styles.addBtn]} onPress={handleAddItem}>
//                 <Text style={styles.addBtnText}>Add Item</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>

//       {/* --- MODAL 2: BILL SUMMARY --- */}
//       <Modal
//         animationType="slide"
//         transparent={true}
//         visible={billModalVisible}
//         onRequestClose={() => setBillModalVisible(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={[styles.modalContainer, styles.billContainer]}>
//             <Text style={styles.modalTitle}>Bill Summary</Text>
            
//             {/* Scrollable list of scanned items */}
//             <ScrollView style={styles.billList} showsVerticalScrollIndicator={false}>
//               {cart.map((item, index) => (
//                 <View key={index} style={styles.billItemRow}>
//                   <View style={styles.billItemDetails}>
//                     <Text style={styles.billItemName} numberOfLines={1}>{item.name}</Text>
//                     <Text style={styles.billItemSub}>Qty: {item.quantity} × ₹{item.price.toFixed(2)}</Text>
//                   </View>
//                   <Text style={styles.billItemTotal}>₹{(item.price * item.quantity).toFixed(2)}</Text>
//                 </View>
//               ))}
//             </ScrollView>

//             {/* Calculations Breakdown */}
//             <View style={styles.billTotalsContainer}>
//               <View style={styles.billTotalRow}>
//                 <Text style={styles.billTotalLabel}>Subtotal:</Text>
//                 <Text style={styles.billTotalValue}>₹{subtotal.toFixed(2)}</Text>
//               </View>
//               <View style={styles.billTotalRow}>
//                 <Text style={styles.billTotalLabel}>GST (18%):</Text>
//                 <Text style={styles.billTotalValue}>₹{gstAmount.toFixed(2)}</Text>
//               </View>
//               <View style={[styles.billTotalRow, styles.finalTotalRow]}>
//                 <Text style={styles.finalTotalLabel}>Final Total:</Text>
//                 <Text style={styles.finalTotalValue}>₹{finalTotal.toFixed(2)}</Text>
//               </View>
//             </View>

//             <View style={styles.modalButtons}>
//               <TouchableOpacity style={[styles.modalBtn, styles.rescanBtn]} onPress={handleRescan}>
//                 <Text style={styles.rescanBtnText}>Scan More</Text>
//               </TouchableOpacity>
//               <TouchableOpacity style={[styles.modalBtn, styles.addBtn, styles.deleteBtn]} onPress={handleDeleteAll}>
//                 <Text style={styles.addBtnText}>Delete all</Text>
//               </TouchableOpacity>
//             </View>
//             <View style={styles.modalButtons}>
//               {/* <TouchableOpacity style={[styles.modalBtn, styles.rescanBtn, {backgroundColor: '#2196F3'} ]} onPress={() => handleCreateSMS(customerPhone)}>
//                 <Text style={styles.addBtnText}>Create(SMS)</Text>
//               </TouchableOpacity>
//               <TouchableOpacity style={[styles.modalBtn, styles.addBtn]} onPress={handlePrint}>
//                 <Text style={styles.addBtnText}>Create(Print)</Text>
//               </TouchableOpacity> */}
//                <TouchableOpacity style={[styles.modalBtn, styles.addBtn]} onPress={handlePreivew}>
//                 <Text style={styles.addBtnText}>Preview</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
  // container: { flex: 1, backgroundColor: '#000' },
  // zoomCircle: {
  //   position: 'absolute', top: 60, right: 20, width: 50, height: 50, borderRadius: 25,
  //   backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center',
  //   borderWidth: 1, borderColor: '#fff', zIndex: 10,
  // },
  // zoomText: { color: '#fff', fontWeight: 'bold' },
  // overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  // targetBox: { width: 250, height: 250, borderWidth: 2, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.05)' },
  // hintText: { color: '#fff', marginTop: 20, backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 15, paddingVertical: 5, borderRadius: 5 },
  // resetBtn: { alignSelf: 'center', marginTop: 100, backgroundColor: '#2196F3', padding: 20, borderRadius: 10 },
  // buttonText: { color: '#fff', fontWeight: 'bold' },
  // bottomButtonContainer: { position: 'absolute', bottom: 40, left: 0, right: 0, alignItems: 'center' },
  // nextButton: {
  //   backgroundColor: '#4CAF50', paddingVertical: 15, paddingHorizontal: 60, borderRadius: 30,
  //   elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84,
  // },
  // nextButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold', textTransform: 'uppercase' },

  // // --- MODAL STYLES ---
  // modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  // modalContainer: {
  //   width: '85%', backgroundColor: '#FFF', borderRadius: 15, padding: 20,
  //   elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4,
  // },
  // modalTitle: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 5 },
  // modalSubtext: { fontSize: 16, color: '#555', textAlign: 'center', marginBottom: 20 },
  // inputGroup: { marginBottom: 15 },
  // inputLabel: { fontSize: 14, fontWeight: '600', marginBottom: 5, color: '#333' },
  // input: { borderWidth: 1, borderColor: '#CCC', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontSize: 16 },
  // modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  // modalBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  // rescanBtn: { backgroundColor: '#E0E0E0', marginRight: 10 },
  // addBtn: { backgroundColor: '#2196F3', marginLeft: 10 },
  // rescanBtnText: { color: '#333', fontWeight: 'bold', fontSize: 16 },
  // addBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },

  // // --- BILL SUMMARY SPECIFIC STYLES ---
  // billContainer: { maxHeight: '80%' }, // Keep it from going off-screen if cart is huge
  // billList: { flexGrow: 0, maxHeight: 250, borderBottomWidth: 1, borderBottomColor: '#EEE', marginBottom: 15 },
  // billItemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  // billItemDetails: { flex: 1, paddingRight: 10 },
  // billItemName: { fontSize: 16, fontWeight: '500', color: '#333' },
  // billItemSub: { fontSize: 13, color: '#666', marginTop: 2 },
  // billItemTotal: { fontSize: 16, fontWeight: '600', color: '#333' },
  
  // billTotalsContainer: { backgroundColor: '#F9F9F9', padding: 15, borderRadius: 10 },
  // billTotalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  // billTotalLabel: { fontSize: 15, color: '#555' },
  // billTotalValue: { fontSize: 15, fontWeight: '500', color: '#333' },
  // finalTotalRow: { marginTop: 5, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#DDD' },
  // finalTotalLabel: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  // finalTotalValue: { fontSize: 18, fontWeight: 'bold', color: '#4CAF50' },

//   // Delete Button Styling
//   deleteBtn: {
//     backgroundColor: '#FF3B30', // Standard iOS/Material Red
//     borderWidth: 1,
//     borderColor: '#D32F2F',
//   },
//   deleteBtnText: {
//     color: '#FFFFFF',
//     fontWeight: 'bold',
//   },
// });


import React, { useState, useRef } from 'react';
import { 
  Text, View, TextInput, TouchableOpacity, Modal, 
  Alert, ScrollView, StyleSheet 
} from 'react-native';
import { useRouter } from "expo-router";
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { useCart } from '../CartContext'; 
import { Ionicons } from "@expo/vector-icons";

interface FoodProductResponse {
  status: number;
  product?: { product_name?: string; };
}

export default function Index() {
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
});