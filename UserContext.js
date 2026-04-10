import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const savedSession = await AsyncStorage.getItem('user_session');
        if (savedSession) {
          setUser(JSON.parse(savedSession));
        }
      } catch (e) {
        console.error("Session load failed", e);
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();
  }, []);

  const login = async (role, id, name, extraData = {}) => {
    // Initial login with basic profile
    const userObj = { 
      role, 
      id, 
      name,
      ...extraData,
      profile: {
        fullName: name,
        dob: '',
        guardianName: '',
        guardianPhone: ''
      }
    };
    await AsyncStorage.setItem('user_session', JSON.stringify(userObj));
    setUser(userObj);
  };

  const updateProfile = async (newProfile) => {
    if (!user) return;
    const updatedUser = { ...user, profile: newProfile };
    await AsyncStorage.setItem('user_session', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('user_session');
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, login, logout, updateProfile, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
