import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const InsightsScreen = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      // Replace with your actual machine IP for testing on physical device
      const response = await fetch('http://localhost:5000/insights/top-demand');
      const result = await response.json();
      setData(result.data);
    } catch (error) {
      console.error("MedBill API Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>MedBill Insight Hub</Text>
      
      {/* Refresh Tool */}
      <TouchableOpacity style={styles.refreshCard} onPress={loadData}>
        <Ionicons name="analytics" size={28} color="#111827" />
        <Text style={styles.refreshText}>Re-run Prediction Model</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Priority Focus: Jan 2025</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#10B981" style={{ marginTop: 40 }} />
      ) : (
        data.map((item: any, index: number) => (
          <View key={index} style={styles.medCard}>
            <View style={styles.medInfo}>
              <Text style={styles.medName}>{item.drug_name.replace(/_/g, ' ')}</Text>
              <Text style={styles.subText}>Projected Patient Turn-away</Text>
            </View>
            <View style={styles.valueBadge}>
              <Text style={styles.valueText}>{parseFloat(item.predicted_patients_turned_away_Jan2025).toFixed(1)}</Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6', padding: 20 },
  title: { fontSize: 26, fontWeight: '800', color: '#111827', marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#4B5563', marginVertical: 15 },
  refreshCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    flexDirection: 'column',
    gap: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  refreshText: { fontWeight: '700', color: '#111827' },
  medCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  medInfo: { flex: 1 },
  medName: { fontSize: 15, fontWeight: 'bold', color: '#1F2937', textTransform: 'capitalize' },
  subText: { fontSize: 12, color: '#9CA3AF' },
  valueBadge: { backgroundColor: '#FEE2E2', padding: 8, borderRadius: 8 },
  valueText: { color: '#B91C1C', fontWeight: 'bold', fontSize: 16 }
});

export default InsightsScreen;