import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiLogin, apiLogout, apiRegister } from '../services/api';

const AuthContext = createContext({});
export const useAuth = () => useContext(AuthContext);

const fixBooleans = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  const fixed = { ...obj };
  ['email_verified', 'disponible', 'actif', 'urgence'].forEach(key => {
    if (fixed[key] !== undefined) {
      fixed[key] = fixed[key] === true || fixed[key] === 1 || fixed[key] === '1';
    }
  });
  return fixed;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('auth_token');
      const storedUser = await AsyncStorage.getItem('auth_user');
      if (storedToken && storedUser) {
        setToken(storedToken);
        const parsed = fixBooleans(JSON.parse(storedUser));
        setUser(parsed);
        setUserProfile(parsed);
      }
    } catch (error) {
      console.error('Erreur chargement auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const data = await apiLogin(email, password);
      if (data.success) {
        const fixedUser = fixBooleans(data.user);
        await AsyncStorage.setItem('auth_token', data.token);
        await AsyncStorage.setItem('auth_user', JSON.stringify(fixedUser));
        setToken(data.token);
        setUser(fixedUser);
        setUserProfile(fixedUser);
        return { success: true, user: fixedUser };
      }
      return { success: false, message: data.message || 'Erreur de connexion' };
    } catch (error) {
      return { success: false, message: 'Erreur réseau — vérifiez votre connexion' };
    }
  };

  const register = async (formData) => {
    try {
      const data = await apiRegister(formData);
      if (data.success) {
        const fixedUser = fixBooleans(data.user);
        await AsyncStorage.setItem('auth_token', data.token);
        await AsyncStorage.setItem('auth_user', JSON.stringify(fixedUser));
        await AsyncStorage.setItem('show_welcome', 'true');
        setToken(data.token);
        setUser(fixedUser);
        setUserProfile(fixedUser);
        return { success: true, user: fixedUser };
      }
      return {
        success: false,
        message: data.message || 'Erreur lors de la création du compte',
        errors: data.errors,
      };
    } catch (error) {
      return { success: false, message: 'Erreur réseau — vérifiez votre connexion' };
    }
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch (e) {}
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('auth_user');
    await AsyncStorage.removeItem('show_welcome');
    setToken(null);
    setUser(null);
    setUserProfile(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      userProfile,
      token,
      loading,
      login,
      register,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
