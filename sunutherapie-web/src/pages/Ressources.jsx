import { useEffect, useState } from 'react';
import * as api from '../lib/api';
import { Icon, Skeletons, Empty } from '../components/ui';
import Lecteur from '../components/Lecteur';

const CATEGORIES = {
  anxiete: 'Anxiété', depression: 'Dépression', stress: 'Stress',
  sommeil: 'Sommeil', confiance: 'Confiance en soi', deuil: 'Deuil', autre: 'Autre',
};
const EMOJI = { pdf: '📄', note: '📝', lien_youtube: '▶️', video_upload: '🎬', lien_web: '🔗', audio: '🎧' };

export default function Ressources() {
  const [liste, setListe] = useState(null);
  const [erreur, setErreur] = useState(null);
  const [filtre, setFiltre] = useState('toutes');
  const [ouvert, setOuvert] = useState(null);

  useEffect(() => {
    let annule = false;
    api.getRessources()
      .then((r) => { if (!annule) setListe(r); })
      .catch((e) => { if (!annule) { setErreur(e.message); setListe([]); } });
    return () => { annule = true; };
  }, []);

  const categories = [...new Set((liste || []).map((r) => r.categorie).filter(Boolean))];
  const visibles = (liste || []).filter((r) => filtre === 'toutes' || r.categorie === filtre);

  const ouvrir = (r) => {
    setOuvert(r);
    api.marquerRessourceLue(r.id).catch(() => { /* le suivi de lecture n'est pas bloquant */ });
  };

  if (ouvert) return <Lecteur item={ouvert} onBack={() => setOuvert(null)} />;

  return (
    <>
      <div className="page-head">
        <h1 className="serif">Mes ressources</h1>
        <p>Les documents et contenus que votre psychothérapeute a partagés avec vous.</p>
      </div>

      {erreur ? <div className="alert alert-error">{erreur}</div> : null}

      {categories.length > 1 ? (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
          <button className={`btn btn-sm ${filtre === 'toutes' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setFiltre('toutes')}>Toutes</button>
          {categories.map((c) => (
            <button key={c} className={`btn btn-sm ${filtre === c ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setFiltre(c)}>{CATEGORIES[c] || c}</button>
          ))}
        </div>
      ) : null}

      {liste === null ? <Skeletons n={3} />
        : visibles.length === 0 ? (
          <div className="card">
            <Empty emoji="📄" title="Aucune ressource pour l'instant">
              Votre psychothérapeute peut vous partager des documents, des lectures ou des exercices. Ils apparaîtront ici.
            </Empty>
          </div>
        ) : (
          <div className="grid grid-auto">
            {visibles.map((r) => (
              <button className="card" key={r.id} style={{ textAlign: 'left' }} onClick={() => ouvrir(r)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 22 }}>{EMOJI[r.type] || '📄'}</span>
                  <span className="badge">{CATEGORIES[r.categorie] || r.categorie || 'Ressource'}</span>
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.3 }}>{r.titre}</div>
                {r.description ? (
                  <p style={{ fontSize: 13.5, color: 'var(--muted)', marginTop: 7 }}>{r.description}</p>
                ) : null}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 13,
                              color: 'var(--primary)', fontWeight: 700, fontSize: 13 }}>
                  Ouvrir <Icon name="external" size={15} />
                </div>
              </button>
            ))}
          </div>
        )}
    </>
  );
}
