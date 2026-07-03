import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/constants';

const getHeaders = async () => {
  const token = await AsyncStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// ─── AUTH ───
export const apiLogin = async (email, password) => {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return response.json();
};

export const apiRegister = async (formData) => {
  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });
  return response.json();
};

export const apiLogout = async () => {
  const headers = await getHeaders();
  const response = await fetch(`${API_URL}/logout`, { method: 'POST', headers });
  return response.json();
};

export const apiGetProfile = async () => {
  const headers = await getHeaders();
  const response = await fetch(`${API_URL}/profile`, { headers });
  return response.json();
};

// ─── PSYCHOTHÉRAPEUTES ───
export const apiGetPsychotherapeutes = async () => {
  const headers = await getHeaders();
  const response = await fetch(`${API_URL}/psychotherapeutes`, { headers });
  const data = await response.json();
  return { success: data.success, data: data.data || data.psychologues || [] };
};

export const apiGetPsychotherapeutesDisponibles = async () => {
  const headers = await getHeaders();
  const response = await fetch(`${API_URL}/psychotherapeutes/disponibles`, { headers });
  const data = await response.json();
  return {
    success: data.success,
    data: data.data || data.psychologues || [],
    has_referent: data.has_referent || false,
  };
};

// ─── CONSULTATIONS ───
export const apiGetConsultationsEtudiant = async () => {
  const headers = await getHeaders();
  const response = await fetch(`${API_URL}/consultations/historique/etudiant`, { headers });
  const data = await response.json();
  return { success: data.success, data: data.data || data.consultations || [] };
};

export const apiGetConsultationsPsy = async () => {
  const headers = await getHeaders();
  const response = await fetch(`${API_URL}/consultations/historique/psychotherapeute`, { headers });
  const data = await response.json();
  return { success: data.success, data: data.data || data.consultations || [] };
};

export const apiCreerConsultation = async (data) => {
  const headers = await getHeaders();
  const response = await fetch(`${API_URL}/consultations`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  return response.json();
};

export const apiAccepterConsultation = async (id) => {
  const headers = await getHeaders();
  const response = await fetch(`${API_URL}/consultations/${id}/accepter`, { method: 'PUT', headers });
  return response.json();
};

export const apiRefuserConsultation = async (id, motif) => {
  const headers = await getHeaders();
  const response = await fetch(`${API_URL}/consultations/${id}/refuser`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ motif_refus: motif }),
  });
  return response.json();
};

export const apiTerminerConsultation = async (id) => {
  const headers = await getHeaders();
  const response = await fetch(`${API_URL}/consultations/${id}/terminer`, { method: 'PUT', headers });
  return response.json();
};

export const apiNoterConsultation = async (id, note, commentaire) => {
  const headers = await getHeaders();
  const response = await fetch(`${API_URL}/consultations/${id}/noter`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ note, commentaire }),
  });
  return response.json();
};

export const apiGetVideoToken = async (id) => {
  const headers = await getHeaders();
  const response = await fetch(`${API_URL}/consultations/${id}/video-token`, { headers });
  return response.json();
};

// ─── RESSOURCES ───
export const apiGetRessources = async () => {
  const headers = await getHeaders();
  const response = await fetch(`${API_URL}/ressources`, { headers });
  const data = await response.json();
  return { success: data.success, data: data.data || data.ressources || [] };
};

// ─── ASSISTANT IA ───
export const apiAssistantChat = async (message) => {
  const headers = await getHeaders();
  const response = await fetch(`${API_URL}/assistant/chat`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ message }),
  });
  return response.json();
};

// ─── SPONSORS ───
export const apiGetSponsors = async () => {
  const response = await fetch(`${API_URL}/sponsors`);
  return response.json();
};

// ─── NOTES ───
export const apiGetNotesEtudiant = async () => {
  const headers = await getHeaders();
  const response = await fetch(`${API_URL}/notes/mes-notes`, { headers });
  const data = await response.json();
  return { success: data.success, data: data.data || [] };
};
