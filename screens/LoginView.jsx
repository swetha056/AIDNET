import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, Modal, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { styles } from '../theme/Styles';

const EXPERT_CATEGORIES = [
  { name: "Emergency Medicine Physicians (ER Doctors)", req: "NMC/State Medical Council Registration Number" },
  { name: "Paramedics and Lab Technicians", req: "Indian Paramedical Council ID" },
  { name: "Emergency Medical Technicians (EMTs)", req: "NSDC Skill Certificate Number" },
  { name: "Registered Nurses (RN/GNM)", req: "INC/State Nursing Council ID" },
  { name: "Tactical EMS (TECC) / SWAT Paramedics", req: "Agency Authorization Letter" },
  { name: "Wilderness Responders", req: "Relevant Certification/License" },
  { name: "Government Disaster/Rescue Officers", req: "NDRF/SDRF Service Identity Card" },
  { name: "Community Paramedics", req: "Indian Paramedical Council ID" },
  { name: "Mobile Trauma/Surgical Teams", req: "NMC/State Medical Council Registration Number" },
  { name: "Emergency Care Practitioners (ECP)", req: "Relevant Certification/License" },
  { name: "Search and Rescue (SAR) Techs", req: "NDRF/SDRF Service Identity Card" },
  { name: "HAZMAT/Chemical Specialists", req: "PESO/Agency Authorization Letter" },
  { name: "First Aid Responders", req: "IRCS Certificate QR/ID" },
  { name: "Emergency Management Specialists", req: "IAEM/CEM Credential" }
];

const INSTITUTION_CATEGORIES = [
  { name: "Hospitals, Clinics, and Labs", req: "Ayushman Bharat Health Facility ID (HFR)" },
  { name: "Quality Standards / Patient Safety", req: "NABH Accreditation Number" },
  { name: "Clinical Establishments", req: "Clinical Establishment Act Registration" },
  { name: "Medical Colleges / Teaching", req: "NMC College ID/Code" },
  { name: "Medical Laboratories", req: "NABL Registration Number" },
  { name: "Fire Station / Fire Department", req: "State Fire NOC / Dept ID" },
  { name: "Police Station / Law Enforcement", req: "Precinct Registration ID" },
  { name: "Safety Compliance", req: "Fire & Pollution NOC IDs" },
  { name: "Govt Cashless Schemes", req: "PMJAY Empanelment ID" }
];

