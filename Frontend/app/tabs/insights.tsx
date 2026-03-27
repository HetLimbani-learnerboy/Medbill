// import { Ionicons } from '@expo/vector-icons';
// import React, { useEffect, useState } from 'react';
// import {
//   ActivityIndicator,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View
// } from 'react-native';

// const InsightsScreen = () => {
//   const [data, setData] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

//   const loadData = async () => {
//     setLoading(true);
//     try {
//       const response = await fetch(`${BASE_URL}/api/insights/top-demand`);
//       const result = await response.json();

//       if (result.status === "success") {
//         // ✅ Sort descending by prediction
//         const sortedData = [...result.data].sort(
//           (a, b) => b.Jan_Prediction - a.Jan_Prediction
//         );
//         setData(sortedData);
//       } else {
//         setData([]);
//       }
//     } catch (error) {
//       console.error("MedBill API Error:", error);
//       setData([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadData();
//   }, []);

//   return (
//     <ScrollView style={styles.container}>
//       <Text style={styles.title}>MedBill Insight Hub</Text>

//       {/* Refresh Tool */}
//       <TouchableOpacity style={styles.refreshCard} onPress={loadData}>
//         <Ionicons name="analytics" size={28} color="#111827" />
//         <Text style={styles.refreshText}>Re-run Prediction Model</Text>
//       </TouchableOpacity>

//       <Text style={styles.sectionTitle}>Priority Focus: Jan 2025</Text>

//       {loading ? (
//         <ActivityIndicator size="large" color="#10B981" style={{ marginTop: 40 }} />
//       ) : data.length === 0 ? (
//         <Text style={styles.emptyText}>No insights available</Text>
//       ) : (
//         data.map((item, index) => (
//           <View key={index} style={styles.medCard}>
            
//             {/* Rank */}
//             <View style={styles.rankBadge}>
//               <Text style={styles.rankText}>#{index + 1}</Text>
//             </View>

//             {/* Drug Info */}
//             <View style={styles.medInfo}>
//               <Text style={styles.medName}>
//                 {item.drug_name.replace(/_/g, ' ')}
//               </Text>
//               <Text style={styles.subText}>Projected Demand</Text>
//             </View>

//             {/* Value */}
//             <View style={styles.valueBadge}>
//               <Text style={styles.valueText}>
//                 {item.Jan_Prediction}
//               </Text>
//             </View>
//           </View>
//         ))
//       )}
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F3F4F6',
//     padding: 20
//   },

//   title: {
//     fontSize: 26,
//     fontWeight: '800',
//     color: '#111827',
//     marginBottom: 20
//   },

//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#4B5563',
//     marginVertical: 15
//   },

//   refreshCard: {
//     backgroundColor: '#FFFFFF',
//     padding: 20,
//     borderRadius: 16,
//     alignItems: 'center',
//     gap: 8,
//     elevation: 4,
//     shadowColor: '#000',
//     shadowOpacity: 0.1,
//     shadowRadius: 10,
//     marginBottom: 10
//   },

//   refreshText: {
//     fontWeight: '700',
//     color: '#111827'
//   },

//   medCard: {
//     backgroundColor: '#FFF',
//     padding: 16,
//     borderRadius: 12,
//     marginBottom: 10,
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderLeftWidth: 4,
//     borderLeftColor: '#10B981'
//   },

//   rankBadge: {
//     backgroundColor: '#E5E7EB',
//     paddingVertical: 6,
//     paddingHorizontal: 10,
//     borderRadius: 8,
//     marginRight: 10
//   },

//   rankText: {
//     fontWeight: '700',
//     color: '#111827'
//   },

//   medInfo: {
//     flex: 1
//   },

//   medName: {
//     fontSize: 15,
//     fontWeight: 'bold',
//     color: '#1F2937',
//     textTransform: 'capitalize'
//   },

//   subText: {
//     fontSize: 12,
//     color: '#9CA3AF'
//   },

//   valueBadge: {
//     backgroundColor: '#FEE2E2',
//     padding: 8,
//     borderRadius: 8
//   },

//   valueText: {
//     color: '#B91C1C',
//     fontWeight: 'bold',
//     fontSize: 16
//   },

//   emptyText: {
//     textAlign: 'center',
//     marginTop: 40,
//     color: '#6B7280',
//     fontSize: 16
//   }
// });

// export default InsightsScreen;

import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

// Make sure to use your actual backend URL here
const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

interface ForecastData {
  drug_name: string;
  Jan_Prediction: number;
}

export default function InsightsScreen() {
  const [data, setData] = useState<ForecastData[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/insights/top-demand`);
      const result = await response.json();

      if (result.status === "success" && result.data) {
        setData(result.data); 
      }
    } catch (error) {
      console.error("Error fetching insights:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Max value finder
  const maxValFinder = () => {
    
    // data is of form => [name, quantity]
    const targetColValues = data.map(row => row.Jan_Prediction).filter(value => typeof value === 'number' && !isNaN(value));
    const maxVal = targetColValues.length > 0 ? Math.max(...targetColValues) : -1

    return maxVal
  }

  // Determine Demand Level and Styling based on predicted quantity
  const getDemandLevel = (quantity: number) => {
    const maxVal: number = maxValFinder();
    if (quantity / maxVal >= 0.66) {
      return { label: 'High', color: '#EF4444', icon: 'trending-up' }; // Red
    }
    if (quantity / maxVal >= 0.33 && quantity / maxVal < 0.66) {
      return { label: 'Medium', color: '#F59E0B', icon: 'trending-up' }; // Orange/Yellow
    }
    return { label: 'Low', color: '#10B981', icon: 'trending-down' }; // Green
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} />}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Demand Forecast</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0F766E" style={{ marginTop: 50 }} />
      ) : data.length === 0 ? (
        <Text style={styles.emptyText}>No demand data available</Text>
      ) : (
        <View style={styles.listContainer}>
          {data.map((item, index) => {
            const demandInfo = getDemandLevel(item.Jan_Prediction || 0);
            
            return (
              <View key={index} style={styles.card}>
                
                {/* Top Half: Name and Badge */}
                <View style={styles.cardHeader}>
                  <Text style={styles.drugName} numberOfLines={2}>
                    {item.drug_name.replace(/_/g, ' ') || 'Unknown'}
                  </Text>
                  
                  {/* Dynamic Demand Badge */}
                  <View style={[styles.badge, { backgroundColor: demandInfo.color + '1A' }]}>
                    <Ionicons 
                      name={demandInfo.icon as any} 
                      size={14} 
                      color={demandInfo.color} 
                      style={{ marginRight: 4 }} 
                    />
                    <Text style={[styles.badgeText, { color: demandInfo.color }]}>
                      {demandInfo.label}
                    </Text>
                  </View>
                </View>
                
                {/* Bottom Half: Quantity Details */}
                <View style={styles.cardBody}>
                  <Text style={styles.quantityLabel}>Estimated Demand (Qty)</Text>
                  <Text style={styles.quantityValue}>{item.Jan_Prediction || 0}</Text>
                </View>

              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
  },
  listContainer: {
    padding: 16,
    gap: 12, // Native gap support for spacing between items
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  drugName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1, 
    marginRight: 12, // Prevents text from pushing into the badge
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  quantityLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  quantityValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F766E', // Matches your primary Teal theme
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#6B7280',
  }
});