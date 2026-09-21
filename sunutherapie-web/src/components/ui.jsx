const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round', strokeLinejoin: 'round' };

const PATHS = {
  home: <><path d="M3 10.2 12 3l9 7.2" /><path d="M5 9.5V21h14V9.5" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2.5" /><path d="M8 3v4M16 3v4M3 11h18" /></>,
  users: <><circle cx="9" cy="8" r="3.4" /><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" /><path d="M17 11.2a3 3 0 1 0-1.6-5.5M18 19.8c.3-3 1.2-4 3.5-4.6" /></>,
  book: <><path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H19v15H5.5A1.5 1.5 0 0 0 4 19.5z" /><path d="M4 19.5A1.5 1.5 0 0 1 5.5 18H19v3H5.5A1.5 1.5 0 0 1 4 19.5z" /></>,
  file: <><path d="M14 3v5h5" /><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M9 13h6M9 17h4" /></>,
  chat: <><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-5.1A8 8 0 1 1 21 12z" /></>,
  user: <><circle cx="12" cy="8" r="3.8" /><path d="M4.5 20.5c0-4 3.4-6.5 7.5-6.5s7.5 2.5 7.5 6.5" /></>,
  logout: <><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" /><path d="M10 8l-4 4 4 4M6 12h10" /></>,
  menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
  back: <><path d="M15 6l-6 6 6 6" /></>,
  video: <><rect x="2.5" y="6" width="13" height="12" rx="2.5" /><path d="M15.5 10.5 21.5 7v10l-6-3.5z" /></>,
  heart: <><path d="M12 20s-7.5-4.6-7.5-9.5A4.2 4.2 0 0 1 12 7.8a4.2 4.2 0 0 1 7.5 2.7C19.5 15.4 12 20 12 20z" /></>,
  external: <><path d="M14 4h6v6" /><path d="M20 4l-8.5 8.5" /><path d="M19 14v5a1.5 1.5 0 0 1-1.5 1.5h-12A1.5 1.5 0 0 1 4 19V7a1.5 1.5 0 0 1 1.5-1.5H10" /></>,
};

export function Icon({ name, size = 19, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true" {...S}>
      {PATHS[name] || null}
    </svg>
  );
}

export const Spinner = ({ label }) => (
  <div className="center">
    <div className="spinner" />
    {label ? <p style={{ color: 'var(--muted)', fontSize: 14 }}>{label}</p> : null}
  </div>
);

export const Skeletons = ({ n = 3 }) => (
  <div>{Array.from({ length: n }, (_, i) => <div className="skel" key={i} />)}</div>
);

export const Empty = ({ emoji = '🌿', title, children }) => (
  <div className="empty">
    <div className="em">{emoji}</div>
    <h3>{title}</h3>
    {children ? <p>{children}</p> : null}
  </div>
);

export function Modal({ title, sub, onClose, children }) {
  return (
    <div className="modal-bg" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <h3>{title}</h3>
        {sub ? <p className="sub">{sub}</p> : null}
        {children}
      </div>
    </div>
  );
}

export const initials = (nom = '') =>
  nom.trim().split(/\s+/).slice(0, 2).map((m) => m[0] || '').join('').toUpperCase() || '?';

const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

export function formatDate(value, { avecHeure = true } = {}) {
  if (!value) return '';
  const d = new Date(String(value).replace(' ', 'T'));
  if (Number.isNaN(d.getTime())) return String(value);
  const base = `${JOURS[d.getDay()]} ${d.getDate()} ${MOIS[d.getMonth()]}`;
  if (!avecHeure) return base;
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${base} à ${hh}h${mm}`;
}

export const heure = (v) => (v ? String(v).slice(0, 5).replace(':', 'h') : '');

export function statutBadge(statut) {
  const map = {
    acceptee: ['badge-ok', 'Acceptée'],
    en_attente: ['badge-wait', 'En attente'],
    refusee: ['badge-no', 'Refusée'],
    terminee: ['badge-info', 'Terminée'],
    en_cours: ['badge-ok', 'En cours'],
    annulee: ['badge-no', 'Annulée'],
  };
  const [cls, txt] = map[statut] || ['', statut || '—'];
  return <span className={`badge ${cls}`}>{txt}</span>;
}
