import { Stack } from 'expo-router';
import { Colors } from '@/constants/colors';

export default function HomeLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.primary },
        headerTintColor: Colors.white,
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Dashboard',
          headerShown: false,
        }}
      />
    </Stack>
  );
}
