import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated from 'react-native-reanimated';
import { styles } from '../theme/Styles';

const Magnetometer = Platform.OS !== 'web' ? require('expo-sensors').Magnetometer : null;

export const NavCompass = ({ bearing }) => {
  const [heading, setHeading] = useState(0);
  
  useEffect(() => {
    if (!Magnetometer) return;
    let sub = Magnetometer.addListener((data) => {
      let angle = Math.atan2(data.y, data.x) * (180 / Math.PI);
      setHeading(angle >= 0 ? angle : 360 + angle);
    });
    return () => (sub && sub.remove());
  }, []);

  const arrowAngle = (bearing - heading + 360) % 360;

  return (
    <View style={styles.compassCircle}>
      <Animated.View style={{ transform: [{ rotate: `${arrowAngle}deg` }] }}>
        <Text style={{ fontSize: 24, color: '#C9A84C' }}>▲</Text>
      </Animated.View>
    </View>
  );
};

export const PersonalInput = ({ label, value, onChange, keyboard = 'default', placeholder }) => (
  <View style={styles.inputGroup}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput 
      style={styles.input} 
      value={value} 
      onChangeText={onChange} 
      keyboardType={keyboard} 
      placeholder={placeholder}
      placeholderTextColor="#DDD"
      autoCapitalize="words"
      autoCorrect={false}
    />
  </View>
);

export const MenuOption = ({ label, icon, onSelect }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onSelect}>
    <Ionicons name={icon} size={20} color="#0B1F3A" />
    <Text style={styles.menuItemText}>{label}</Text>
  </TouchableOpacity>
);

export const CheckpointLink = ({ label, completed, onPress }) => (
  <TouchableOpacity style={styles.checkpointItem} onPress={onPress}>
    <Ionicons name={completed ? "checkbox" : "square-outline"} size={22} color={completed ? "#2EAA6B" : "#AAA"} />
    <Text style={[styles.checkpointText, completed && { color: '#AAA', textDecorationLine: 'line-through' }]}>{label}</Text>
  </TouchableOpacity>
);