export const LoginView = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [mockAccounts, setMockAccounts] = useState([]);
  
  // Login State
  const [loginRole, setLoginRole] = useState('Seeker');
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginVerificationId, setLoginVerificationId] = useState('');

  // Signup State
  const [signUpRole, setSignUpRole] = useState('Seeker');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [location, setLocation] = useState(null);

  const [selectedSubRole, setSelectedSubRole] = useState(null);
  const [showRolePicker, setShowRolePicker] = useState(false);
  const [verificationId, setVerificationId] = useState('');

  const handleGetLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location is required to verify your service area.');
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
      Alert.alert('Success', 'Location secured successfully.');
    } catch (e) {
      Alert.alert('Error', 'Could not get location.');
    }
  };

  const handleLoginSubmit = () => {
    const lowerUser = loginUsername.toLowerCase().trim();

    let systemAccounts = [];
    if (loginRole === 'Institution') {
      systemAccounts.push({ role: 'Institution', username: 'inst', password: '1234', licenseId: loginVerificationId });
    } else if (loginRole === 'Expert') {
      systemAccounts.push({ role: 'Expert', username: 'expert', password: '1234', licenseId: 'NMC-8374', name: 'Verified Doctor', extraData: { specialty: 'Emergency Medicine Physicians (ER Doctors)', licenseId: 'NMC-8374' }});
      systemAccounts.push({ role: 'Expert', username: 'swetha', password: '1234', licenseId: 'VK-4982', name: 'Dr. Swetha', extraData: { specialty: 'Tactical EMS (TECC) / SWAT Paramedics', licenseId: 'VK-4982' }});
    } else {
      systemAccounts.push({ role: 'Seeker', username: 'swetha', password: '1234', name: 'Swetha User' });
      systemAccounts.push({ role: 'Seeker', username: 'seeker', password: '1234', name: 'General User' });
    }

    const allValidAccounts = [...systemAccounts, ...mockAccounts.map(m => ({ 
      role: m.role, 
      username: m.username, 
      password: m.password, 
      licenseId: m.extraData?.licenseId,
      name: m.name,
      extraData: m.extraData
    }))].filter(a => a.role === loginRole);

    const userMatch = allValidAccounts.filter(a => a.username === lowerUser);
    
    if (userMatch.length === 0) {
      return Alert.alert("Login Failed", `Username '${loginUsername}' not found for the role of '${loginRole}'.`);
    }

    const passMatch = userMatch.filter(a => a.password === loginPassword);
    
    if (passMatch.length === 0) {
      return Alert.alert("Login Failed", "Incorrect password.");
    }

    if (loginRole !== 'Seeker') {
      const idMatch = passMatch.filter(a => {
        if (a.username === 'inst' && loginRole === 'Institution') return loginVerificationId.length === 10;
        return a.licenseId === loginVerificationId;
      });

      if (idMatch.length === 0) {
        return Alert.alert("Login Failed", "Verification ID does not match records.");
      }
      
      const acc = idMatch[0];
      if (acc.username === 'inst' && loginRole === 'Institution') {
        return onLogin('Institution', loginVerificationId, `Facility ${loginVerificationId}`);
      }
      return onLogin(acc.role, acc.username, acc.name, acc.extraData);
    }
    
    return onLogin(passMatch[0].role, passMatch[0].username, passMatch[0].name, passMatch[0].extraData);
  };

  const handleSignUpSubmit = () => {
    if (!fullName || !username || !password) return Alert.alert("Required", "Please fill in all basic details.");
    
    if (signUpRole !== 'Seeker') {
      if (!selectedSubRole) return Alert.alert("Required", "Please select your classification.");
      if (!verificationId) return Alert.alert("Required", `Please enter your ${selectedSubRole.req}.`);
      if (!location) return Alert.alert("Required", "Providers must verify their primary location.");
    }

    const newUser = {
      role: signUpRole,
      username: username.toLowerCase().trim(),
      password,
      name: fullName,
      extraData: signUpRole !== 'Seeker' ? { specialty: selectedSubRole?.name, licenseId: verificationId } : {}
    };
    
    setMockAccounts([...mockAccounts, newUser]);

    Alert.alert("Verification Processing", "Account created successfully. Your credentials have been registered. You may now log in.");
    setIsSignUp(false);
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={{ backgroundColor: '#0B1F3A' }} keyboardShouldPersistTaps="handled">
      <View style={[styles.loginPage, { justifyContent: 'flex-start', paddingTop: 80, paddingBottom: 50 }]}>
        <View style={styles.loginCard}>
          <Image 
            source={require('../assets/images/icon.png')} 
            style={{ width: 110, height: 110, alignSelf: 'center', marginBottom: 10, resizeMode: 'contain' }} 
          />
          
          <View style={styles.loginHeaderSection}>
            <Text style={styles.loginMainTitle}>{isSignUp ? "Create Account" : "Login"}</Text>
            <Text style={styles.loginSubtitle}>{isSignUp ? "Register securely as a Seeker or Verified Provider." : "Please sign in to continue."}</Text>
          </View>

          {!isSignUp ? (
            // -------- LOGIN FORM --------
            <View style={styles.inputContainer}>
              <View style={styles.roleTabs}>
                {['Seeker', 'Expert', 'Institution'].map(role => (
                  <TouchableOpacity 
                    key={role}
                    onPress={() => setLoginRole(role)}
                    style={[styles.roleTab, loginRole === role && styles.roleTabActive]}
                  >
                    <Text style={[styles.roleTabText, loginRole === role && styles.roleTabTextActive]}>{role}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.inputLabelContainer}>
                  <Ionicons name="mail-outline" size={18} color="#AAA" />
                  <Text style={styles.inputLabel}>USERNAME</Text>
                </View>
                <TextInput 
                  style={styles.input} 
                  placeholder="Enter Username" 
                  placeholderTextColor="#BBB" 
                  value={loginUsername} 
                  onChangeText={setLoginUsername} 
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={[styles.inputGroup, { marginTop: 20 }]}>
                <View style={styles.inputLabelContainer}>
                  <Ionicons name="lock-closed-outline" size={18} color="#AAA" />
                  <Text style={styles.inputLabel}>PASSWORD</Text>
                </View>
                <TextInput 
                  style={styles.input} 
                  placeholder="••••••" 
                  secureTextEntry 
                  placeholderTextColor="#BBB" 
                  value={loginPassword} 
                  onChangeText={setLoginPassword} 
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {loginRole !== 'Seeker' && (
                <View style={[styles.inputGroup, { marginTop: 20 }]}>
                  <View style={styles.inputLabelContainer}>
                    <Ionicons name="card-outline" size={18} color="#AAA" />
                    <Text style={styles.inputLabel}>VERIFICATION ID</Text>
                  </View>
                  <TextInput 
                    style={styles.input} 
                    placeholder={loginRole === 'Institution' ? "10-digit Facility Code" : "License / Regis. Number"} 
                    placeholderTextColor="#BBB" 
                    value={loginVerificationId}
                    onChangeText={setLoginVerificationId}
                    autoCapitalize="characters"
                    autoCorrect={false}
                  />
                </View>
              )}

              <TouchableOpacity onPress={handleLoginSubmit} style={styles.loginButtonContainer}>
                <LinearGradient colors={['#0B1F3A', '#C0202A']} start={{x:0, y:0}} end={{x:1, y:0}} style={styles.loginGradientBtn}>
                  <Text style={styles.loginBtnText}>LOGIN  <Ionicons name="arrow-forward" size={18} color="#FFF" /></Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setIsSignUp(true)} style={{ marginTop: 20, alignItems: 'center' }}>
                <Text style={{ color: '#C9A84C', fontWeight: 'bold' }}>Don't have an account? Sign Up</Text>
              </TouchableOpacity>
            </View>
          ) : (
            // -------- SIGN UP FORM --------
            <View style={styles.inputContainer}>
              <View style={styles.roleTabs}>
                {['Seeker', 'Expert', 'Institution'].map(role => (
                  <TouchableOpacity 
                    key={role}
                    onPress={() => { setSignUpRole(role); setSelectedSubRole(null); setVerificationId(''); }}
                    style={[styles.roleTab, signUpRole === role && styles.roleTabActive]}
                  >
                    <Text style={[styles.roleTabText, signUpRole === role && styles.roleTabTextActive]}>{role}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.inputLabelContainer}>
                  <Ionicons name="person-outline" size={18} color="#AAA" />
                  <Text style={styles.inputLabel}>FULL NAME / FACILITY NAME</Text>
                </View>
                <TextInput style={styles.input} placeholder="John Doe or City Hospital" placeholderTextColor="#BBB" value={fullName} onChangeText={setFullName} />
              </View>

              {signUpRole !== 'Seeker' && (
                <>
                  <View style={[styles.inputGroup, { marginTop: 20 }]}>
                    <View style={styles.inputLabelContainer}>
                      <Ionicons name="list-outline" size={18} color="#AAA" />
                      <Text style={styles.inputLabel}>CLASSIFICATION</Text>
                    </View>
                    <TouchableOpacity onPress={() => setShowRolePicker(true)} style={{ paddingVertical: 10 }}>
                      <Text style={[styles.input, !selectedSubRole && { color: '#BBB' }]}>
                        {selectedSubRole ? selectedSubRole.name : "Select Classification"}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {selectedSubRole && (
                    <View style={[styles.inputGroup, { marginTop: 20 }]}>
                      <View style={styles.inputLabelContainer}>
                        <Ionicons name="shield-checkmark-outline" size={18} color="#AAA" />
                        <Text style={styles.inputLabel}>VERIFICATION ID</Text>
                      </View>
                      <TextInput 
                        style={styles.input} 
                        placeholder={`Enter ${selectedSubRole.req}`} 
                        placeholderTextColor="#BBB" 
                        value={verificationId} 
                        onChangeText={setVerificationId} 
                      />
                    </View>
                  )}

                  <View style={[styles.inputGroup, { marginTop: 20 }]}>
                    <View style={styles.inputLabelContainer}>
                      <Ionicons name="location-outline" size={18} color="#AAA" />
                      <Text style={styles.inputLabel}>SERVICE LOCATION</Text>
                    </View>
                    <TouchableOpacity onPress={handleGetLocation} style={{ paddingVertical: 10 }}>
                      <Text style={[styles.input, !location && { color: '#C9A84C' }]}>
                        {location ? "Location Verified ✅" : "Tap to Secure Location"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

              <View style={[styles.inputGroup, { marginTop: 20 }]}>
                <View style={styles.inputLabelContainer}>
                  <Ionicons name="mail-outline" size={18} color="#AAA" />
                  <Text style={styles.inputLabel}>USERNAME</Text>
                </View>
                <TextInput style={styles.input} placeholder="Create Username" placeholderTextColor="#BBB" value={username} onChangeText={setUsername} autoCapitalize="none" autoCorrect={false} />
              </View>

              <View style={[styles.inputGroup, { marginTop: 20 }]}>
                <View style={styles.inputLabelContainer}>
                  <Ionicons name="lock-closed-outline" size={18} color="#AAA" />
                  <Text style={styles.inputLabel}>PASSWORD</Text>
                </View>
                <TextInput style={styles.input} placeholder="Create Password" secureTextEntry placeholderTextColor="#BBB" value={password} onChangeText={setPassword} autoCapitalize="none" autoCorrect={false} />
              </View>

              <TouchableOpacity onPress={handleSignUpSubmit} style={styles.loginButtonContainer}>
                <LinearGradient colors={['#C9A84C', '#0B1F3A']} start={{x:0, y:0}} end={{x:1, y:0}} style={styles.loginGradientBtn}>
                  <Text style={styles.loginBtnText}>VERIFY & SIGN UP</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setIsSignUp(false)} style={{ marginTop: 20, alignItems: 'center' }}>
                <Text style={{ color: '#C9A84C', fontWeight: 'bold' }}>Already have an account? Login</Text>
              </TouchableOpacity>
            </View>
          )}
          
          <View style={styles.footerBrandingCenter}>
            <Text style={styles.footerBrandingText}>MINISTRY OF HEALTH & FAMILY WELFARE</Text>
            <Text style={styles.footerSubText}>GOVERNMENT OF INDIA • AIDNET 2.0</Text>
          </View>
        </View>

        {/* Role Picker Modal */}
        {showRolePicker && (
          <Modal transparent animationType="fade">
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
              <View style={{ width: '100%', backgroundColor: '#FFF', borderRadius: 12, padding: 20, maxHeight: '80%', elevation: 10 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' }}>
                  {signUpRole === 'Expert' ? 'EXPERT CATEGORIES' : 'INSTITUTION CATEGORIES'}
                </Text>
                <ScrollView>
                  {(signUpRole === 'Expert' ? EXPERT_CATEGORIES : INSTITUTION_CATEGORIES).map(cat => (
                    <TouchableOpacity key={cat.name} style={{ paddingVertical: 15, borderBottomWidth: 1, borderColor: '#EEE' }} onPress={() => { setSelectedSubRole(cat); setShowRolePicker(false); }}>
                      <Text style={{ fontSize: 13, color: '#333' }}>{cat.name}</Text>
                      <Text style={{ fontSize: 10, color: '#C9A84C', marginTop: 4 }}>Req: {cat.req}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <TouchableOpacity onPress={() => setShowRolePicker(false)} style={{ marginTop: 15, padding: 15, backgroundColor: '#EEE', borderRadius: 8, alignItems: 'center' }}>
                  <Text style={{ fontWeight: 'bold', color: '#555' }}>CANCEL</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}
      </View>
    </ScrollView>
  );
};
