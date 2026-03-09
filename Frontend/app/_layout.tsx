import { Tabs } from "expo-router";
import { Ionicons, AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';

export default function RootLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: 'blue' }}>

      <Tabs.Screen
        name="Landing"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={28} color={color} />,
        }}
      />

      <Tabs.Screen
        name='index'
        options={{
          title: 'Scan',
          tabBarIcon: ({ color }) => <AntDesign name="scan" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name='receipts'
        options={{
          title: 'Receipts',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="file-document-multiple" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name='insights'
        options={{
          title: 'Insights',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="trending-up" color={color} />,
        }}
      />
      <Tabs.Screen
        name='settings'
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="settings" color={color} />,
        }}
      />
      <Tabs.Screen
        name="SignUp"
        options={{
          title: 'Sign Up',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="person-add" color={color} />,
        }}
      />
    </Tabs>

  );
}
