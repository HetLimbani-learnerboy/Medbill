import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from "expo-router";
import { useAuth } from "../AuthContext";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

export default function Settings() {
  const { logout } = useAuth();
  const router = useRouter();
  const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState('');
  const [createdAt, setCreatedAt] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUsername(parsed.username || '');
        setEmail(parsed.email || '');
      }

      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setUsername(data.username);
        setPhoneNumber(data.phone_number || '');
        setEmail(data.email);
        setRole(data.role);
        setCreatedAt(data.created_at);
      }
    } catch (error) {
      console.error("Profile Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!username.trim() || !phoneNumber.trim()) {
      Alert.alert("Error", "Username and Phone cannot be empty");
      return;
    }

    try {
      setUpdating(true);
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/api/user/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          username: username,
          phone_number: phoneNumber
        })
      });

      if (response.ok) {
        const updatedUser = await response.json();
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          const userObj = JSON.parse(storedUser);
          await AsyncStorage.setItem('user', JSON.stringify({ ...userObj, username: username }));
        }
        
        setIsEditing(false);
        Alert.alert("Success", "Profile updated successfully");
      } else {
        Alert.alert("Error", "Failed to update profile");
      }
    } catch (error) {
      Alert.alert("Network Error", "Check your connection");
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.replace("/LandingPage");
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#0F766E" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Account Settings</Text>
            <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
              <Ionicons 
                name={isEditing ? "close-circle" : "pencil-outline"} 
                size={24} 
                color="#0F766E" 
              />
            </TouchableOpacity>
          </View>

          <View style={styles.newUserBox}>
            <Text style={styles.infoText}>Account Details</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Email:</Text>
              <Text style={styles.summaryValue}>{email}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Role:</Text>
              <Text style={[styles.summaryValue, { textTransform: 'capitalize' }]}>{role}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Joined:</Text>
              <Text style={styles.summaryValue}>{new Date(createdAt).toLocaleDateString()}</Text>
            </View>
          </View>

          <View style={styles.dashedLine} />

          <View style={styles.section}>
            <Text style={styles.subHeader}>Profile Information</Text>
            
            <Text style={styles.label}>Full Name</Text>
            {isEditing ? (
              <TextInput 
                style={styles.input} 
                value={username} 
                onChangeText={setUsername}
                placeholder="Enter username"
              />
            ) : (
              <View style={styles.displayBox}>
                <Text style={styles.displayText}>{username}</Text>
              </View>
            )}

            <Text style={styles.label}>Phone Number</Text>
            {isEditing ? (
              <TextInput 
                style={styles.input} 
                value={phoneNumber} 
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                placeholder="Enter phone number"
              />
            ) : (
              <View style={styles.displayBox}>
                <Text style={styles.displayText}>{phoneNumber || "Not provided"}</Text>
              </View>
            )}
          </View>

          {isEditing && (
            <TouchableOpacity 
              style={styles.button} 
              onPress={handleUpdate}
              disabled={updating}
            >
              {updating ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={[styles.button, { backgroundColor: '#F87171', marginTop: isEditing ? 12 : 30 }]} 
            onPress={handleLogout}
          >
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: "#E6F7F7", padding: 20, paddingTop: 50 },
  card: { backgroundColor: "white", padding: 25, borderRadius: 20, elevation: 6 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 26, fontWeight: "900", color: "#0F766E" },
  
  label: { fontSize: 14, fontWeight: "700", color: "#134E4A", marginBottom: 6 },
  input: { backgroundColor: "#F1F5F9", padding: 14, borderRadius: 12, borderWidth: 1, borderColor: "#CBD5F5", marginBottom: 16, fontSize: 16 },
  displayBox: { backgroundColor: "#F8FAFC", padding: 14, borderRadius: 12, borderWidth: 1, borderColor: "#E2E8F0", marginBottom: 16 },
  displayText: { fontSize: 16, color: "#1E293B", fontWeight: "600" },

  newUserBox: {
    backgroundColor: "#F0FDFA",
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#5EEAD4",
    marginBottom: 15,
  },
  infoText: {
    fontSize: 12,
    color: "#0D9488",
    fontWeight: "800",
    marginBottom: 10,
    textTransform: "uppercase"
  },
  dashedLine: { borderWidth: 1, borderColor: "#CBD5F5", borderStyle: "dashed", height: 0, width: "100%", marginVertical: 15 },
  subHeader: { fontSize: 18, fontWeight: "800", color: "#0F766E", marginBottom: 15 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  summaryLabel: { color: "#64748B", fontSize: 14, fontWeight: "600" },
  summaryValue: { fontWeight: "700", color: "#1E293B", fontSize: 15 },
  button: { backgroundColor: "#14B8A6", padding: 16, borderRadius: 12, alignItems: "center", marginTop: 10 },
  buttonText: { color: "white", fontSize: 18, fontWeight: "bold" },
  section: { marginTop: 5 }
});