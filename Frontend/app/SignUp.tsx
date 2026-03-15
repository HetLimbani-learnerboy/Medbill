import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const API_URL = `${process.env.EXPO_PUBLIC_BACKEND_URL}/api`;
const { width } = Dimensions.get("window");

const SignUp: React.FC = () => {

  const navigation: any = useNavigation();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [passwordValid, setPasswordValid] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    special: false,
    match: false,
  });

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true
      })
    ]).start();
  }, []);

  const safeJson = async (res: Response) => {
    try {
      return await res.json();
    } catch {
      return {};
    }
  };

  const handlePasswordChange = (value: string) => {
    setFormData({ ...formData, password: value });

    setPasswordValid({
      length: value.length >= 8,
      upper: /[A-Z]/.test(value),
      lower: /[a-z]/.test(value),
      number: /[0-9]/.test(value),
      special: /[!@#$%^&*]/.test(value),
      match: value === formData.confirmPassword,
    });
  };

  const handleConfirmPasswordChange = (value: string) => {
    setFormData({ ...formData, confirmPassword: value });

    setPasswordValid((prev) => ({
      ...prev,
      match: value === formData.password,
    }));
  };

  const isPasswordAllValid =
    passwordValid.length &&
    passwordValid.upper &&
    passwordValid.lower &&
    passwordValid.number &&
    passwordValid.special &&
    passwordValid.match;

  const handleSignupSubmit = async () => {

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      Alert.alert("Required Fields", "Please fill all fields.");
      return;
    }

    if (!isPasswordAllValid) {
      Alert.alert(
        "Password Error",
        "Password must contain:\n• 8 characters\n• Uppercase\n• Lowercase\n• Number\n• Special character\n• Passwords must match"
      );
      return;
    }

    setLoading(true);

    try {
      const signupRes = await fetch(`${API_URL}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const signupData = await safeJson(signupRes);

      if (!signupRes.ok) {
        Alert.alert("Signup Failed", signupData.message || "Error");
        setLoading(false);
        return;
      }

      Alert.alert("Success", "Account created successfully");
      navigation.navigate("index");

    } catch {
      Alert.alert("Server Error", "Please try again later.");
    }

    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>

        <Animated.View
          style={[
            styles.card,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >

          <Text style={styles.title}>Create Account</Text>

          <TextInput
            placeholder="Full Name"
            style={styles.input}
            value={formData.name}
            onChangeText={(v) => setFormData({ ...formData, name: v })}
          />

          <TextInput
            placeholder="Email"
            style={styles.input}
            value={formData.email}
            onChangeText={(v) => setFormData({ ...formData, email: v })}
          />

          <View style={styles.passwordWrapper}>
            <TextInput
              placeholder="Password"
              style={styles.passwordInput}
              secureTextEntry={!passwordVisible}
              value={formData.password}
              onChangeText={handlePasswordChange}
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

          <View style={styles.rules}>
            <Text style={{ color: passwordValid.length ? "#16A34A" : "#EF4444" }}>
              • Minimum 8 characters
            </Text>
            <Text style={{ color: passwordValid.upper ? "#16A34A" : "#EF4444" }}>
              • Uppercase letter
            </Text>
            <Text style={{ color: passwordValid.lower ? "#16A34A" : "#EF4444" }}>
              • Lowercase letter
            </Text>
            <Text style={{ color: passwordValid.number ? "#16A34A" : "#EF4444" }}>
              • Number
            </Text>
            <Text style={{ color: passwordValid.special ? "#16A34A" : "#EF4444" }}>
              • Special character
            </Text>
          </View>

          <TextInput
            placeholder="Confirm Password"
            style={styles.input}
            secureTextEntry
            value={formData.confirmPassword}
            onChangeText={handleConfirmPasswordChange}
          />

          <Text
            style={{
              marginBottom: 10,
              color: passwordValid.match ? "#16A34A" : "#EF4444"
            }}
          >
            • Passwords match
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={handleSignupSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Sign Up</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("SignIn")}>
            <Text style={styles.link}>
              Already have an account? Sign In
            </Text>
          </TouchableOpacity>

        </Animated.View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignUp;

const styles = StyleSheet.create({

  container: {
    flexGrow: 1,
    backgroundColor: "#E6F7F7",
    justifyContent: "center",
    padding: 20
  },

  card: {
    backgroundColor: "white",
    padding: 25,
    borderRadius: 20,
    shadowColor: "#0F766E",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6
  },

  title: {
    fontSize: 32,
    fontWeight: "900",
    color: "#0F766E",
    marginBottom: 20,
    textAlign: "center"
  },

  input: {
    backgroundColor: "#F1F5F9",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#CBD5F5",
    marginBottom: 16,
    fontSize: 16
  },

  passwordWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#CBD5F5",
    paddingHorizontal: 12,
    marginBottom: 10
  },

  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16
  },

  eye: {
    width: 22,
    height: 22,
    backgroundColor: "transparent"
  },

  rules: {
    backgroundColor: "#F8FAFC",
    padding: 8,
    borderRadius: 8,
    marginBottom: 10
  },

  button: {
    backgroundColor: "#14B8A6",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10
  },

  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold"
  },

  link: {
    textAlign: "center",
    marginTop: 15,
    color: "#0F766E",
    fontWeight: "600"
  }

});