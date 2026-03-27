import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

// Get the full width of the mobile screen
const screenWidth = Dimensions.get('window').width;

export default function RevenueChart() {
  // Dummy data for the last 6 months (Oct 2025 - Mar 2026)
  const chartData = {
    labels: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
    datasets: [
      {
        data: [12, 15, 14, 18, 20, 24], // Representing thousands (₹12k, ₹15k, etc.)
        color: (opacity = 1) => `rgba(15, 118, 110, ${opacity})`, // Teal line
        strokeWidth: 3, // Thickness of the line
      },
    ],
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0, // No decimals on the Y-axis labels
    color: (opacity = 1) => `rgba(15, 118, 110, ${opacity})`, // Line and dot colors
    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`, // Gray text for labels
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '5',
      strokeWidth: '2',
      stroke: '#047857', // Darker teal border for dots
    },
    propsForBackgroundLines: {
      strokeDasharray: '', // Removes the dotted background lines for a cleaner look
      stroke: '#E5E7EB', // Light gray background lines
    }
  };

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Revenue Overview</Text>
      
      <LineChart
        data={chartData}
        width={screenWidth - 32} // Screen width minus padding on left/right
        height={220}
        yAxisLabel="₹"
        yAxisSuffix="k"
        chartConfig={chartConfig}
        bezier // This makes the line curvy and smooth instead of jagged
        style={styles.chartStyle}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  chartContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center', // Centers the chart
    // Subtle shadow for 3D card effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2, 
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827', // Dark gray
    alignSelf: 'flex-start',
    marginLeft: 16,
    marginBottom: 12,
  },
  chartStyle: {
    marginVertical: 8,
    borderRadius: 16,
  },
});