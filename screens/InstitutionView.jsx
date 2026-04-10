import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, ScrollView, TextInput, Switch, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ref, onValue, update } from 'firebase/database';
import { db } from '../Database';
import { useUser } from '../UserContext';
import { styles } from '../theme/Styles';
import { NavCompass, MenuOption } from '../components/AidnetUI';

export const InstitutionView = () => {
  const { user, logout } = useUser();
  const [activeRescues, setActiveRescues] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [menuView, setMenuView] = useState('main'); 
  
  const [facility, setFacility] = useState({
     facilityName: user?.name || 'Central Command Hospital',
     contactPerson: 'Dr. Jane Smith (Chief Admin)',
     contactPhone: '1-800-EMERGENCY',
     rescueRadius: '50',
     // Verification IDs
     hfrId: user?.extraData?.licenseId || '',
     nabhNumber: '',
     clinicalReg: '',
     nmcCollegeCode: '',
     nablNumber: '',
     pmjayId: '',
     fireNocId: '',
     pollutionNocId: '',
     // Capabilities
     hasAmbulance: true,
     hasIcu: true,
     hasHelipad: false,
     hasBloodBank: true,
     isTraumaCenter: true,
     isBurnUnit: false,
     ventilatorCount: '10',
     icuBedsAvailable: '5',
     bloodTypesInStock: ['A+', 'A-', 'B+', 'AB+']
  });

  const isRelevantDispatch = (facilityObj, type) => {
    const txt = (facilityObj.facilityName + ' ' + (user?.extraData?.specialty || '')).toLowerCase();
    
    if (type === 'Fire') {
      return txt.includes('fire'); // Only Fire Stations
    }
    if (type === 'Intruder') {
      return txt.includes('police') || txt.includes('law') || txt.includes('patrol'); // Local authorities
    }
    // Medical Operations (Accident/Other) shouldn't clutter non-medical hubs
    if (txt.includes('fire') || txt.includes('police') || txt.includes('law')) {
      return false;
    }
    return true; 
  };

  useEffect(() => {
    if (db.isMock) return;
    return onValue(ref(db, 'packets'), snap => {
      const data = snap.val() || {};
      setActiveRescues(Object.values(data).filter(p => {
        if (!['Claimed', 'Guided', 'Dispatched'].includes(p.status)) return false;
        return isRelevantDispatch(facility, p.emergencyType);
      }));
    });
  }, [facility]);

  const dispatch = (id) => {
    if (db.isMock) return;
    update(ref(db, `packets/${id}`), { status: 'Dispatched' });
  };

  const handleSaveFacility = () => {
     Alert.alert("Profile Updated", "Facility parameters have been securely saved to the Mesh.");
     setMenuView('main');
  };

  const ToggleSwitch = ({ label, value, onValueChange }) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 10 }}>
      <Text style={{ fontSize: 15, color: '#0B1F3A', fontWeight: '500', flex: 1 }}>{label}</Text>
      <Switch
        trackColor={{ false: "#767577", true: "#4CAF50" }}
        thumbColor={value ? "#FFF" : "#f4f3f4"}
        ios_backgroundColor="#3e3e3e"
        onValueChange={onValueChange}
        value={value}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setShowMenu(true)} style={styles.iconCircle}>
          <Ionicons name="menu-outline" size={24} color="#C9A84C" />
        </TouchableOpacity>
        <Image source={require('../assets/images/icon.png')} style={{ width: 36, height: 36, resizeMode: 'contain' }} />
        <View style={styles.statusDot} />
      </View>

      {showMenu && (
        <View style={styles.settingsOverlay}>
          <View style={styles.sideDrawer}>
            <View style={styles.settingsHeader}>
              <Text style={styles.headerText}>FACILITY MENU</Text>
              <TouchableOpacity onPress={() => setShowMenu(false)}>
                <Ionicons name="close" size={26} color="#0B1F3A" />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.settingsContent}>
              <MenuOption label="Dispatch Dashboard" icon="home-outline" onSelect={() => {setMenuView('main'); setShowMenu(false);}} />
              <MenuOption label="Facility Profile" icon="business-outline" onSelect={() => {setMenuView('profile'); setShowMenu(false);}} />
              <MenuOption label="Active Roster" icon="people-outline" onSelect={() => {setMenuView('roster'); setShowMenu(false);}} />
              <TouchableOpacity onPress={logout} style={styles.logoutBtnSettings}>
                 <Text style={[styles.actionBtnText, { color: '#C0202A' }]}><Ionicons name="power" size={16} /> SIGN OUT</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
          <TouchableOpacity style={styles.sidebarDismissArea} onPress={() => setShowMenu(false)} />
        </View>
      )}

      {menuView === 'profile' && (
        <View style={styles.fullScreenOverlay}>
          <View style={styles.fullScreenHeader}>
             <TouchableOpacity onPress={() => setMenuView('main')}>
                <Ionicons name="close" size={28} color="#0B1F3A" />
             </TouchableOpacity>
             <Text style={styles.headerText}>FACILITY CONFIG</Text>
             <View style={{ width: 28 }} />
          </View>
          
          <ScrollView contentContainerStyle={styles.fullScreenContent}>
             <Text style={styles.sectionHeader}>INSTITUTION IDENTITY</Text>
             
             <View style={styles.inputGroup}>
               <Text style={styles.inputLabel}>FACILITY NAME / BRANCH</Text>
               <TextInput style={styles.input} value={facility.facilityName} onChangeText={t => setFacility({...facility, facilityName: t})} />
             </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>AYUSHMAN BHARAT HFR ID</Text>
                <TextInput style={styles.input} value={facility.hfrId} onChangeText={t => setFacility({...facility, hfrId: t})} placeholder="GHI-XXXXX" />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>NABH ACCREDITATION NO.</Text>
                <TextInput style={styles.input} value={facility.nabhNumber} onChangeText={t => setFacility({...facility, nabhNumber: t})} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>CLINICAL ESTABLISHMENT REG.</Text>
                <TextInput style={styles.input} value={facility.clinicalReg} onChangeText={t => setFacility({...facility, clinicalReg: t})} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>PMJAY EMPANELMENT ID</Text>
                <TextInput style={styles.input} value={facility.pmjayId} onChangeText={t => setFacility({...facility, pmjayId: t})} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>NABL LAB REGISTRATION</Text>
                <TextInput style={styles.input} value={facility.nablNumber} onChangeText={t => setFacility({...facility, nablNumber: t})} />
              </View>

              <Text style={[styles.sectionHeader, { marginTop: 30 }]}>OPERATIONAL CAPABILITIES</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>TOTAL VENTILATORS</Text>
                <TextInput style={styles.input} value={facility.ventilatorCount} onChangeText={t => setFacility({...facility, ventilatorCount: t})} keyboardType="numeric" />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>AVAILABLE ICU BEDS</Text>
                <TextInput style={styles.input} value={facility.icuBedsAvailable} onChangeText={t => setFacility({...facility, icuBedsAvailable: t})} keyboardType="numeric" />
              </View>
             <View style={styles.card}>
                <ToggleSwitch label="BLS / ALS Ambulances Active" value={facility.hasAmbulance} onValueChange={v => setFacility({...facility, hasAmbulance: v})} />
                <View style={{ height: 1, backgroundColor: '#EEE' }}/>
                <ToggleSwitch label="Level 1 Trauma Center Active" value={facility.isTraumaCenter} onValueChange={v => setFacility({...facility, isTraumaCenter: v})} />
                <View style={{ height: 1, backgroundColor: '#EEE' }}/>
                <ToggleSwitch label="ICU Beds Available" value={facility.hasIcu} onValueChange={v => setFacility({...facility, hasIcu: v})} />
                <View style={{ height: 1, backgroundColor: '#EEE' }}/>
                <ToggleSwitch label="Blood Bank / Transfusion Ready" value={facility.hasBloodBank} onValueChange={v => setFacility({...facility, hasBloodBank: v})} />
                <View style={{ height: 1, backgroundColor: '#EEE' }}/>
                <ToggleSwitch label="Severe Burn Unit" value={facility.isBurnUnit} onValueChange={v => setFacility({...facility, isBurnUnit: v})} />
                <View style={{ height: 1, backgroundColor: '#EEE' }}/>
                <ToggleSwitch label="Helipad / Aerial Extract Cleared" value={facility.hasHelipad} onValueChange={v => setFacility({...facility, hasHelipad: v})} />
             </View>

             <TouchableOpacity onPress={handleSaveFacility} style={[styles.saveBtn, { marginTop: 20 }]}>
                <Text style={styles.actionBtnText}>SAVE FACILITY MATRIX</Text>
             </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {menuView === 'roster' && (
        <View style={styles.fullScreenOverlay}>
          <View style={styles.fullScreenHeader}>
             <TouchableOpacity onPress={() => setMenuView('main')}>
                <Ionicons name="close" size={28} color="#0B1F3A" />
             </TouchableOpacity>
             <Text style={styles.headerText}>ACTIVE PERSONNEL</Text>
             <View style={{ width: 28 }} />
          </View>
          
          <ScrollView contentContainerStyle={styles.fullScreenContent}>
             <Text style={styles.sectionHeader}>ON-DUTY EXPERTS</Text>
             
             <View style={styles.card}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="person-circle" size={40} color="#C9A84C" />
                  <View style={{ marginLeft: 15 }}>
                     <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Dr. Swetha</Text>
                     <Text style={{ color: '#4A6080', fontSize: 12 }}>Tactical EMS • ID: VK-4982</Text>
                  </View>
                </View>
                <View style={[styles.statusBadgeExpert, { marginTop: 10, alignSelf: 'flex-start', backgroundColor: '#4CAF5022' }]}>
                  <Text style={[styles.statusBadgeText, { color: '#4CAF50' }]}>AVAILABLE</Text>
                </View>
             </View>

             <View style={styles.card}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="person-circle" size={40} color="#C9A84C" />
                  <View style={{ marginLeft: 15 }}>
                     <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Ambulance Unit 4</Text>
                     <Text style={{ color: '#4A6080', fontSize: 12 }}>ALS Crew • EMT Assigned</Text>
                  </View>
                </View>
                <View style={[styles.statusBadgeExpert, { marginTop: 10, alignSelf: 'flex-start', backgroundColor: '#FFCC3322' }]}>
                  <Text style={[styles.statusBadgeText, { color: '#B38F00' }]}>EN ROUTE (MESH)</Text>
                </View>
             </View>

             <View style={styles.card}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="person-circle" size={40} color="#C9A84C" />
                  <View style={{ marginLeft: 15 }}>
                     <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Dr. A. Sharma</Text>
                     <Text style={{ color: '#4A6080', fontSize: 12 }}>ER Physician • ID: NMC-8374</Text>
                  </View>
                </View>
                <View style={[styles.statusBadgeExpert, { marginTop: 10, alignSelf: 'flex-start', backgroundColor: '#FF3B3022' }]}>
                  <Text style={[styles.statusBadgeText, { color: '#FF3B30' }]}>ACTIVE OPERATION</Text>
                </View>
             </View>
          </ScrollView>
        </View>
      )}

      {menuView === 'main' && (
        <FlatList
          data={activeRescues}
          contentContainerStyle={{ padding: 25 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeaderFlex}>
                <NavCompass bearing={item.bearing} />
                <View style={{ flex: 1, marginLeft: 15 }}>
                  <Text style={styles.packetTitle}>{item.senderName}</Text>
                  <Text style={styles.packetType}>{item.distance?.toFixed(1) || '0'}km • {item.emergencyType}</Text>
                </View>
                {item.status === 'Dispatched' && (
                  <View style={[styles.statusBadgeExpert, { backgroundColor: '#4CAF5022' }]}><Text style={[styles.statusBadgeText, { color: '#4CAF50' }]}>DISPATCHED</Text></View>
                )}
              </View>
              <TouchableOpacity 
                style={[styles.actionBtn, item.status === 'Dispatched' ? { backgroundColor: '#EEE' } : { backgroundColor: '#FFCC33' }]} 
                onPress={() => item.status !== 'Dispatched' && dispatch(item.id)}
                disabled={item.status === 'Dispatched'}
              >
                <Text style={[styles.actionBtnText, { color: item.status === 'Dispatched' ? '#AAA' : '#000' }]}>
                  {item.status === 'Dispatched' ? 'AMBULANCE EN ROUTE' : 'DISPATCH AMBULANCE'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
};
