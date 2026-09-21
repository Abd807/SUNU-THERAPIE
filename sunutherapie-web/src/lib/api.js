const BASE = import.meta.env.VITE_API_URL || 'https://sunutherapi.com/api';

export const TOKEN_KEY = 'sunu_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

class ApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError('Connexion au serveur impossible. Vérifiez votre réseau.', 0, null);
  }

  // 401 : la session a expiré, on sort proprement
  if (res.status === 401 && auth) {
    clearToken();
    window.dispatchEvent(new Event('sunu:unauthorized'));
    throw new ApiError('Votre session a expiré, reconnectez-vous.', 401, null);
  }

  let data = null;
  try { data = await res.json(); } catch { /* réponse vide */ }

  if (!res.ok) {
    const msg =
      data?.message ||
      (data?.errors ? Object.values(data.errors).flat().join(' ') : null) ||
      `Erreur ${res.status}`;
    throw new ApiError(msg, res.status, data);
  }
  return data ?? {};
}

// Les contrôleurs renvoient tantôt `data`, tantôt une clé nommée : on normalise.
const list = (d, ...keys) => {
  for (const k of ['data', ...keys]) {
    if (Array.isArray(d?.[k])) return d[k];
  }
  return [];
};

// ─── Authentification ───
export const login = (email, password) =>
  request('/login', { method: 'POST', body: { email, password }, auth: false });
export const register = (payload) =>
  request('/register', { method: 'POST', body: payload, auth: false });
export const verifyEmail = (email, code) =>
  request('/verify-email', { method: 'POST', body: { email, code }, auth: false });
export const resendVerification = (email) =>
  request('/resend-verification', { method: 'POST', body: { email }, auth: false });
export const logout = () => request('/logout', { method: 'POST' });

// ─── Profil ───
export const getProfile = () => request('/profile');
export const updateProfile = (payload) => request('/profile', { method: 'PUT', body: payload });

// ─── Psychothérapeutes ───
export const getPsys = async () => list(await request('/psychotherapeutes'), 'psychologues');
export const getPsysDisponibles = async () => {
  const d = await request('/psychotherapeutes/disponibles');
  return { data: list(d, 'psychologues'), hasReferent: d?.has_referent || false };
};
export const getCreneaux = async (psyId, date) =>
  list(await request(`/psychotherapeutes/${psyId}/creneaux/${date}`));
export const getJoursDisponibles = async () => list(await request('/disponibilites/jours'));

// ─── Consultations ───
export const getConsultations = async () =>
  list(await request('/consultations/historique/etudiant'), 'consultations');
export const creerConsultation = (payload) =>
  request('/consultations', { method: 'POST', body: payload });
export const noterConsultation = (id, note, commentaire) =>
  request(`/consultations/${id}/noter`, { method: 'POST', body: { note, commentaire } });

// ─── Ressources & bibliothèque ───
export const getRessources = async () => list(await request('/ressources'), 'ressources');
export const marquerRessourceLue = (id) => request(`/ressources/${id}/lue`, { method: 'POST' });
export const getBibliotheque = async () => list(await request('/bibliotheque'));

// ─── Forum ───
export const getForum = async () => list(await request('/forum'), 'posts');
export const publierForum = (payload) => request('/forum', { method: 'POST', body: payload });
export const likerForum = (id) => request(`/forum/${id}/liker`, { method: 'POST' });
export const commenterForum = (id, contenu) =>
  request(`/forum/${id}/commenter`, { method: 'POST', body: { contenu } });

// ─── Divers ───
export const getNotes = async () => list(await request('/notes/mes-notes'));
export const assistantChat = (message) =>
  request('/assistant/chat', { method: 'POST', body: { message } });

export { ApiError };

// Une ressource porte soit une URL externe, soit un fichier dans le stockage public.
const ORIGIN = BASE.replace(/\/api\/?$/, '');
export function fichierUrl(item) {
  if (!item) return null;
  if (item.url) return item.url;
  if (item.fichier_path) return `${ORIGIN}/storage/${String(item.fichier_path).replace(/^\/+/, '')}`;
  return null;
}
export const couvertureUrl = (item) =>
  item?.couverture_path ? `${ORIGIN}/storage/${String(item.couverture_path).replace(/^\/+/, '')}` : null;
