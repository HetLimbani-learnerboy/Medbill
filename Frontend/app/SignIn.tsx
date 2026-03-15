import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const API_URL = `${process.env.EXPO_PUBLIC_BACKEND_URL}/api`;

const SignIn: React.FC = () => {

  const navigation: any = useNavigation();

  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const handleSignIn = async () => {

    if (!formData.email || !formData.password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setLoading(true);

    try {

      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      setLoading(false);

      if (response.ok) {
        Alert.alert("Success", "Login successful");
        navigation.navigate("index");
      } else {
        Alert.alert("Login Failed", data.message || "Invalid credentials");
      }

    } catch (error) {
      setLoading(false);
      Alert.alert("Server Error", "Please try again later");
    }

  };

  return (
    <ScrollView contentContainerStyle={styles.container}>

      <Text style={styles.title}>Sign In</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={formData.email}
        onChangeText={(value) =>
          setFormData({ ...formData, email: value })
        }
      />

      <View style={styles.passwordWrapper}>

        <TextInput
          placeholder="Password"
          style={styles.passwordInput}
          secureTextEntry={!passwordVisible}
          value={formData.password}
          onChangeText={(value) =>
            setFormData({ ...formData, password: value })
          }
        />

        <TouchableOpacity
          onPress={() => setPasswordVisible(!passwordVisible)}
        >
          <Image
            source={
              passwordVisible
                ? require("../assets/eye_open.png")
                : require("../assets/eye-close.png")
            }
            style={styles.eye}
          />
        </TouchableOpacity>

      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleSignIn}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Sign In</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => alert("Forgot Password functionality is not implemented yet")}>
        <Text style={styles.linkText}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
        <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>

    </ScrollView>
  );
};

export default SignIn;

const styles = StyleSheet.create({

  container: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 25,
    backgroundColor: "#E6F7F7",
  },

  title: {
    fontSize: 32,
    fontWeight: "900",
    color: "#0F766E",
    marginBottom: 35,
    textAlign: "center"
  },

  input: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },

  passwordWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    paddingHorizontal: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },

  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1E293B"
  },

  eye: {
    width: 22,
    height: 22,
    backgroundColor: "transparent"
  },

  button: {
    width: "100%",
    backgroundColor: "#14B8A6",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#14B8A6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4
  },

  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold"
  },

  linkText: {
    textAlign: "center",
    marginTop: 18,
    fontSize: 14,
    color: "#0F766E",
    fontWeight: "600"
  }

});