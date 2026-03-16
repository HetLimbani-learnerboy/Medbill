import { View, Button, StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../AuthContext";

export default function Settings() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace("/LandingPage");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Settings</Text>
      <Button title="Logout" color="red" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 20, marginBottom: 20 }
});