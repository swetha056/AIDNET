import React from 'react';
import { Stack } from 'expo-router';
import { UserProvider } from '../UserContext';

import * as Notifications from 'expo-notifications';

// Global Notification Configuration
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function RootLayout() {
  return (
    <UserProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
      </Stack>
    </UserProvider>
  );
}
