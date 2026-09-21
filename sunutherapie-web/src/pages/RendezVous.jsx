import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../lib/api';
import { Skeletons, Empty, Modal, initials, heure } from '../components/ui';

const aujourdhui = () => new Date().toISOString().slice(0, 10);

export default function RendezVous() {
  const navigate = useNavigate();
  const [psys, setPsys] = useState(null);
  const [erreur, setErreur] = useState(null);
  const [choisi, setChoisi] = useState(null);

  useEffect(() => {
    let annule = false;
    api.getPsysDisponibles()
      .then((r) => { if (!annule) setPsys(r.data); })
      .catch((e) => { if (!annule) { setErreur(e.message); setPsys([]); } });
    return () => { annule = true; };
  }, []);

  return (
    <>
      <div className="page-head">
        <h1 className="serif">Prendre rendez-vous</h1>
        <p>Choisissez un psychothérapeute, puis un créneau parmi ses disponibilités.</p>
      </div>

      {erreur ? <div className="alert alert-error">{erreur}</div> : null}

      {psys === null ? <Skeletons n={4} />
        : psys.length === 0 ? (
          <div className="card">
            <Empty emoji="🕊️" title="Aucun psychothérapeute disponible">
              Les disponibilités sont publiées régulièrement. Revenez un peu plus tard, ou consultez vos ressources en attendant.
            </Empty>
          </div>
        ) : (
          <div className="grid grid-auto">
            {psys.map((p) => {
              const nom = p?.user?.name || p?.nom || 'Psychothérapeute';
              return (
                <div className="card" key={p.id}>
                  <div className="item" style={{ border: 'none', padding: 0 }}>
                    <div className="av">{initials(nom)}</div>
                    <div className="bd">
                      <div className="t">{nom}</div>
                      <div className="s">{p.specialite || p.structure || 'Psychothérapeute'}</div>
                    </div>
                  </div>
                  {p.presentation ? (
                    <p style={{ fontSize: 13.5, color: 'var(--muted)', marginTop: 12 }}>{p.presentation}</p>
                  ) : null}
                  <button className="btn btn-primary btn-block btn-sm" style={{ marginTop: 14 }}
                          onClick={() => setChoisi({ ...p, nom })}>
                    Voir ses créneaux
                  </button>
                </div>
              );
            })}
          </div>
        )}

      {choisi ? (
        <Reservation psy={choisi} onClose={() => setChoisi(null)}
                     onReserve={() => { setChoisi(null); navigate('/consultations'); }} />
      ) : null}
    </>
  );
}

function Reservation({ psy, onClose, onReserve }) {
  const [date, setDate] = useState(aujourdhui());
  const [creneaux, setCreneaux] = useState(null);
  const [slot, setSlot] = useState(null);
  const [motif, setMotif] = useState('');
  const [mode, setMode] = useState('video');
  const [erreur, setErreur] = useState(null);
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    let annule = false;
    setCreneaux(null);
    setSlot(null);
    api.getCreneaux(psy.id, date)
      .then((c) => { if (!annule) setCreneaux(c); })
      .catch((e) => { if (!annule) { setErreur(e.message); setCreneaux([]); } });
    return () => { annule = true; };
  }, [psy.id, date]);

  const reserver = async () => {
    if (!slot) return;
    setErreur(null);
    setEnvoi(true);
    try {
      await api.creerConsultation({
        psychologue_id: psy.id,
        type: 'planifiee',
        mode,
        date_consultation: `${date} ${String(slot.heure_debut).slice(0, 8) || '09:00:00'}`,
        motif_consultation: motif || null,
      });
      onReserve();
    } catch (e) {
      setErreur(e.message);
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <Modal title={psy.nom} sub="Sélectionnez une date puis un créneau." onClose={onClose}>
      {erreur ? <div className="alert alert-error">{erreur}</div> : null}

      <div className="field">
        <label htmlFor="d">Date</label>
        <input id="d" type="date" value={date} min={aujourdhui()} onChange={(e) => setDate(e.target.value)} />
      </div>

      <div className="field">
        <label>Créneaux</label>
        {creneaux === null ? <div className="skel" style={{ height: 46 }} />
          : creneaux.length === 0 ? (
            <p style={{ fontSize: 13.5, color: 'var(--muted)' }}>
              Aucun créneau ce jour-là. Essayez une autre date.
            </p>
          ) : (
            <div className="slots">
              {creneaux.map((c) => (
                <button type="button" key={c.id}
                        className={`slot${slot?.id === c.id ? ' on' : ''}`}
                        onClick={() => setSlot(c)}>
                  {heure(c.heure_debut)}
                </button>
              ))}
            </div>
          )}
      </div>

      <div className="field">
        <label htmlFor="m">Mode</label>
        <select id="m" value={mode} onChange={(e) => setMode(e.target.value)}>
          <option value="video">Vidéo</option>
          <option value="audio">Audio</option>
        </select>
        <span className="hint">L'appel se déroulera dans l'application mobile.</span>
      </div>

      <div className="field">
        <label htmlFor="mo">Motif <span style={{ color: 'var(--faint)', fontWeight: 500 }}>(facultatif)</span></label>
        <textarea id="mo" value={motif} onChange={(e) => setMotif(e.target.value)}
                  placeholder="Ce dont vous souhaitez parler…" />
      </div>

      <div className="modal-actions">
        <button className="btn btn-outline btn-sm" onClick={onClose}>Annuler</button>
        <button className="btn btn-primary btn-sm" disabled={!slot || envoi} onClick={reserver}>
          {envoi ? 'Envoi…' : 'Confirmer'}
        </button>
      </div>
    </Modal>
  );
}
