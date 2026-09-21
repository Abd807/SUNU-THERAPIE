import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { Icon, initials } from './ui';

const LIENS = [
  { to: '/', icon: 'home', label: 'Accueil', end: true },
  { to: '/rendez-vous', icon: 'calendar', label: 'Prendre rendez-vous' },
  { to: '/consultations', icon: 'users', label: 'Mes consultations' },
  { to: '/ressources', icon: 'file', label: 'Mes ressources' },
  { to: '/bibliotheque', icon: 'book', label: 'Bibliothèque' },
  { to: '/forum', icon: 'chat', label: 'Forum' },
  { to: '/profil', icon: 'user', label: 'Mon profil' },
];

export default function Layout() {
  const { user, signOut } = useAuth();
  const [ouvert, setOuvert] = useState(false);
  const location = useLocation();

  // La navigation au clavier ou au clic referme le tiroir sur mobile.
  const fermer = () => setOuvert(false);

  const nom = user?.nom || user?.name || user?.email || 'Étudiant';

  return (
    <div className="shell">
      {ouvert ? <div className="side-scrim" onClick={fermer} /> : null}

      <aside className={`side${ouvert ? ' open' : ''}`}>
        <div className="side-brand">
          <img src="/logo.jpeg" alt="" />
          <span>SunuThérapie</span>
        </div>

        <nav className="side-nav">
          {LIENS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} onClick={fermer}
                     className={({ isActive }) => (isActive ? 'active' : undefined)}>
              <Icon name={l.icon} className="ic" />
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="side-foot">
          <div className="side-user">
            <div className="av">{initials(nom)}</div>
            <div style={{ minWidth: 0 }}>
              <div className="nm">{nom}</div>
              <div className="rl">{user?.email}</div>
            </div>
          </div>
          <button className="btn btn-outline btn-sm btn-block" onClick={signOut}>
            <Icon name="logout" size={16} />
            Se déconnecter
          </button>
        </div>
      </aside>

      <div className="main">
        <div className="topbar">
          <button onClick={() => setOuvert((v) => !v)} aria-label="Ouvrir le menu">
            <Icon name="menu" size={22} />
          </button>
          <div className="brand">
            <img src="/logo.jpeg" alt="" />
            SunuThérapie
          </div>
        </div>

        <div className="content" key={location.pathname}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
