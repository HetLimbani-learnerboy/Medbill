import { Stack } from "expo-router";
import { AuthProvider, useAuth } from "./AuthContext";

function RootLayoutNav() {
  const { isLoggedIn } = useAuth();

  return (
    <Stack key={isLoggedIn ? "app" : "auth"} screenOptions={{ headerShown: false }}>
      {!isLoggedIn ? (
        <>
          <Stack.Screen name="Landing" />
          <Stack.Screen name="SignIn" />
          <Stack.Screen name="SignUp" />
        </>
      ) : (
        <Stack.Screen name="tabs" options={{ headerShown: false }} />
      )}
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}