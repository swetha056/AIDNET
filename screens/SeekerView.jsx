import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, Dimensions, Platform, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS, interpolate } from 'react-native-reanimated';
import { ref, onValue, update, push, set } from 'firebase/database';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { Audio } from 'expo-av';
import { db, savePacketToMesh } from '../Database';
import { useUser } from '../UserContext';
import { styles } from '../theme/Styles';
import { PersonalInput, MenuOption, CheckpointLink } from '../components/AidnetUI';
import MapDisplay from '../MapDisplay';

const { width } = Dimensions.get('window');
const SIREN_URL = 'https://www.soundjay.com/buttons/beep-01a.mp3';

const EmergencyBtn = ({ type, icon, onSelect }) => (
  <TouchableOpacity style={styles.emergencyItem} onPress={() => onSelect(type)}>
    <Text style={{ fontSize: 28 }}>{icon}</Text>
    <Text style={styles.emergencyItemText}>{type.toUpperCase()}</Text>
  </TouchableOpacity>
);

export const SeekerView = () => {
  const { user, logout, updateProfile } = useUser();
  const [mySos, setMySos] = useState(null);
  const [location, setLocation] = useState(null);
  const [isSilent, setIsSilent] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [menuView, setMenuView] = useState('main'); 
  const [activeGuideline, setActiveGuideline] = useState(null);
  const [guidelineSteps, setGuidelineSteps] = useState([]);

  const [profile, setProfile] = useState(() => {
    const p = user?.profile || {};
    return {
      fullName: p.fullName || user.name || '',
      dob: p.dob || '',
      bloodGroup: p.bloodGroup || '',
      medicalConditions: Array.isArray(p.medicalConditions) ? p.medicalConditions : (p.medicalConditions ? [p.medicalConditions] : []),
      allergies: Array.isArray(p.allergies) ? p.allergies : (p.allergies ? [p.allergies] : []),
      guardianName: p.guardianName || '',
      guardianPhone: p.guardianPhone || ''
    };
  });
  const [newAllergy, setNewAllergy] = useState('');
  const [newCondition, setNewCondition] = useState('');
  const [showBloodPicker, setShowBloodPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [showOtherDetails, setShowOtherDetails] = useState(false);
  const [otherDetailsText, setOtherDetailsText] = useState('');
  const [showRating, setShowRating] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');

  const escalateToPolice = () => {
    if (mySos && !db.isMock) {
       update(ref(db, `packets/${mySos.id}`), { status: 'Escalated_Police' });
       triggerLocalNotification?.('Escalated to Police') || console.log('Escalated');
    }
    Alert.alert("Action Taken", "The case has been escalated to local authorities (simulated).");
  };

  const cancelSos = () => {
    if (mySos && !db.isMock) {
      update(ref(db, `packets/${mySos.id}`), { status: 'Cancelled' });
    }
    setMySos(null);
  };

  const endCaseWithRating = () => {
    if (selectedRating > 0 && selectedRating < 3 && !feedbackText.trim()) {
      return Alert.alert("Feedback Required", "Please provide a brief reason for the low rating so we can review this responder.");
    }
    
    if (mySos && !db.isMock) {
      update(ref(db, `packets/${mySos.id}`), { 
        status: 'Closed', 
        rating: selectedRating || 5,
        feedback: feedbackText.trim()
      });
    }
    setMySos(null);
    setShowRating(false);
    setSelectedRating(0);
    setFeedbackText('');
    Alert.alert("Case Closed", "Thank you for confirming. The operation is officially concluded.");
  };

  const handleSubmitOtherDetails = () => {
    if (mySos && !db.isMock && otherDetailsText.trim()) {
      update(ref(db, `packets/${mySos.id}`), {
        message: otherDetailsText.trim()
      });
      setMySos({ ...mySos, message: otherDetailsText.trim() });
    }
    setShowOtherDetails(false);
  };

  const progress = useSharedValue(0);
  const scale = useSharedValue(1);

  const handleSaveProfile = () => {
    updateProfile(profile);
    setMenuView('main');
    Alert.alert("Success", "Profile updated.");
  };

  const GUIDELINE_DATA = {
    bleeding: {
      title: "SEVERE BLEEDING",
      steps: ["Apply direct pressure with clean cloth", "Elevate the wound above heart level", "Apply a tourniquet if bleeding won't stop", "Stay calm and keep the patient warm"]
    },
    choking: {
      title: "CHOKING GUIDE",
      steps: ["Stand behind the person", "Perform 5 back blows", "Perform 5 abdominal thrusts", "Repeat until object is forced out"]
    },
    cpr: {
      title: "CPR (ADULT)",
      steps: ["Check for responsiveness", "Call for help (SOS active)", "Push hard and fast in center of chest", "100-120 compressions per minute"]
    }
  };

  const HELPER_GUIDELINES = {
    first_on_scene: {
      title: "FIRST ON SCENE PROTOCOL",
      steps: ["Secure the area (Safety first)", "Call local authorities immediately", "Do not move the victim unless in danger", "Look for medical ID bracelets"]
    },
    bystander_cpr: {
      title: "BYSTANDER ASSISTANCE",
      steps: ["Ask for a nearby AED", "Clear a path for the ambulance", "Help keep the victim calm", "Provide details to first responders"]
    }
  };

  const startGuideline = (key, isHelper = false) => {
    const data = isHelper ? HELPER_GUIDELINES[key] : GUIDELINE_DATA[key];
    setActiveGuideline({ ...data, key });
    setGuidelineSteps(new Array(data.steps.length).fill(false));
    setMenuView(null);
    setShowMenu(false);
  };

  const addAllergy = () => {
    if(!newAllergy.trim()) return;
    setProfile({ ...profile, allergies: [...profile.allergies, newAllergy.trim()] });
    setNewAllergy('');
  };

  const removeAllergy = (idx) => {
    const next = [...profile.allergies];
    next.splice(idx, 1);
    setProfile({ ...profile, allergies: next });
  };

  const addCondition = () => {
    if(!newCondition.trim()) return;
    setProfile({ ...profile, medicalConditions: [...profile.medicalConditions, newCondition.trim()] });
    setNewCondition('');
  };

  const removeCondition = (idx) => {
    const next = [...profile.medicalConditions];
    next.splice(idx, 1);
    setProfile({ ...profile, medicalConditions: next });
  };

  const toggleStep = (idx) => {
    const next = [...guidelineSteps];
    next[idx] = !next[idx];
    setGuidelineSteps(next);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const triggerLocalNotification = async (status) => {
    if (Platform.OS === 'web') return;
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "AIDNET STATUS UPDATE",
          body: status === 'Dispatched' ? "HELP IS DEPLOYED! 🚑💨" : `Your SOS state is now: ${status}`,
        },
        trigger: null,
      });
    } catch (e) {
      console.warn(e);
    }
  };

  const playSiren = async () => {
    if (isSilent) return; 
    try {
      const { sound } = await Audio.Sound.createAsync({ uri: SIREN_URL });
      await sound.playAsync();
    } catch (e) {}
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      try {
        let loc = await Location.getCurrentPositionAsync({});
        setLocation(loc.coords);
      } catch (e) {}
      
      Location.watchPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        distanceInterval: 10,
      }, (newLoc) => {
        setLocation(newLoc.coords);
        if (mySos) updateLocationInDb(newLoc.coords);
      });
    })();
  }, [mySos?.id]);

  useEffect(() => {
    if (!mySos || db.isMock) return;
    try {
      const sosRef = ref(db, 'packets/' + mySos.id);
      const unsub = onValue(sosRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          if (mySos.status !== data.status) triggerLocalNotification(data.status);
          setMySos(data);
          savePacketToMesh(data);
        }
      });
      return () => unsub();
    } catch (e) {}
  }, [mySos?.id]);

  const updateLocationInDb = (coords) => {
    if (!mySos?.id || db.isMock) return;
    update(ref(db, `packets/${mySos.id}`), {
      latitude: coords.latitude,
      longitude: coords.longitude
    });
  };

  const triggerSos = (type = 'General') => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const packet = {
      id: db.isMock ? 'mock_' + Date.now() : push(ref(db, 'packets')).key,
      senderName: profile?.fullName || user.id,
      severity: 'Critical',
      emergencyType: type,
      latitude: location?.latitude || 0,
      longitude: location?.longitude || 0,
      status: 'Pending',
      timestamp: Date.now(),
      silent: isSilent,
      medicalProfile: profile,
    };
    if (!db.isMock) set(ref(db, `packets/${packet.id}`), packet);
    playSiren();
    savePacketToMesh(packet);
    setMySos(packet);
    if (type === 'Other') {
      setShowOtherDetails(true);
    }
  };

  const handlePressIn = () => {
    setIsActivating(true);
    progress.value = withTiming(1, { duration: 3000 }, (finished) => {
      if (finished) runOnJS(triggerSos)('General');
    });
    scale.value = withTiming(0.9, { duration: 100 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  const handlePressOut = () => {
    if (progress.value < 1) {
      progress.value = withTiming(0, { duration: 500 });
      scale.value = withTiming(1, { duration: 200 });
      setIsActivating(false);
    }
  };

  const animatedCircleStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: interpolate(progress.value, [0, 1], [0.8, 1.2]) }],
    borderWidth: interpolate(progress.value, [0, 1], [0, 10]),
    borderColor: '#FFB347',
  }));

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: interpolate(progress.value, [0, 1], [0xFFFFFF, 0xFFB347]),
  }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { setMenuView('main'); setShowMenu(true); }} style={styles.iconCircle}>
          <Ionicons name="menu-outline" size={24} color="#C9A84C" />
        </TouchableOpacity>
        <Image source={require('../assets/images/icon.png')} style={{ width: 36, height: 36, resizeMode: 'contain' }} />
        <TouchableOpacity 
          style={[styles.stealthIcon, isSilent && { backgroundColor: '#0B1F3A' }]} 
          onPress={() => setIsSilent(!isSilent)}
        >
          <Ionicons name="sunny-outline" size={20} color={isSilent ? "#FFF" : "#AAA"} />
        </TouchableOpacity>
      </View>

      {showMenu && (
        <View style={styles.settingsOverlay}>
          <View style={styles.sideDrawer}>
            <View style={styles.settingsHeader}>
              <Text style={styles.headerText}>{menuView.toUpperCase()}</Text>
              <TouchableOpacity onPress={() => { if(menuView === 'main') setShowMenu(false); else setMenuView('main'); }}>
                <Ionicons name={menuView === 'main' ? "close" : "arrow-back"} size={26} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.settingsContent}>
              {menuView === 'main' && (
                <>
                  <MenuOption label="Home" icon="home-outline" onSelect={() => setShowMenu(false)} />
                  <MenuOption label="Profile Details" icon="person-outline" onSelect={() => { setMenuView('profile'); setShowMenu(false); }} />
                  <MenuOption label="Emergency Contact" icon="people-outline" onSelect={() => { setMenuView('profile'); setShowMenu(false); }} />
                  <MenuOption label="Medical Guidelines" icon="medical-outline" onSelect={() => { setMenuView('guidelines'); setShowMenu(false); }} />
                  <MenuOption label="App Settings" icon="settings-outline" onSelect={() => { setMenuView('profile'); setShowMenu(false); }} />
                  
                  <TouchableOpacity onPress={logout} style={styles.logoutBtnSettings}>
                     <Text style={[styles.actionBtnText, { color: '#FF0000' }]}><Ionicons name="power" size={16} /> SIGN OUT</Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
            
            <View style={styles.footerBrandingCenter}>
              <Text style={[styles.footerBrandingText, { color: '#AAA' }]}>AIDNET 2.0 PROTOCOL</Text>
              <Text style={[styles.footerSubText, { color: '#CCC' }]}>SECURE HUB • V1.0</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.sidebarDismissArea} onPress={() => setShowMenu(false)} />
        </View>
      )}

      {menuView && menuView !== 'main' && (
        <View style={styles.fullScreenOverlay}>
          <View style={styles.fullScreenHeader}>
             <TouchableOpacity onPress={() => setMenuView('main')}>
                <Ionicons name="close" size={28} color="#333" />
             </TouchableOpacity>
             <Text style={styles.headerText}>{menuView.toUpperCase()}</Text>
             <View style={{ width: 28 }} />
          </View>
          
          <ScrollView contentContainerStyle={styles.fullScreenContent}>
             {menuView === 'profile' && (
                <>
                  <PersonalInput label="FULL NAME" value={profile.fullName} onChange={t => setProfile({...profile, fullName: t})} />
                  
                  <View style={styles.settingsInputGroup}>
                    <Text style={styles.settingsLabel}>BLOOD GROUP</Text>
                    <TouchableOpacity onPress={() => setShowBloodPicker(true)} style={styles.pickerTrigger}>
                       <Text style={styles.pickerText}>{profile.bloodGroup || 'Select Blood Type'}</Text>
                       <Ionicons name="chevron-down" size={16} color="#AAA" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.allergySection}>
                    <Text style={styles.settingsLabel}>ALLERGIES</Text>
                    <View style={styles.allergyInputRow}>
                      <TextInput 
                        style={[styles.input, { flex: 1, borderBottomWidth: 0 }]} 
                        placeholder="Add Allergy..." 
                        value={newAllergy}
                        onChangeText={setNewAllergy}
                      />
                      <TouchableOpacity onPress={addAllergy} style={styles.addAllergyBtn}>
                        <Ionicons name="add" size={20} color="#FFF" />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.allergyTags}>
                      {Array.isArray(profile.allergies) && profile.allergies.map((item, i) => (
                        <View key={i} style={styles.allergyTag}>
                          <Text style={styles.allergyTagText}>{item}</Text>
                          <TouchableOpacity onPress={() => removeAllergy(i)}>
                            <Ionicons name="close-circle" size={14} color="#FF3B30" style={{marginLeft: 5}}/>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  </View>

                  <View style={styles.allergySection}>
                    <Text style={styles.settingsLabel}>MEDICAL CONDITIONS</Text>
                    <View style={styles.allergyInputRow}>
                      <TextInput 
                        style={[styles.input, { flex: 1, borderBottomWidth: 0 }]} 
                        placeholder="Add Condition..." 
                        value={newCondition}
                        onChangeText={setNewCondition}
                      />
                      <TouchableOpacity onPress={addCondition} style={styles.addAllergyBtn}>
                        <Ionicons name="add" size={20} color="#FFF" />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.allergyTags}>
                      {Array.isArray(profile.medicalConditions) && profile.medicalConditions.map((item, i) => (
                        <View key={i} style={[styles.allergyTag, { borderColor: '#E1F0FF' }]}>
                          <Text style={styles.allergyTagText}>{item}</Text>
                          <TouchableOpacity onPress={() => removeCondition(i)}>
                            <Ionicons name="close-circle" size={14} color="#C0202A" style={{marginLeft: 5}}/>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  </View>

                  <View style={styles.settingsInputGroup}>
                    <Text style={styles.settingsLabel}>DATE OF BIRTH</Text>
                    <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.pickerTrigger}>
                       <Text style={styles.pickerText}>{profile.dob || 'Set Birthday'}</Text>
                       <Ionicons name="calendar-outline" size={16} color="#AAA" />
                    </TouchableOpacity>
                  </View>

                  <PersonalInput label="GUARDIAN NAME" value={profile.guardianName} onChange={t => setProfile({...profile, guardianName: t})} />
                  <PersonalInput label="GUARDIAN PHONE" value={profile.guardianPhone} onChange={t => setProfile({...profile, guardianPhone: t})} keyboard="phone-pad" />
                  <TouchableOpacity onPress={handleSaveProfile} style={styles.saveBtn}><Text style={styles.actionBtnText}>SAVE INFO</Text></TouchableOpacity>
                </>
             )}

             {menuView === 'guidelines' && (
                <>
                  <Text style={styles.sectionHeader}>FOR PATIENTS</Text>
                  <MenuOption label="Severe Bleeding" icon="water-outline" onSelect={() => startGuideline('bleeding')} />
                  <MenuOption label="Choking Rescue" icon="body-outline" onSelect={() => startGuideline('choking')} />
                  <MenuOption label="Perform CPR" icon="heart-outline" onSelect={() => startGuideline('cpr')} />
                  
                  <Text style={[styles.sectionHeader, { marginTop: 30 }]}>FOR HELPERS / BYSTANDERS</Text>
                  <MenuOption label="First on Scene" icon="eye-outline" onSelect={() => startGuideline('first_on_scene', true)} />
                  <MenuOption label="Assistance CPR" icon="people-outline" onSelect={() => startGuideline('bystander_cpr', true)} />
                </>
             )}
          </ScrollView>
        </View>
      )}

      <View style={styles.content}>
        {!mySos && !activeGuideline && !menuView && (
          <View style={[styles.card, styles.quickProfileCard]}>
             <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View>
                  <Text style={styles.quickProfileTitle}>{(profile?.fullName || 'NEW USER').toUpperCase()}</Text>
                  <Text style={styles.quickProfileSub}>BLOOD TYPE: {profile?.bloodGroup || 'Not Set'}</Text>
                  {Array.isArray(profile?.allergies) && profile.allergies.length > 0 ? (
                    <Text style={styles.allergyWarning}>⚠️ ALLERGIES: {profile.allergies.join(', ')}</Text>
                  ) : null}
                </View>
                <TouchableOpacity onPress={() => setMenuView('profile')} style={styles.quickEditBtn}>
                   <Ionicons name="create-outline" size={18} color="#C9A84C" />
                </TouchableOpacity>
             </View>
             <View style={styles.quickProfileLine} />
             <Text style={styles.quickProfileFooter}>EMERGENCY CONTACT: {profile.guardianPhone || 'N/A'}</Text>
          </View>
        )}

        {!mySos ? (
          <View style={styles.panicContainer}>
            {/* Stealth Mode Banner */}
            {stealthMode && (
              <View style={{ backgroundColor: '#1A1A1A', borderRadius: 10, padding: 10, marginBottom: 10, flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="eye-off" size={16} color="#FFB347" />
                <Text style={{ color: '#FFB347', fontSize: 12, fontWeight: 'bold', marginLeft: 8 }}>STEALTH MODE ACTIVE — Screen is dimmed & silent</Text>
              </View>
            )}
            <View style={styles.sosButtonWrapper}>
              <Animated.View style={[styles.progressRing, animatedCircleStyle]} />
              <TouchableOpacity activeOpacity={1} onPressIn={handlePressIn} onPressOut={handlePressOut}>
                <Animated.View style={[styles.panicButton, animatedButtonStyle, stealthMode && { backgroundColor: '#1A1A1A', borderColor: '#444' }]}>
                  <Text style={[styles.panicText, isActivating && { color: '#FFF' }, stealthMode && { color: '#666' }]}>SOS</Text>
                </Animated.View>
              </TouchableOpacity>
            </View>
            
            <View style={styles.quickGrid}>
              <EmergencyBtn type="Accident" icon="🚑" onSelect={triggerSos} />
              <EmergencyBtn type="Intruder" icon="🚓" onSelect={triggerSos} />
              <EmergencyBtn type="Fire" icon="🔥" onSelect={triggerSos} />
              <EmergencyBtn type="Other" icon="⚠️" onSelect={triggerSos} />
            </View>

            {/* Stealth Toggle */}
            <TouchableOpacity 
              onPress={() => setIsSilent(!isSilent)}
              style={[{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 12, padding: 10, borderRadius: 10, borderWidth: 1, borderColor: isSilent ? '#C9A84C' : '#DDD' }]}
            >
              <Ionicons name={isSilent ? "eye-off" : "eye-outline"} size={16} color={isSilent ? '#C9A84C' : '#AAA'} />
              <Text style={{ marginLeft: 8, fontSize: 12, fontWeight: 'bold', color: isSilent ? '#C9A84C' : '#AAA' }}>
                {isSilent ? 'STEALTH ON — TAP TO DISABLE' : 'ENABLE STEALTH MODE'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.statusSection}>
            {/* Live Map - shows victim's live coords */}
            {location && (
              <MapDisplay
                latitude={location.latitude}
                longitude={location.longitude}
                latitudeDelta={0.01}
                longitudeDelta={0.01}
              />
            )}
            <View style={styles.card}>
              <Text style={styles.statusBadge}>{mySos?.status?.toUpperCase() || 'TRANSMITTING...'}</Text>
              {mySos?.status === 'Arrived' ? (
                <>
                  <Text style={styles.statusMain}>RESPONDER ARRIVED</Text>
                  <Text style={styles.statusSub}>Please confirm they are on the scene and physically present.</Text>
                  <TouchableOpacity onPress={() => setShowRating(true)} style={[styles.actionBtn, {marginTop: 15, backgroundColor: '#4CAF50'}]}>
                    <Text style={styles.actionBtnText}>END CASE & RATE</Text>
                  </TouchableOpacity>
                </>
              ) : mySos?.status === 'Escalated_Police' ? (
                <View style={{ alignItems: 'center' }}>
                  <Ionicons name="shield-checkmark" size={48} color="#005BBB" style={{ marginBottom: 10 }} />
                  <Text style={[styles.statusMain, { color: '#005BBB' }]}>POLICE DISPATCHED</Text>
                  <Text style={styles.statusSub}>Law enforcement has been alerted. Move to a secure location, lock doors, and stay quiet if dealing with an intruder.</Text>
                  <TouchableOpacity onPress={() => setShowRating(true)} style={[styles.actionBtn, {marginTop: 20, backgroundColor: '#005BBB'}]}>
                    <Text style={styles.actionBtnText}>REPORT RESOLVED</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <Text style={styles.statusMain}>HELP IS ON THE WAY</Text>
                  <Text style={styles.statusSub}>A secure transmission is active. Stay where you are.</Text>
                </>
              )}
            </View>
            
            {mySos?.status === 'Pending' || mySos?.status === 'Guided' ? (
              <TouchableOpacity style={styles.cancelBtn} onLongPress={cancelSos}>
                <Text style={styles.cancelText}>HOLD TO CANCEL</Text>
              </TouchableOpacity>
            ) : null}

            {mySos?.status !== 'Escalated_Police' && mySos?.status !== 'Arrived' && (
              <TouchableOpacity style={[styles.cancelBtn, {backgroundColor: '#FFF', borderColor: '#FF3B30', borderWidth: 1, marginTop: 10}]} onLongPress={escalateToPolice}>
                <Text style={{color: '#FF3B30', fontWeight: 'bold'}}>ESCALATE TO POLICE</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {activeGuideline && (
           <View style={[styles.card, { marginTop: 20, flex: 1 }]}>
              <View style={styles.settingsHeader}>
                 <Text style={styles.packetTitle}>{activeGuideline.title}</Text>
                 <TouchableOpacity onPress={() => setActiveGuideline(null)}>
                    <Ionicons name="close-circle" size={24} color="#AAA" />
                 </TouchableOpacity>
              </View>
              <ScrollView>
              {activeGuideline.steps.map((step, i) => (
                <CheckpointLink 
                   key={i} 
                   label={step} 
                   completed={guidelineSteps[i]} 
                   onPress={() => toggleStep(i)} 
                />
              ))}
              </ScrollView>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${(guidelineSteps.filter(s => s).length / activeGuideline.steps.length) * 100}%` }]} />
              </View>
           </View>
        )}

      </View>
      {showBloodPicker && (
        <View style={styles.choiceOverlay}>
          <View style={styles.choiceCard}>
            <Text style={styles.choiceHeader}>SELECT BLOOD TYPE</Text>
            <ScrollView style={{ maxHeight: 300 }}>
               {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
                 <TouchableOpacity key={type} style={styles.choiceItem} onPress={() => { setProfile({...profile, bloodGroup: type}); setShowBloodPicker(false); }}>
                    <Text style={styles.choiceText}>{type}</Text>
                 </TouchableOpacity>
               ))}
            </ScrollView>
            <TouchableOpacity onPress={() => setShowBloodPicker(false)} style={[styles.actionBtn, { marginTop: 15, backgroundColor: '#EEE' }]}>
               <Text style={[styles.actionBtnText, { color: '#666' }]}>CANCEL</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {showDatePicker && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate && event.type !== 'dismissed') {
              const d = selectedDate;
              const dd = String(d.getDate()).padStart(2, '0');
              const mm = String(d.getMonth() + 1).padStart(2, '0');
              const yy = String(d.getFullYear()).slice(-2);
              setProfile({...profile, dob: `${dd}/${mm}/${yy}`});
            }
          }}
        />
      )}

      {showOtherDetails && (
        <View style={styles.choiceOverlay}>
          <View style={styles.choiceCard}>
            <Text style={styles.choiceHeader}>ADDITIONAL DETAILS</Text>
            <TextInput 
              style={[styles.input, { borderBottomWidth: 1, borderColor: '#EEE', paddingVertical: 10, fontSize: 16, marginBottom: 15 }]} 
              placeholder="Describe the emergency..." 
              value={otherDetailsText}
              onChangeText={setOtherDetailsText}
              autoFocus
            />
            <TouchableOpacity onPress={handleSubmitOtherDetails} style={styles.actionBtn}>
               <Text style={styles.actionBtnText}>SUBMIT INFO</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowOtherDetails(false)} style={[styles.actionBtn, { marginTop: 10, backgroundColor: '#EEE' }]}>
               <Text style={[styles.actionBtnText, { color: '#666' }]}>SKIP</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {showRating && (
        <View style={styles.choiceOverlay}>
          <View style={styles.choiceCard}>
            <Text style={styles.choiceHeader}>RATE RESPONSE</Text>
            <Text style={{textAlign: 'center', marginBottom: 20, color: '#666'}}>How accurately and fast did your responder resolve the problem?</Text>
            <View style={{flexDirection: 'row', justifyContent: 'space-around', marginBottom: 25}}>
              {[1, 2, 3, 4, 5].map(star => (
                <TouchableOpacity key={star} onPress={() => setSelectedRating(star)}>
                  <Ionicons name={selectedRating >= star ? "star" : "star-outline"} size={36} color="#FFB347" />
                </TouchableOpacity>
              ))}
            </View>
            
            {selectedRating > 0 && selectedRating < 3 && (
               <TextInput 
                  style={[styles.input, { borderBottomWidth: 1, borderColor: '#FF3B30', paddingVertical: 10, fontSize: 14, marginBottom: 20 }]} 
                  placeholder="What went wrong? (Required)" 
                  placeholderTextColor="#FF3B3088"
                  value={feedbackText}
                  onChangeText={setFeedbackText}
               />
            )}

            <TouchableOpacity onPress={endCaseWithRating} style={styles.actionBtn}>
               <Text style={styles.actionBtnText}>SUBMIT RATING</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};
