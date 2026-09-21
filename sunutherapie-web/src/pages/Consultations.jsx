import { useEffect, useState } from 'react';
import * as api from '../lib/api';
import { Icon, Skeletons, Empty, Modal, initials, formatDate, statutBadge } from '../components/ui';

export default function Consultations() {
  const [liste, setListe] = useState(null);
  const [erreur, setErreur] = useState(null);
  const [aNoter, setANoter] = useState(null);

  const charger = () => {
    setListe(null);
    api.getConsultations()
      .then(setListe)
      .catch((e) => { setErreur(e.message); setListe([]); });
  };

  useEffect(charger, []);

  const triees = (liste || []).slice()
    .sort((a, b) => new Date(b.date_consultation) - new Date(a.date_consultation));

  const nomPsy = (c) => c?.psychologue?.user?.name || c?.psychologue?.nom || 'Psychothérapeute';

  return (
    <>
      <div className="page-head">
        <h1 className="serif">Mes consultations</h1>
        <p>L'historique de vos rendez-vous, passés et à venir.</p>
      </div>

      {erreur ? <div className="alert alert-error">{erreur}</div> : null}

      {liste === null ? <Skeletons n={4} />
        : triees.length === 0 ? (
          <div className="card">
            <Empty emoji="💬" title="Aucune consultation">
              Dès votre premier rendez-vous, il apparaîtra ici avec son statut.
            </Empty>
          </div>
        ) : triees.map((c) => (
          <div className="item" key={c.id}>
            <div className="av">{initials(nomPsy(c))}</div>
            <div className="bd">
              <div className="t">{nomPsy(c)}</div>
              <div className="s">
                {formatDate(c.date_consultation)}
                {c.mode ? ` · ${c.mode === 'audio' ? 'Audio' : 'Vidéo'}` : ''}
              </div>
              {c.motif_refus ? (
                <div className="s" style={{ color: 'var(--danger)' }}>Motif du refus : {c.motif_refus}</div>
              ) : null}
            </div>
            <div className="r">
              {statutBadge(c.statut)}
              {c.statut === 'terminee' && !c.note_etudiant ? (
                <button className="btn btn-ghost btn-sm" onClick={() => setANoter(c)}>Noter</button>
              ) : null}
              {c.note_etudiant ? (
                <span className="badge">★ {Number(c.note_etudiant).toFixed(1)}</span>
              ) : null}
            </div>
          </div>
        ))}

      <div className="note-mobile" style={{ marginTop: 20 }}>
        <Icon name="video" size={20} />
        <div>
          <b>Rejoindre un appel</b>
          Les consultations vidéo et audio se déroulent dans l'application mobile SunuThérapie, qui gère la caméra et le micro de votre téléphone.
        </div>
      </div>

      {aNoter ? (
        <Notation consultation={aNoter} nom={nomPsy(aNoter)}
                  onClose={() => setANoter(null)}
                  onDone={() => { setANoter(null); charger(); }} />
      ) : null}
    </>
  );
}

function Notation({ consultation, nom, onClose, onDone }) {
  const [note, setNote] = useState(0);
  const [commentaire, setCommentaire] = useState('');
  const [erreur, setErreur] = useState(null);
  const [envoi, setEnvoi] = useState(false);

  const envoyer = async () => {
    if (!note) { setErreur('Choisissez une note entre 1 et 5.'); return; }
    setErreur(null);
    setEnvoi(true);
    try {
      await api.noterConsultation(consultation.id, note, commentaire || null);
      onDone();
    } catch (e) {
      setErreur(e.message);
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <Modal title="Votre avis" sub={`Comment s'est passée votre consultation avec ${nom} ?`} onClose={onClose}>
      {erreur ? <div className="alert alert-error">{erreur}</div> : null}

      <div className="field">
        <label>Note</label>
        <div className="stars">
          {[1, 2, 3, 4, 5].map((n) => (
            <button type="button" key={n} className={n <= note ? 'on' : undefined}
                    onClick={() => setNote(n)} aria-label={`${n} sur 5`}>★</button>
          ))}
        </div>
      </div>

      <div className="field">
        <label htmlFor="cm">Commentaire <span style={{ color: 'var(--faint)', fontWeight: 500 }}>(facultatif)</span></label>
        <textarea id="cm" value={commentaire} onChange={(e) => setCommentaire(e.target.value)} />
      </div>

      <div className="modal-actions">
        <button className="btn btn-outline btn-sm" onClick={onClose}>Annuler</button>
        <button className="btn btn-primary btn-sm" disabled={envoi} onClick={envoyer}>
          {envoi ? 'Envoi…' : 'Envoyer'}
        </button>
      </div>
    </Modal>
  );
}
