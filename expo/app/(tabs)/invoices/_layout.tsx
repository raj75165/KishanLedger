import { Stack } from 'expo-router';
import { Colors } from '@/constants/colors';

export default function InvoicesLayout() {
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
          title: 'Invoices',
        }}
      />
    </Stack>
  );
}
