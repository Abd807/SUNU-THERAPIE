import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as api from '../lib/api';
import { useAuth } from '../lib/auth';
import { Aside } from './Login';

const NIVEAUX = ['L1', 'L2', 'L3', 'M1', 'M2', 'Doctorat'];

export default function Register() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [f, setF] = useState({
    name: '', email: '', password: '', password_confirmation: '', telephone: '',
    numero_carte_etudiant: '', universite: '', faculte: '', niveau: 'L1',
  });
  const [erreur, setErreur] = useState(null);
  const [envoi, setEnvoi] = useState(false);

  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setErreur(null);
    if (f.password !== f.password_confirmation) {
      setErreur('Les deux mots de passe ne correspondent pas.');
      return;
    }
    setEnvoi(true);
    try {
      const res = await api.register({ ...f, email: f.email.trim() });
      if (res.token) {
        api.setToken(res.token);
        setUser(res.user);
        navigate('/', { replace: true });
      } else {
        navigate('/connexion', { replace: true });
      }
    } catch (err) {
      setErreur(err.message);
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <div className="auth">
      <Aside />
      <main className="auth-main">
        <form className="auth-card" onSubmit={submit} style={{ maxWidth: 460 }}>
          <h2 className="serif">Créer votre compte</h2>
          <p className="sub">Réservé aux étudiants. Votre carte d'étudiant sert à vérifier votre inscription.</p>

          {erreur ? <div className="alert alert-error">{erreur}</div> : null}

          <div className="field">
            <label htmlFor="name">Nom complet</label>
            <input id="name" required value={f.name} onChange={set('name')} autoComplete="name" />
          </div>

          <div className="field">
            <label htmlFor="remail">Adresse e-mail</label>
            <input id="remail" type="email" required value={f.email} onChange={set('email')} autoComplete="email" />
          </div>

          <div className="grid grid-2">
            <div className="field">
              <label htmlFor="rpwd">Mot de passe</label>
              <input id="rpwd" type="password" required minLength={8} value={f.password}
                     onChange={set('password')} autoComplete="new-password" />
              <span className="hint">8 caractères minimum</span>
            </div>
            <div className="field">
              <label htmlFor="rpwd2">Confirmation</label>
              <input id="rpwd2" type="password" required value={f.password_confirmation}
                     onChange={set('password_confirmation')} autoComplete="new-password" />
            </div>
          </div>

          <div className="field">
            <label htmlFor="carte">Numéro de carte d'étudiant</label>
            <input id="carte" required value={f.numero_carte_etudiant} onChange={set('numero_carte_etudiant')} />
          </div>

          <div className="field">
            <label htmlFor="univ">Université</label>
            <input id="univ" required value={f.universite} onChange={set('universite')}
                   placeholder="Université Cheikh Anta Diop" />
          </div>

          <div className="grid grid-2">
            <div className="field">
              <label htmlFor="fac">Faculté</label>
              <input id="fac" required value={f.faculte} onChange={set('faculte')} />
            </div>
            <div className="field">
              <label htmlFor="niv">Niveau</label>
              <select id="niv" value={f.niveau} onChange={set('niveau')}>
                {NIVEAUX.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>

          <div className="field">
            <label htmlFor="tel">Téléphone <span style={{ color: 'var(--faint)', fontWeight: 500 }}>(facultatif)</span></label>
            <input id="tel" value={f.telephone} onChange={set('telephone')} autoComplete="tel" />
          </div>

          <button className="btn btn-primary btn-block" disabled={envoi}>
            {envoi ? 'Création…' : 'Créer mon compte'}
          </button>

          <p className="auth-switch">
            Déjà inscrit ? <Link to="/connexion">Se connecter</Link>
          </p>
        </form>
      </main>
    </div>
  );
}
