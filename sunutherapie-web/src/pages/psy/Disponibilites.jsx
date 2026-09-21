import { useEffect, useState } from 'react';
import * as api from '../../lib/api';
import { Skeletons, Empty, Modal, heure } from '../../components/ui';

const aujourdhui = () => new Date().toISOString().slice(0, 10);

const dateLongue = (v) => {
  const d = new Date(String(v).replace(' ', 'T'));
  if (Number.isNaN(d.getTime())) return String(v);
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
};

export default function Disponibilites() {
  const [liste, setListe] = useState(null);
  const [erreur, setErreur] = useState(null);
  const [ajout, setAjout] = useState(false);
  const [enCours, setEnCours] = useState(null);

  const charger = () => {
    api.getMesDisponibilites()
      .then(setListe)
      .catch((e) => { setErreur(e.message); setListe([]); });
  };

  useEffect(charger, []);

  const basculer = async (d) => {
    setEnCours(d.id);
    try { await api.basculerDisponibilite(d.id); charger(); }
    catch (e) { setErreur(e.message); }
    finally { setEnCours(null); }
  };

  const supprimer = async (d) => {
    if (!window.confirm('Supprimer ce créneau ?')) return;
    setEnCours(d.id);
    try { await api.supprimerDisponibilite(d.id); charger(); }
    catch (e) { setErreur(e.message); }
    finally { setEnCours(null); }
  };

  // Regroupées par date, les plus proches d'abord.
  const parDate = {};
  for (const d of liste || []) {
    const k = String(d.date).slice(0, 10);
    (parDate[k] ||= []).push(d);
  }
  const dates = Object.keys(parDate).sort();

  return (
    <>
      <div className="page-head" style={{ display: 'flex', justifyContent: 'space-between',
                                          alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 className="serif">Mes disponibilités</h1>
          <p>Les créneaux que les étudiants peuvent réserver.</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setAjout(true)}>Ajouter un créneau</button>
      </div>

      {erreur ? <div className="alert alert-error">{erreur}</div> : null}

      {liste === null ? <Skeletons n={3} />
        : dates.length === 0 ? (
          <div className="card">
            <Empty emoji="🗓️" title="Aucun créneau publié">
              Tant que vous n'avez pas de disponibilités, les étudiants ne peuvent pas vous réserver.
            </Empty>
          </div>
        ) : dates.map((jour) => (
          <div className="card" key={jour}>
            <div className="card-h"><h2 style={{ textTransform: 'capitalize' }}>{dateLongue(jour)}</h2></div>
            {parDate[jour]
              .sort((a, b) => String(a.heure_debut).localeCompare(String(b.heure_debut)))
              .map((d) => (
                <div className="item" key={d.id}>
                  <div className="bd">
                    <div className="t">{heure(d.heure_debut)} – {heure(d.heure_fin)}</div>
                    <div className="s">{d.titre || (d.type === 'consultation' ? 'Consultation' : d.type)}</div>
                  </div>
                  <div className="r">
                    <span className={`badge ${d.actif ? 'badge-ok' : ''}`}>{d.actif ? 'Actif' : 'Masqué'}</span>
                    <button className="btn btn-outline btn-sm" disabled={enCours === d.id}
                            onClick={() => basculer(d)}>{d.actif ? 'Masquer' : 'Activer'}</button>
                    <button className="btn btn-danger btn-sm" disabled={enCours === d.id}
                            onClick={() => supprimer(d)}>Supprimer</button>
                  </div>
                </div>
              ))}
          </div>
        ))}

      {ajout ? <Ajout onClose={() => setAjout(false)} onDone={() => { setAjout(false); charger(); }} /> : null}
    </>
  );
}

function Ajout({ onClose, onDone }) {
  const [f, setF] = useState({ date: aujourdhui(), heure_debut: '09:00', heure_fin: '10:00', titre: '' });
  const [erreur, setErreur] = useState(null);
  const [envoi, setEnvoi] = useState(false);

  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));

  const creer = async (e) => {
    e.preventDefault();
    if (f.heure_fin <= f.heure_debut) {
      setErreur('L’heure de fin doit être après l’heure de début.');
      return;
    }
    setErreur(null);
    setEnvoi(true);
    try {
      await api.creerDisponibilite({
        date: f.date,
        heure_debut: f.heure_debut,
        heure_fin: f.heure_fin,
        titre: f.titre || 'Consultation',
        type: 'consultation',
        actif: true,
      });
      onDone();
    } catch (err) {
      setErreur(err.message);
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <Modal title="Nouveau créneau" sub="Il sera immédiatement visible par les étudiants." onClose={onClose}>
      <form onSubmit={creer}>
        {erreur ? <div className="alert alert-error">{erreur}</div> : null}

        <div className="field">
          <label htmlFor="dd">Date</label>
          <input id="dd" type="date" required min={aujourdhui()} value={f.date} onChange={set('date')} />
        </div>

        <div className="grid grid-2">
          <div className="field">
            <label htmlFor="hd">Début</label>
            <input id="hd" type="time" required value={f.heure_debut} onChange={set('heure_debut')} />
          </div>
          <div className="field">
            <label htmlFor="hf">Fin</label>
            <input id="hf" type="time" required value={f.heure_fin} onChange={set('heure_fin')} />
          </div>
        </div>

        <div className="field">
          <label htmlFor="ti">Intitulé <span style={{ color: 'var(--faint)', fontWeight: 500 }}>(facultatif)</span></label>
          <input id="ti" value={f.titre} onChange={set('titre')} placeholder="Consultation" />
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-outline btn-sm" onClick={onClose}>Annuler</button>
          <button className="btn btn-primary btn-sm" disabled={envoi}>{envoi ? 'Création…' : 'Créer'}</button>
        </div>
      </form>
    </Modal>
  );
}
