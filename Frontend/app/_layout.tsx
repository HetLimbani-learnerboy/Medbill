import { Stack } from "expo-router";
import { AuthProvider, useAuth } from "./AuthContext";
import { CartProvider } from "./CartContext";

function RootLayoutNav() {
  const { isLoggedIn } = useAuth();

  return (
    <Stack key={isLoggedIn ? "app" : "auth"} screenOptions={{ headerShown: false }}>
      {!isLoggedIn ? (
        <>
          <Stack.Screen name="Landing" />
          <Stack.Screen name="SignIn" />
          <Stack.Screen name="SignUp" />
          <Stack.Screen name="ShopProfileSettings"/>
          <Stack.Screen name="StaffManagementScreen"/>
          <Stack.Screen name="HelpSupport" />
          <Stack.Screen name="PreviousReceipts" />
          <Stack.Screen name="Preview" />
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
      <CartProvider>
      <RootLayoutNav />
      </CartProvider>
    </AuthProvider>
  );
}