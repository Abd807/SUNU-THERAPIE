import { useEffect, useState } from 'react';
import * as api from '../../lib/api';
import { Skeletons, Empty, Modal, initials, formatDate } from '../../components/ui';

export default function Demandes() {
  const [liste, setListe] = useState(null);
  const [erreur, setErreur] = useState(null);
  const [message, setMessage] = useState(null);
  const [aRefuser, setARefuser] = useState(null);
  const [enCours, setEnCours] = useState(null);

  const charger = () => {
    api.getDemandesEnAttente()
      .then(setListe)
      .catch((e) => { setErreur(e.message); setListe([]); });
  };

  useEffect(charger, []);

  const nomEtudiant = (c) => c?.etudiant?.user?.name || c?.etudiant?.nom || 'Étudiant';

  const accepter = async (c) => {
    setEnCours(c.id);
    setErreur(null);
    try {
      await api.accepterConsultation(c.id);
      setMessage(`Rendez-vous avec ${nomEtudiant(c)} accepté.`);
      charger();
    } catch (e) {
      setErreur(e.message);
    } finally {
      setEnCours(null);
    }
  };

  return (
    <>
      <div className="page-head">
        <h1 className="serif">Demandes de rendez-vous</h1>
        <p>Les étudiants qui souhaitent vous consulter.</p>
      </div>

      {message ? <div className="alert alert-ok">{message}</div> : null}
      {erreur ? <div className="alert alert-error">{erreur}</div> : null}

      {liste === null ? <Skeletons n={3} />
        : liste.length === 0 ? (
          <div className="card">
            <Empty emoji="✅" title="Aucune demande en attente">
              Quand un étudiant demandera un rendez-vous, il apparaîtra ici.
            </Empty>
          </div>
        ) : liste.map((c) => (
          <div className="card" key={c.id}>
            <div className="item" style={{ border: 'none', padding: 0 }}>
              <div className="av">{initials(nomEtudiant(c))}</div>
              <div className="bd">
                <div className="t">{nomEtudiant(c)}</div>
                <div className="s">
                  {formatDate(c.date_consultation)}
                  {c.mode ? ` · ${c.mode === 'audio' ? 'Audio' : 'Vidéo'}` : ''}
                  {c.type && c.type !== 'planifiee' ? ` · ${c.type}` : ''}
                </div>
                {c.etudiant?.universite ? (
                  <div className="s">{c.etudiant.universite}{c.etudiant.niveau ? ` — ${c.etudiant.niveau}` : ''}</div>
                ) : null}
              </div>
            </div>

            {c.motif_consultation ? (
              <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 14,
                          background: 'var(--surfaceAlt)', padding: '12px 14px', borderRadius: 12 }}>
                « {c.motif_consultation} »
              </p>
            ) : null}

            <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
              <button className="btn btn-primary btn-sm" disabled={enCours === c.id}
                      onClick={() => accepter(c)}>
                {enCours === c.id ? 'Traitement…' : 'Accepter'}
              </button>
              <button className="btn btn-outline btn-sm" onClick={() => setARefuser(c)}>Refuser</button>
            </div>
          </div>
        ))}

      {aRefuser ? (
        <Refus consultation={aRefuser} nom={nomEtudiant(aRefuser)}
               onClose={() => setARefuser(null)}
               onDone={(nom) => { setARefuser(null); setMessage(`Demande de ${nom} refusée.`); charger(); }} />
      ) : null}
    </>
  );
}

function Refus({ consultation, nom, onClose, onDone }) {
  const [motif, setMotif] = useState('');
  const [erreur, setErreur] = useState(null);
  const [envoi, setEnvoi] = useState(false);

  const refuser = async () => {
    if (!motif.trim()) { setErreur('Indiquez un motif : l’étudiant le verra.'); return; }
    setErreur(null);
    setEnvoi(true);
    try {
      await api.refuserConsultation(consultation.id, motif.trim());
      onDone(nom);
    } catch (e) {
      setErreur(e.message);
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <Modal title="Refuser la demande" sub={`${nom} recevra le motif que vous indiquez.`} onClose={onClose}>
      {erreur ? <div className="alert alert-error">{erreur}</div> : null}
      <div className="field">
        <label htmlFor="mr">Motif</label>
        <textarea id="mr" value={motif} onChange={(e) => setMotif(e.target.value)}
                  placeholder="Indisponible à cet horaire, je vous propose…" />
      </div>
      <div className="modal-actions">
        <button className="btn btn-outline btn-sm" onClick={onClose}>Annuler</button>
        <button className="btn btn-danger btn-sm" disabled={envoi} onClick={refuser}>
          {envoi ? 'Envoi…' : 'Refuser'}
        </button>
      </div>
    </Modal>
  );
}
