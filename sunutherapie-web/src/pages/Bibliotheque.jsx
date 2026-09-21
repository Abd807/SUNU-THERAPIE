import { useEffect, useState } from 'react';
import * as api from '../lib/api';
import { Skeletons, Empty } from '../components/ui';
import Lecteur from '../components/Lecteur';

const EMOJI = { livre: '📚', pdf: '📄', video: '🎬', lien_youtube: '▶️', audio: '🎧' };

export default function Bibliotheque() {
  const [liste, setListe] = useState(null);
  const [erreur, setErreur] = useState(null);
  const [recherche, setRecherche] = useState('');
  const [ouvert, setOuvert] = useState(null);

  useEffect(() => {
    let annule = false;
    api.getBibliotheque()
      .then((b) => { if (!annule) setListe(b); })
      .catch((e) => { if (!annule) { setErreur(e.message); setListe([]); } });
    return () => { annule = true; };
  }, []);

  const q = recherche.trim().toLowerCase();
  const visibles = (liste || []).filter((b) =>
    !q || [b.titre, b.auteur, b.description, b.categorie]
      .filter(Boolean).join(' ').toLowerCase().includes(q));

  if (ouvert) return <Lecteur item={ouvert} onBack={() => setOuvert(null)} />;

  return (
    <>
      <div className="page-head">
        <h1 className="serif">Bibliothèque</h1>
        <p>Des lectures et des contenus en accès libre, pour prendre soin de vous à votre rythme.</p>
      </div>

      {erreur ? <div className="alert alert-error">{erreur}</div> : null}

      {(liste || []).length > 4 ? (
        <div className="field" style={{ maxWidth: 380 }}>
          <input value={recherche} onChange={(e) => setRecherche(e.target.value)}
                 placeholder="Rechercher un titre, un auteur…" />
        </div>
      ) : null}

      {liste === null ? <Skeletons n={3} />
        : visibles.length === 0 ? (
          <div className="card">
            <Empty emoji="📚" title={q ? 'Aucun résultat' : 'La bibliothèque est vide'}>
              {q ? 'Essayez avec d’autres mots.' : 'Des contenus y seront ajoutés prochainement.'}
            </Empty>
          </div>
        ) : (
          <div className="grid grid-auto">
            {visibles.map((b) => {
              const couv = api.couvertureUrl(b);
              return (
                <button className="card" key={b.id} style={{ textAlign: 'left', padding: 0, overflow: 'hidden' }}
                        onClick={() => setOuvert(b)}>
                  {couv ? (
                    <div style={{ height: 210, background: 'var(--surfaceAlt)', display: 'flex',
                                  alignItems: 'center', justifyContent: 'center', padding: 14 }}>
                      <img src={couv} alt="" style={{ maxHeight: '100%', width: 'auto',
                                                      borderRadius: 6, boxShadow: '0 6px 18px rgba(11,58,56,.18)' }} />
                    </div>
                  ) : (
                    <div style={{ height: 90, background: 'var(--primaryLight)', display: 'flex',
                                  alignItems: 'center', justifyContent: 'center', fontSize: 34 }}>
                      {EMOJI[b.type] || '📚'}
                    </div>
                  )}
                  <div style={{ padding: 18 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.3 }}>{b.titre}</div>
                    {b.auteur ? (
                      <div style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600, marginTop: 3 }}>{b.auteur}</div>
                    ) : null}
                    {b.description ? (
                      <p style={{ fontSize: 13.5, color: 'var(--muted)', marginTop: 8,
                                  display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden' }}>{b.description}</p>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        )}
    </>
  );
}
