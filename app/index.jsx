import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useUser } from '../UserContext';
import { LoginView } from '../screens/LoginView';
import { SeekerView } from '../screens/SeekerView';
import { MedicalExpertView } from '../screens/MedicalExpertView';
import { InstitutionView } from '../screens/InstitutionView';

import { ActivityIndicator } from 'react-native';

export default function App() {
  const { user, login, isLoading } = useUser();

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }]}>
        <ActivityIndicator size="large" color="#0B1F3A" />
      </View>
    );
  }

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
