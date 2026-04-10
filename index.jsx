import React from 'react';
import { View, StyleSheet } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useUser } from './UserContext';

// AIDNET High-Fidelity Screens
import { LoginView } from './screens/LoginView';
import { SeekerView } from './screens/SeekerView';
import { MedicalExpertView } from './screens/MedicalExpertView';
import { InstitutionView } from './screens/InstitutionView';

// Global Notification Configuration
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function MainApp() {
  const { user, login } = useUser();

  // ---------------------------------------------------------
  // CORE ROUTING ENGINE
  // ---------------------------------------------------------
  return (
    <View style={styles.container}>
      {!user ? (
        <LoginView onLogin={login} />
      ) : (
        <>
          {user.role === 'Seeker' && <SeekerView />}
          {user.role === 'Expert' && <MedicalExpertView />}
          {user.role === 'Institution' && <InstitutionView />}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
