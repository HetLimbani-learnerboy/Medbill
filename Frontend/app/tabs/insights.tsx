import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const InsightsScreen = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/insights/top-demand`);
      const result = await response.json();

      if (result.status === "success") {
        // ✅ Sort descending by prediction
        const sortedData = [...result.data].sort(
          (a, b) => b.Jan_Prediction - a.Jan_Prediction
        );
        setData(sortedData);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error("MedBill API Error:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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
      ) : data.length === 0 ? (
        <Text style={styles.emptyText}>No insights available</Text>
      ) : (
        data.map((item, index) => (
          <View key={index} style={styles.medCard}>
            
            {/* Rank */}
            <View style={styles.rankBadge}>
              <Text style={styles.rankText}>#{index + 1}</Text>
            </View>

            {/* Drug Info */}
            <View style={styles.medInfo}>
              <Text style={styles.medName}>
                {item.drug_name.replace(/_/g, ' ')}
              </Text>
              <Text style={styles.subText}>Projected Demand</Text>
            </View>

            {/* Value */}
            <View style={styles.valueBadge}>
              <Text style={styles.valueText}>
                {item.Jan_Prediction}
              </Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    padding: 20
  },

  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 20
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4B5563',
    marginVertical: 15
  },

  refreshCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    gap: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    marginBottom: 10
  },

  refreshText: {
    fontWeight: '700',
    color: '#111827'
  },

  medCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#10B981'
  },

  rankBadge: {
    backgroundColor: '#E5E7EB',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginRight: 10
  },

  rankText: {
    fontWeight: '700',
    color: '#111827'
  },

  medInfo: {
    flex: 1
  },

  medName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1F2937',
    textTransform: 'capitalize'
  },

  subText: {
    fontSize: 12,
    color: '#9CA3AF'
  },

  valueBadge: {
    backgroundColor: '#FEE2E2',
    padding: 8,
    borderRadius: 8
  },

  valueText: {
    color: '#B91C1C',
    fontWeight: 'bold',
    fontSize: 16
  },

  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#6B7280',
    fontSize: 16
  }
});

export default InsightsScreen;