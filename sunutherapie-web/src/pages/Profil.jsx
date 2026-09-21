import { useState } from 'react';
import * as api from '../lib/api';
import { useAuth } from '../lib/auth';
import { initials } from '../components/ui';

export default function Profil() {
  const { user, refresh, signOut } = useAuth();
  const estPsy = user?.role === 'psychologue';
  const etudiant = user?.etudiant || {};
  const psy = user?.psychologue || {};
  const [f, setF] = useState({
    name: user?.name || '',
    telephone: user?.telephone || '',
  });
  const [msg, setMsg] = useState(null);
  const [erreur, setErreur] = useState(null);
  const [envoi, setEnvoi] = useState(false);

  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));

  const enregistrer = async (e) => {
    e.preventDefault();
    setMsg(null);
    setErreur(null);
    setEnvoi(true);
    try {
      await api.updateProfile(f);
      await refresh();
      setMsg('Vos informations ont été enregistrées.');
    } catch (err) {
      setErreur(err.message);
    } finally {
      setEnvoi(false);
    }
  };

  const Ligne = ({ label, valeur }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '11px 0',
                  borderTop: '1px solid var(--border)', fontSize: 14 }}>
      <span style={{ color: 'var(--muted)' }}>{label}</span>
      <span style={{ fontWeight: 600, textAlign: 'right' }}>{valeur || '—'}</span>
    </div>
  );

  return (
    <>
      <div className="page-head">
        <h1 className="serif">Mon profil</h1>
        <p>Vos informations personnelles et votre inscription universitaire.</p>
      </div>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
          <div className="av" style={{ width: 58, height: 58, borderRadius: '50%', fontSize: 20,
                                       background: 'var(--primaryLight)', color: 'var(--primaryDark)',
                                       display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
            {initials(user?.name || '')}
          </div>
          <div>
            <div style={{ fontSize: 19, fontWeight: 700 }}>{user?.name}</div>
            <div style={{ fontSize: 13.5, color: 'var(--muted)' }}>{user?.email}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-h"><h2>{estPsy ? 'Exercice' : 'Scolarité'}</h2></div>
        {estPsy ? (
          <>
            <Ligne label="Spécialité" valeur={psy.specialite} />
            <Ligne label="Structure" valeur={psy.structure} />
            <Ligne label="Numéro d'ordre" valeur={psy.numero_ordre} />
            <Ligne label="Années d'expérience" valeur={psy.annees_experience} />
          </>
        ) : (
          <>
            <Ligne label="Université" valeur={etudiant.universite} />
            <Ligne label="Faculté" valeur={etudiant.faculte} />
            <Ligne label="Niveau" valeur={etudiant.niveau} />
            <Ligne label="Carte d'étudiant" valeur={etudiant.numero_carte_etudiant} />
          </>
        )}
      </div>

      <form className="card" onSubmit={enregistrer}>
        <div className="card-h"><h2>Modifier mes informations</h2></div>

        {msg ? <div className="alert alert-ok">{msg}</div> : null}
        {erreur ? <div className="alert alert-error">{erreur}</div> : null}

        <div className="field">
          <label htmlFor="pn">Nom complet</label>
          <input id="pn" value={f.name} onChange={set('name')} required />
        </div>

        <div className="field">
          <label htmlFor="pt">Téléphone</label>
          <input id="pt" value={f.telephone} onChange={set('telephone')} />
        </div>

        <button className="btn btn-primary btn-sm" disabled={envoi}>
          {envoi ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </form>

      <div className="card">
        <div className="card-h"><h2>Session</h2></div>
        <button className="btn btn-danger btn-sm" onClick={signOut}>Se déconnecter</button>
      </div>
    </>
  );
}
