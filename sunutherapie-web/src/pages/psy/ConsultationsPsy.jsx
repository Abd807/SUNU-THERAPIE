import { useEffect, useState } from 'react';
import * as api from '../../lib/api';
import { Icon, Skeletons, Empty, initials, formatDate, statutBadge } from '../../components/ui';

const FILTRES = [
  { k: 'toutes', label: 'Toutes' },
  { k: 'acceptee', label: 'À venir' },
  { k: 'terminee', label: 'Terminées' },
  { k: 'refusee', label: 'Refusées' },
];

export default function ConsultationsPsy() {
  const [liste, setListe] = useState(null);
  const [erreur, setErreur] = useState(null);
  const [filtre, setFiltre] = useState('toutes');
  const [enCours, setEnCours] = useState(null);

  const charger = () => {
    api.getConsultationsPsy()
      .then(setListe)
      .catch((e) => { setErreur(e.message); setListe([]); });
  };

  useEffect(charger, []);

  const nomEtudiant = (c) => c?.etudiant?.user?.name || c?.etudiant?.nom || 'Étudiant';

  const terminer = async (c) => {
    setEnCours(c.id);
    setErreur(null);
    try {
      await api.terminerConsultation(c.id);
      charger();
    } catch (e) {
      setErreur(e.message);
    } finally {
      setEnCours(null);
    }
  };

  const visibles = (liste || [])
    .filter((c) => filtre === 'toutes' || c.statut === filtre)
    .sort((a, b) => new Date(b.date_consultation) - new Date(a.date_consultation));

  return (
    <>
      <div className="page-head">
        <h1 className="serif">Mes consultations</h1>
        <p>L'ensemble de vos rendez-vous avec les étudiants.</p>
      </div>

      {erreur ? <div className="alert alert-error">{erreur}</div> : null}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
        {FILTRES.map((f) => (
          <button key={f.k} className={`btn btn-sm ${filtre === f.k ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setFiltre(f.k)}>{f.label}</button>
        ))}
      </div>

      {liste === null ? <Skeletons n={4} />
        : visibles.length === 0 ? (
          <div className="card">
            <Empty emoji="💬" title="Aucune consultation">
              {filtre === 'toutes' ? 'Votre historique apparaîtra ici.' : 'Rien dans cette catégorie.'}
            </Empty>
          </div>
        ) : visibles.map((c) => (
          <div className="item" key={c.id}>
            <div className="av">{initials(nomEtudiant(c))}</div>
            <div className="bd">
              <div className="t">{nomEtudiant(c)}</div>
              <div className="s">
                {formatDate(c.date_consultation)}
                {c.mode ? ` · ${c.mode === 'audio' ? 'Audio' : 'Vidéo'}` : ''}
              </div>
              {c.note_etudiant ? (
                <div className="s">Évaluation de l'étudiant : ★ {Number(c.note_etudiant).toFixed(1)}</div>
              ) : null}
            </div>
            <div className="r">
              {statutBadge(c.statut)}
              {c.statut === 'acceptee' ? (
                <button className="btn btn-ghost btn-sm" disabled={enCours === c.id}
                        onClick={() => terminer(c)}>
                  {enCours === c.id ? '…' : 'Terminer'}
                </button>
              ) : null}
            </div>
          </div>
        ))}

      <div className="note-mobile" style={{ marginTop: 20 }}>
        <Icon name="video" size={20} />
        <div>
          <b>Lancer une consultation</b>
          L'appel vidéo ou audio se démarre depuis l'application mobile SunuThérapie. Ici, vous pouvez marquer une consultation comme terminée une fois l'entretien fini.
        </div>
      </div>
    </>
  );
}
