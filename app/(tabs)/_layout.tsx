import { Tabs, useRouter } from 'expo-router';
import { Home, Users, Tractor, FileText, Wallet, TrendingUp, Plus } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { TouchableOpacity } from 'react-native';

export default function TabLayout() {
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textLight,
        headerShown: false,
        headerStyle: { backgroundColor: Colors.primary },
        headerTintColor: Colors.white,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.border,
          paddingTop: 8,
          paddingBottom: 8,
          height: 70,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="farmers"
        options={{
          title: 'Farmers',
          tabBarIcon: ({ color, size }) => <Users size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="work"
        options={{
          title: 'Work',
          tabBarIcon: ({ color, size }) => <Tractor size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="expenses"
        options={{
          title: 'Expenses',
          headerShown: true, // Show header specifically for this tab
          tabBarIcon: ({ color, size }) => <Wallet size={size} color={color} />,
          headerRight: () => (
            <TouchableOpacity onPress={() => router.push('/(modals)/add-expense')} style={{ paddingRight: 15 }}>
              <Plus size={24} color={Colors.white} />
            </TouchableOpacity>
          ),
        }}
      />
      <Tabs.Screen
        name="invoices"
        options={{
          title: 'Invoices',
          tabBarIcon: ({ color, size }) => <FileText size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reports',
          tabBarIcon: ({ color, size }) => <TrendingUp size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
