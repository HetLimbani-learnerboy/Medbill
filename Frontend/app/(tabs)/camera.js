import React, { useState, useRef } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [zoom, setZoom] = useState(0);
  const [scannedItem, setScannedItem] = useState(null);
  
  // Use a Ref for the "Lock" - this updates instantly unlike State
  const isProcessing = useRef(false);

  if (!permission?.granted) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.resetBtn} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Camera Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // original workings
  // const handleBarcodeScanned = ({ data }) => {
  //   // 1. Immediate Lock: Ignore if we are already processing a scan
  //   if (isProcessing.current) return;
    
  //   isProcessing.current = true; // Lock it instantly
  //   setScannedItem(data);

  //   // 2. Show the Alert
  //   Alert.alert(
  //     "Medicine Scanned",
  //     `ID: ${data}`,
  //     [
  //       { 
  //         text: "Add to Bill", 
  //         onPress: () => {
  //           // Logic to add to cart goes here
  //           console.log("Added to cart:", data);
            
  //           // 3. Unlock for the next item only after the user acknowledges
  //           isProcessing.current = false; 
  //           setScannedItem(null);
  //         } 
  //       }
  //     ],
  //     { cancelable: false } // Force them to tap the button to reset
  //   );
  // };

  // trying lookup
  const handleBarcodeScanned = async ({ data }) => {
    if (isProcessing.current) return;
    isProcessing.current = true;

    try {
      // 1. Try a free general lookup (Example: OpenFoodFacts for general items)
      let response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${data}.json`);
      let result = await response.json();

      if (result.status === 1) {
        const productName = result.product.product_name || "Unknown Item";
        showSuccessAlert(productName, data);
      } else {
        // 2. Fallback: If not found, check your custom Medicine Database (Firebase/Supabase)
        // searchLocalMedicineDatabase(data);
        Alert.alert(
          "Not Found", 
          `Barcode ${data} not in global database. Manual entry needed.`,
          [{ text: "OK", onPress: resetScanner }]
        );
      }
    } catch (error) {
      console.error(error);
      resetScanner();
    }
  };

  // 2. Helper function to reset both locks
  const resetScanner = () => {
    isProcessing.current = false;
    setScannedItem(null);
  };

  const showSuccessAlert = (name, code) => {
    Alert.alert(
      "Item Found",
      `Name: ${name}\nBarcode: ${code}`,
      [{ text: "Add to Bill", onPress: () => { isProcessing.current = false; } }]
    );
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        zoom={zoom}
        onBarcodeScanned={scannedItem ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr", "ean13", "code128"],
        }}
      />

      {/* Zoom Toggle */}
      <TouchableOpacity 
        style={styles.zoomCircle} 
        onPress={() => setZoom(prev => prev === 0 ? 0.3 : 0)}
      >
        <Text style={styles.zoomText}>{zoom === 0 ? '1x' : '3x'}</Text>
      </TouchableOpacity>

      {/* Visual Target Frame */}
      <View style={styles.overlay} pointerEvents="none">
        <View style={[styles.targetBox, { borderColor: scannedItem ? '#4CAF50' : '#FFF' }]} />
        <Text style={styles.hintText}>
          {scannedItem ? "Processing..." : "Align barcode inside box"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  zoomCircle: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff'
  },
  zoomText: { color: '#fff', fontWeight: 'bold' },
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  targetBox: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.05)'
  },
  hintText: { color: '#fff', marginTop: 20, backgroundColor: 'rgba(0,0,0,0.5)', padding: 5 },
  resetBtn: { alignSelf: 'center', marginTop: 100, backgroundColor: '#2196F3', padding: 20, borderRadius: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold' }
});