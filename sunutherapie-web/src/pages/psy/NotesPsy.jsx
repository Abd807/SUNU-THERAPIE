import { useEffect, useState } from 'react';
import * as api from '../../lib/api';
import { Skeletons, Empty, Modal, formatDate } from '../../components/ui';

const TYPES = [
  { k: 'consultation', label: 'Consultation' },
  { k: 'privee', label: 'Privée' },
  { k: 'partagee', label: 'Partagée' },
  { k: 'urgence', label: 'Urgence' },
];

export default function NotesPsy() {
  const [liste, setListe] = useState(null);
  const [erreur, setErreur] = useState(null);
  const [ajout, setAjout] = useState(false);
  const [enCours, setEnCours] = useState(null);

  const charger = () => {
    api.getNotesPsy()
      .then(setListe)
      .catch((e) => { setErreur(e.message); setListe([]); });
  };

  useEffect(charger, []);

  const supprimer = async (n) => {
    if (!window.confirm(`Supprimer « ${n.titre} » ?`)) return;
    setEnCours(n.id);
    try { await api.supprimerNote(n.id); charger(); }
    catch (e) { setErreur(e.message); }
    finally { setEnCours(null); }
  };

  return (
    <>
      <div className="page-head" style={{ display: 'flex', justifyContent: 'space-between',
                                          alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 className="serif">Notes de suivi</h1>
          <p>Vos notes cliniques. Seules celles marquées « partagée » sont visibles par l'étudiant.</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setAjout(true)}>Nouvelle note</button>
      </div>

      {erreur ? <div className="alert alert-error">{erreur}</div> : null}

      {liste === null ? <Skeletons n={3} />
        : liste.length === 0 ? (
          <div className="card">
            <Empty emoji="📝" title="Aucune note">
              Consignez vos observations après un entretien pour garder le fil du suivi.
            </Empty>
          </div>
        ) : liste.map((n) => (
          <div className="card" key={n.id}>
            <div className="card-h">
              <h2>{n.titre}</h2>
              <span className="badge">{TYPES.find((t) => t.k === n.type)?.label || n.type}</span>
            </div>
            <p style={{ fontSize: 14.5, color: 'var(--muted)', whiteSpace: 'pre-wrap', lineHeight: 1.65 }}>
              {n.contenu}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          marginTop: 14, gap: 12, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, color: 'var(--faint)' }}>{formatDate(n.created_at)}</span>
              <button className="btn btn-danger btn-sm" disabled={enCours === n.id}
                      onClick={() => supprimer(n)}>Supprimer</button>
            </div>
          </div>
        ))}

      {ajout ? <Ajout onClose={() => setAjout(false)} onDone={() => { setAjout(false); charger(); }} /> : null}
    </>
  );
}

function Ajout({ onClose, onDone }) {
  const [f, setF] = useState({ titre: '', contenu: '', type: 'consultation' });
  const [erreur, setErreur] = useState(null);
  const [envoi, setEnvoi] = useState(false);

  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));

  const creer = async (e) => {
    e.preventDefault();
    setErreur(null);
    setEnvoi(true);
    try {
      await api.creerNote(f);
      onDone();
    } catch (err) {
      setErreur(err.message);
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <Modal title="Nouvelle note" sub="Elle reste privée sauf si vous choisissez « partagée »." onClose={onClose}>
      <form onSubmit={creer}>
        {erreur ? <div className="alert alert-error">{erreur}</div> : null}

        <div className="field">
          <label htmlFor="nt">Titre</label>
          <input id="nt" required maxLength={255} value={f.titre} onChange={set('titre')} />
        </div>

        <div className="field">
          <label htmlFor="ny">Type</label>
          <select id="ny" value={f.type} onChange={set('type')}>
            {TYPES.map((t) => <option key={t.k} value={t.k}>{t.label}</option>)}
          </select>
        </div>

        <div className="field">
          <label htmlFor="nc">Contenu</label>
          <textarea id="nc" required value={f.contenu} onChange={set('contenu')} style={{ minHeight: 150 }} />
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-outline btn-sm" onClick={onClose}>Annuler</button>
          <button className="btn btn-primary btn-sm" disabled={envoi}>{envoi ? 'Enregistrement…' : 'Enregistrer'}</button>
        </div>
      </form>
    </Modal>
  );
}
