import { useEffect, useState } from 'react';
import * as api from '../../lib/api';
import { Skeletons, Empty, Modal } from '../../components/ui';

const TYPES = [
  { k: 'lien_web', label: 'Lien web' },
  { k: 'lien_youtube', label: 'Vidéo YouTube' },
  { k: 'pdf', label: 'Document PDF (lien)' },
  { k: 'audio', label: 'Audio (lien)' },
  { k: 'note', label: 'Note écrite' },
];
const CATEGORIES = [
  { k: 'anxiete', label: 'Anxiété' }, { k: 'depression', label: 'Dépression' },
  { k: 'stress', label: 'Stress' }, { k: 'sommeil', label: 'Sommeil' },
  { k: 'confiance', label: 'Confiance en soi' }, { k: 'deuil', label: 'Deuil' },
  { k: 'autre', label: 'Autre' },
];
const libelle = (arr, k) => arr.find((x) => x.k === k)?.label || k;

export default function MesRessources() {
  const [liste, setListe] = useState(null);
  const [erreur, setErreur] = useState(null);
  const [ajout, setAjout] = useState(false);
  const [enCours, setEnCours] = useState(null);

  const charger = () => {
    api.getMesRessources()
      .then(setListe)
      .catch((e) => { setErreur(e.message); setListe([]); });
  };

  useEffect(charger, []);

  const supprimer = async (r) => {
    if (!window.confirm(`Supprimer « ${r.titre} » ?`)) return;
    setEnCours(r.id);
    try { await api.supprimerRessource(r.id); charger(); }
    catch (e) { setErreur(e.message); }
    finally { setEnCours(null); }
  };

  return (
    <>
      <div className="page-head" style={{ display: 'flex', justifyContent: 'space-between',
                                          alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 className="serif">Mes ressources</h1>
          <p>Ce que vous partagez avec vos patients : lectures, vidéos, exercices.</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setAjout(true)}>Partager une ressource</button>
      </div>

      {erreur ? <div className="alert alert-error">{erreur}</div> : null}

      {liste === null ? <Skeletons n={3} />
        : liste.length === 0 ? (
          <div className="card">
            <Empty emoji="📄" title="Aucune ressource partagée">
              Partagez une lecture ou un exercice : vos patients le retrouveront dans leur espace.
            </Empty>
          </div>
        ) : liste.map((r) => (
          <div className="item" key={r.id}>
            <div className="bd">
              <div className="t">{r.titre}</div>
              <div className="s">
                {libelle(TYPES, r.type)} · {libelle(CATEGORIES, r.categorie)}
                {r.public ? ' · Publique' : ''}
              </div>
              {r.description ? <div className="s">{r.description}</div> : null}
            </div>
            <div className="r">
              <button className="btn btn-danger btn-sm" disabled={enCours === r.id}
                      onClick={() => supprimer(r)}>Supprimer</button>
            </div>
          </div>
        ))}

      {ajout ? <Ajout onClose={() => setAjout(false)} onDone={() => { setAjout(false); charger(); }} /> : null}
    </>
  );
}

function Ajout({ onClose, onDone }) {
  const [f, setF] = useState({
    titre: '', description: '', type: 'lien_web', categorie: 'autre',
    url: '', destinataires: 'tous_mes_patients', public: false,
  });
  const [erreur, setErreur] = useState(null);
  const [envoi, setEnvoi] = useState(false);

  const set = (k) => (e) =>
    setF((s) => ({ ...s, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const besoinUrl = f.type !== 'note';

  const creer = async (e) => {
    e.preventDefault();
    if (besoinUrl && !f.url.trim()) { setErreur('Indiquez le lien de la ressource.'); return; }
    setErreur(null);
    setEnvoi(true);
    try {
      await api.creerRessource({ ...f, url: f.url.trim() || null });
      onDone();
    } catch (err) {
      setErreur(err.message);
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <Modal title="Partager une ressource" sub="Elle apparaîtra dans l'espace de vos patients." onClose={onClose}>
      <form onSubmit={creer}>
        {erreur ? <div className="alert alert-error">{erreur}</div> : null}

        <div className="field">
          <label htmlFor="rt">Titre</label>
          <input id="rt" required maxLength={255} value={f.titre} onChange={set('titre')} />
        </div>

        <div className="grid grid-2">
          <div className="field">
            <label htmlFor="ry">Type</label>
            <select id="ry" value={f.type} onChange={set('type')}>
              {TYPES.map((t) => <option key={t.k} value={t.k}>{t.label}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="rc">Catégorie</label>
            <select id="rc" value={f.categorie} onChange={set('categorie')}>
              {CATEGORIES.map((c) => <option key={c.k} value={c.k}>{c.label}</option>)}
            </select>
          </div>
        </div>

        {besoinUrl ? (
          <div className="field">
            <label htmlFor="ru">Lien</label>
            <input id="ru" value={f.url} onChange={set('url')} placeholder="https://…" />
          </div>
        ) : null}

        <div className="field">
          <label htmlFor="rd">{f.type === 'note' ? 'Contenu de la note' : 'Description'}</label>
          <textarea id="rd" value={f.description} onChange={set('description')} />
        </div>

        <div className="field">
          <label htmlFor="rde">Destinataires</label>
          <select id="rde" value={f.destinataires} onChange={set('destinataires')}>
            <option value="tous_mes_patients">Tous mes patients</option>
            <option value="plusieurs_patients">Plusieurs patients</option>
            <option value="un_patient">Un patient</option>
          </select>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 14, cursor: 'pointer' }}>
          <input type="checkbox" checked={f.public} onChange={set('public')} style={{ width: 17, height: 17 }} />
          Rendre visible dans la bibliothèque publique
        </label>

        <div className="modal-actions">
          <button type="button" className="btn btn-outline btn-sm" onClick={onClose}>Annuler</button>
          <button className="btn btn-primary btn-sm" disabled={envoi}>{envoi ? 'Partage…' : 'Partager'}</button>
        </div>
      </form>
    </Modal>
  );
}
