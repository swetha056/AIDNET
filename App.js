import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet, StatusBar } from 'react-native';
import { SeekerView, MedicalExpertView, InstitutionView } from './index';

export default function App() {
  const [role, setRole] = useState(null); // 'seeker', 'expert', 'institution'

  const renderActiveView = () => {
    switch (role) {
      case 'seeker': return <SeekerView />;
      case 'expert': return <MedicalExpertView />;
      case 'institution': return <InstitutionView />;
      default: return null;
    }
  };

  if (role) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <View style={styles.navBar}>
          <TouchableOpacity style={styles.backBtnWrapper} onPress={() => setRole(null)}>
            <Text style={styles.backBtn}>← Roles</Text>
          </TouchableOpacity>
          <Text style={styles.navTitle}>AIDNET MESH</Text>
          <View style={{width: 60}} /> 
        </View>
        <View style={styles.content}>
          {renderActiveView()}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <View style={styles.centerHeader}>
        <Text style={styles.title}>AIDNET</Text>
        <Text style={styles.subtitle}>Emergency Response Mesh Network</Text>
      </View>
      
      <View style={styles.roleContainer}>
        <TouchableOpacity style={styles.roleBtn} onPress={() => setRole('seeker')}>
          <Text style={styles.roleText}>SEEKER</Text>
          <Text style={styles.roleSub}>Broadcast emergency SOS</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.roleBtn} onPress={() => setRole('expert')}>
          <Text style={styles.roleText}>MEDICAL EXPERT</Text>
          <Text style={styles.roleSub}>Provide immediate guidance</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.roleBtn} onPress={() => setRole('institution')}>
          <Text style={styles.roleText}>MEDICAL INSTITUTION</Text>
          <Text style={styles.roleSub}>Dispatch emergency vehicles</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  content: { flex: 1 },
  centerHeader: { alignItems: 'center', marginTop: 80, marginBottom: 60 },
  title: { fontSize: 42, fontWeight: 'bold', color: '#FF0000', letterSpacing: 2 },
  subtitle: { fontSize: 16, color: '#AAAAAA', marginTop: 8, textAlign: 'center' },
  roleContainer: { paddingHorizontal: 20 },
  roleBtn: { 
    backgroundColor: '#1A1A1A', 
    padding: 24, 
    borderRadius: 12, 
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333333' 
  },
  roleText: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' },
  roleSub: { color: '#888888', fontSize: 15, marginTop: 6 },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: '#111111',
    borderBottomWidth: 1,
    borderBottomColor: '#222222'
  },
  backBtnWrapper: { width: 60 },
  backBtn: { color: '#00AFFF', fontSize: 16, fontWeight: 'bold' },
  navTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' }
});
