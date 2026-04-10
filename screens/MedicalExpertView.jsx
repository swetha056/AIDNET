import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, ScrollView, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ref, onValue, update } from 'firebase/database';
import * as Location from 'expo-location';
import { db } from '../Database';
import { sortPackets } from '../TriageEngine';
import { useUser } from '../UserContext';
import { styles } from '../theme/Styles';
import { NavCompass, MenuOption } from '../components/AidnetUI';

export const MedicalExpertView = () => {
  const { user, logout } = useUser();
  const [packets, setPackets] = useState([]);
  const [selectedPacket, setSelectedPacket] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [menuView, setMenuView] = useState('main');

  const [closedPackets, setClosedPackets] = useState([]);

  const isRelevantAlert = (specialty, type) => {
    if (!specialty) return true; // generic provider
    const txt = specialty.toLowerCase();
    
    if (type === 'Intruder') {
      // Intruder/Active Shooter typically requires tactical, disaster, or law enforcement
      return txt.includes('tactical') || txt.includes('disaster') || txt.includes('sar') || txt.includes('first aid') || txt.includes('management');
    }
    if (type === 'Fire') {
      // Fire requires medics, EMTs, HAZMAT, trauma teams, burn units. Avoid standard nurses/wilderness unless cross-trained.
      return txt.includes('er doctor') || txt.includes('paramedic') || txt.includes('emt') || txt.includes('hazmat') || txt.includes('disaster') || txt.includes('trauma') || txt.includes('first aid') || txt.includes('management') || txt.includes('sar');
    }
    // Accidents and General emergencies sent to all medical experts
    return true;
  };

  useEffect(() => {
    if (db.isMock) return;
    return onValue(ref(db, 'packets'), snap => {
      const data = snap.val() || {};
      const allPackets = Object.values(data);
      const active = allPackets.find(p => p.expertId === user.id && ['Guided', 'Arrived'].includes(p.status));
      
      if (active) {
        setPackets([active]); // Force focus on one case
      } else {
        setPackets(sortPackets(allPackets.filter(p => p.status === 'Pending' && isRelevantAlert(user.specialty, p.emergencyType))));
      }
      setClosedPackets(allPackets.filter(p => p.expertId === user.id && p.status === 'Closed' && typeof p.rating === 'number'));
    });
  }, []);

  const averageRating = closedPackets.length > 0 ? (closedPackets.reduce((acc, p) => acc + p.rating, 0) / closedPackets.length).toFixed(1) : 'N/A';

  const getDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 999;
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // in metres
  };

  const [location, setLocation] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
      Location.watchPositionAsync({ accuracy: Location.Accuracy.Balanced, distanceInterval: 10 }, (newLoc) => setLocation(newLoc.coords));
    })();
  }, []);

  const activeCase = packets.find(p => p.expertId === user.id && (p.status === 'Guided' || p.status === 'Arrived'));
  const distanceToVictim = activeCase ? getDistance(location?.latitude, location?.longitude, activeCase.latitude, activeCase.longitude) : null;
  
  const markArrived = () => {
    if (db.isMock || !activeCase) return;
    if (distanceToVictim > 50) {
      return Alert.alert("Distance Error", "You must be within 50 meters of the victim to mark your arrival. Please proceed to the location.");
    }
    update(ref(db, `packets/${activeCase.id}`), { status: 'Arrived' });
    Alert.alert("Location Verified", "You have marked your arrival. The victim has been notified. They must now confirm and close the case.");
  };

  const claim = (id) => {
    if (db.isMock) return;
    update(ref(db, `packets/${id}`), { status: 'Guided', expertId: user.id });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { setMenuView('main'); setShowMenu(true); }} style={styles.iconCircle}>
          <Ionicons name="menu-outline" size={24} color="#C9A84C" />
        </TouchableOpacity>
        <Image source={require('../assets/images/icon.png')} style={{ width: 36, height: 36, resizeMode: 'contain' }} />
        <View style={styles.statusDot} />
      </View>

      {showMenu && (
        <View style={styles.settingsOverlay}>
          <View style={styles.sideDrawer}>
            <View style={styles.settingsHeader}>
              <Text style={styles.headerText}>{menuView.toUpperCase()}</Text>
              <TouchableOpacity onPress={() => { if(menuView === 'main') setShowMenu(false); else setMenuView('main'); }}>
                <Ionicons name={menuView === 'main' ? "close" : "arrow-back"} size={26} color="#0B1F3A" />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.settingsContent}>
              <MenuOption label="Home" icon="home-outline" onSelect={() => setShowMenu(false)} />
              <MenuOption label="Duty Profile" icon="person-outline" onSelect={() => { setMenuView('profile'); setShowMenu(false); }} />
              <MenuOption label="Tactical Guidelines" icon="medical-outline" onSelect={() => { setMenuView('guidelines'); setShowMenu(false); }} />
              <MenuOption label="Performance Analytics" icon="stats-chart-outline" onSelect={() => { setMenuView('analytics'); setShowMenu(false); }} />
              <TouchableOpacity onPress={logout} style={styles.logoutBtnSettings}>
                 <Text style={[styles.actionBtnText, { color: '#C0202A' }]}><Ionicons name="power" size={16} /> SIGN OUT</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
          <TouchableOpacity style={styles.sidebarDismissArea} onPress={() => setShowMenu(false)} />
        </View>
      )}

      {menuView && menuView !== 'main' && (
        <View style={styles.fullScreenOverlay}>
          <View style={styles.fullScreenHeader}>
             <TouchableOpacity onPress={() => setMenuView('main')}>
                <Ionicons name="close" size={28} color="#0B1F3A" />
             </TouchableOpacity>
             <Text style={styles.headerText}>{menuView.toUpperCase()}</Text>
             <View style={{ width: 28 }} />
          </View>
          
          <ScrollView contentContainerStyle={styles.fullScreenContent}>
             {menuView === 'profile' && (
               <View>
                 <Text style={styles.sectionHeader}>DUTY DETAILS</Text>
                 <View style={styles.card}>
                   <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>EXPERT NAME:</Text>
                      <Text style={styles.detailValue}>{user.name || 'Responder'}</Text>
                   </View>
                   <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>ROLE:</Text>
                      <Text style={styles.detailValue}>{user.role || 'Medical Expert'}</Text>
                   </View>
                   <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>STATUS:</Text>
                      <Text style={[styles.detailValue, { color: '#4CAF50' }]}>Active on Duty</Text>
                   </View>
                   <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
                      <Text style={styles.detailLabel}>LICENSE ID:</Text>
                      <Text style={styles.detailValue}>{user.licenseId || 'PENDING'}</Text>
                   </View>
                 </View>
                 <TouchableOpacity onPress={() => setMenuView('main')} style={styles.saveBtn}><Text style={styles.actionBtnText}>BACK TO PORTAL</Text></TouchableOpacity>
               </View>
             )}
             {menuView === 'guidelines' && (
               <View>
                 <Text style={styles.sectionHeader}>TACTICAL OPERATIONS</Text>
                 <View style={styles.guidelineBox}>
                   <Text style={styles.guideTitle}>Protocol Alpha - Critical</Text>
                   <Text style={styles.guideText}>Immediate dispatch required for severe accidents. Review sender's medical profile instantly upon claiming.</Text>
                 </View>
                 <View style={styles.guidelineBox}>
                   <Text style={styles.guideTitle}>Protocol Beta - Guided</Text>
                   <Text style={styles.guideText}>Provide over-the-phone CPR or choking instructions. Instruct bystanders to secure the area.</Text>
                 </View>
                 <View style={styles.guidelineBox}>
                   <Text style={styles.guideTitle}>Scene Safety First</Text>
                   <Text style={styles.guideText}>Instruct the victim to move to a safe zone if the current location is hazardous (fire, intruder).</Text>
                 </View>
                 <TouchableOpacity onPress={() => setMenuView('main')} style={styles.saveBtn}><Text style={styles.actionBtnText}>ACKNOWLEDGE</Text></TouchableOpacity>
               </View>
             )}
             {menuView === 'analytics' && (
               <View>
                 <Text style={styles.sectionHeader}>PERFORMANCE METRICS</Text>
                 <View style={[styles.card, { alignItems: 'center', paddingVertical: 40 }]}>
                    <Text style={{ fontSize: 16, color: '#666', fontWeight: 'bold' }}>OVERALL RATING</Text>
                    <Text style={{ fontSize: 64, fontWeight: 'bold', color: '#FFB347', marginVertical: 10 }}>{averageRating}</Text>
                    <View style={{ flexDirection: 'row' }}>
                      {[1,2,3,4,5].map(star => (
                         <Ionicons key={star} name={averageRating !== 'N/A' && averageRating >= star ? "star" : "star-outline"} size={32} color="#FFB347" />
                      ))}
                    </View>
                    <Text style={{ fontSize: 14, color: '#888', marginTop: 20 }}>Based on {closedPackets.length} completed operations</Text>
                 </View>
                 <TouchableOpacity onPress={() => setMenuView('main')} style={[styles.saveBtn, {marginTop: 20}]}><Text style={styles.actionBtnText}>BACK TO PORTAL</Text></TouchableOpacity>
               </View>
             )}
           </ScrollView>
        </View>
      )}

      {menuView === 'main' && (
        activeCase ? (
          <View style={styles.content}>
             <View style={[styles.card, { borderColor: '#FF3B30', borderWidth: 2 }]}>
                <Text style={[styles.headerText, { color: '#FF3B30', textAlign: 'center', marginBottom: 10 }]}>ACTIVE OPERATION</Text>
                <Text style={styles.packetTitle}>Victim: {activeCase.senderName}</Text>
                <Text style={styles.packetType}>{activeCase.severity} • {activeCase.emergencyType}</Text>
                <Text style={styles.detailValue}>Message: {activeCase.message || 'No details provided.'}</Text>
                
                <View style={[styles.expertDetailBox, { marginTop: 15 }]}>
                  <Text style={styles.detailLabel}>BLOOD TYPE: {activeCase.medicalProfile?.bloodGroup || 'UNKNOWN'}</Text>
                  <Text style={styles.detailLabel}>ALLERGIES: {Array.isArray(activeCase.medicalProfile?.allergies) ? activeCase.medicalProfile.allergies.join(', ') : 'NONE'}</Text>
                  <Text style={styles.detailLabel}>CONDITIONS: {Array.isArray(activeCase.medicalProfile?.medicalConditions) ? activeCase.medicalProfile.medicalConditions.join(', ') : 'NONE'}</Text>
                   <Text style={[styles.detailLabel, {marginTop: 4}]}>1. GUARDIAN: {activeCase.medicalProfile?.guardianName} ({activeCase.medicalProfile?.guardianPhone})</Text>
                   <Text style={[styles.detailLabel, {marginTop: 2}]}>2. RELATIVE: {activeCase.medicalProfile?.relativeName} ({activeCase.medicalProfile?.relativePhone})</Text>
                   <Text style={[styles.detailLabel, {marginTop: 2}]}>3. NEXT OF KIN: {activeCase.medicalProfile?.kinName} ({activeCase.medicalProfile?.kinPhone})</Text>
                </View>

                {activeCase.status === 'Guided' && (
                  <TouchableOpacity 
                    style={[styles.actionBtn, { backgroundColor: distanceToVictim <= 50 ? '#2EAA6B' : '#8FA5BE', marginTop: 20 }]} 
                    onPress={markArrived}
                  >
                    <Text style={styles.actionBtnText}>{distanceToVictim <= 50 ? 'MARK ARRIVED' : `APPROACHING (${distanceToVictim.toFixed(0)}m)`}</Text>
                  </TouchableOpacity>
                )}
                
                {activeCase.status === 'Arrived' && (
                  <View style={{ marginTop: 20, padding: 15, backgroundColor: '#E8F8F0', borderRadius: 8 }}>
                    <Text style={{ textAlign: 'center', color: '#2EAA6B', fontWeight: 'bold' }}>WAITING FOR VICTIM TO CLOSE CASE</Text>
                    <Text style={{ textAlign: 'center', color: '#4A6080', fontSize: 13, marginTop: 5 }}>The victim must physically acknowledge your arrival to formally end the record loop.</Text>
                  </View>
                )}
             </View>
          </View>
        ) : (
          <FlatList
            data={packets}
            contentContainerStyle={{ padding: 25 }}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.cardHeaderFlex}>
                  <NavCompass bearing={item.bearing} />
                  <View style={{ flex: 1, marginLeft: 15 }}>
                    <Text style={styles.packetTitle}>{item.senderName}</Text>
                    <Text style={styles.packetType}>{item.severity} • {item.emergencyType}</Text>
                  </View>
                </View>

                <TouchableOpacity 
                  style={styles.expandRow} 
                  onPress={() => setSelectedPacket(selectedPacket?.id === item.id ? null : item)}
                >
                  <Text style={styles.expandText}>{selectedPacket?.id === item.id ? 'HIDE DETAILS' : 'VIEW MEDICAL INFO'}</Text>
                  <Ionicons name={selectedPacket?.id === item.id ? "chevron-up" : "chevron-down"} size={14} color="#C9A84C" />
                </TouchableOpacity>

                {selectedPacket?.id === item.id && (
                  <View style={styles.expertDetailBox}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>BLOOD TYPE:</Text>
                      <Text style={styles.detailValue}>{item.medicalProfile?.bloodGroup || 'UNKNOWN'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>ALLERGIES:</Text>
                      <Text style={[styles.detailValue, (item.medicalProfile?.allergies && item.medicalProfile.allergies.length > 0) && { color: '#FF3B30' }]}>
                        {Array.isArray(item.medicalProfile?.allergies) ? (item.medicalProfile.allergies.join(', ') || 'NONE') : (item.medicalProfile?.allergies || 'NONE')}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>CONDITIONS:</Text>
                      <Text style={styles.detailValue}>
                        {Array.isArray(item.medicalProfile?.medicalConditions) ? (item.medicalProfile.medicalConditions.join(', ') || 'NONE REPORTED') : (item.medicalProfile?.medicalConditions || 'NONE REPORTED')}
                      </Text>
                    </View>
                    <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
                      <Text style={styles.detailLabel}>GUARDIAN:</Text>
                      <Text style={styles.detailValue}>{item.medicalProfile?.guardianName} ({item.medicalProfile?.guardianPhone})</Text>
                    </View>
                  </View>
                )}

                <TouchableOpacity style={styles.actionBtn} onPress={() => claim(item.id)}>
                  <Text style={styles.actionBtnText}>CLAIM & GUIDE</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        )
      )}
    </View>
  );
};
