import { Tabs } from 'expo-router';
import React from 'react';
import { HapticTab } from '@/components/haptic-tab';
import { UserProvider } from '../../UserContext';

export default function TabLayout() {
  return (
    <UserProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#FF0000',
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: { display: 'none' } // Hide navigation since we have internal Login
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'AIDNET',
          }}
        />
      </Tabs>
    </UserProvider>
  );
}
