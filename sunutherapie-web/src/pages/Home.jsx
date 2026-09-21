import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../lib/api';
import { useAuth } from '../lib/auth';
import { Icon, Skeletons, Empty, initials, formatDate, statutBadge } from '../components/ui';

export default function Home() {
  const { user } = useAuth();
  const [consultations, setConsultations] = useState(null);
  const [psys, setPsys] = useState(null);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    let annule = false;
    (async () => {
      try {
        const [c, p] = await Promise.all([
          api.getConsultations(),
          api.getPsysDisponibles().then((r) => r.data).catch(() => []),
        ]);
        if (annule) return;
        setConsultations(c);
        setPsys(p);
      } catch (e) {
        if (!annule) { setErreur(e.message); setConsultations([]); setPsys([]); }
      }
    })();
    return () => { annule = true; };
  }, []);

  const prenom = (user?.name || user?.nom || '').split(' ')[0] || '';

  // Le prochain rendez-vous : la consultation acceptée la plus proche dans le futur.
  const prochain = (consultations || [])
    .filter((c) => ['acceptee', 'en_cours'].includes(c.statut) && new Date(String(c.date_consultation).replace(' ', 'T')) >= new Date(Date.now() - 36e5))
    .sort((a, b) => new Date(a.date_consultation) - new Date(b.date_consultation))[0];

  const recentes = (consultations || [])
    .slice()
    .sort((a, b) => new Date(b.date_consultation) - new Date(a.date_consultation))
    .slice(0, 4);

  const nomPsy = (c) => c?.psychologue?.user?.name || c?.psychologue?.nom || 'Psychothérapeute';

  return (
    <>
      <div className="page-head">
        <h1 className="serif">Bonjour {prenom} 👋</h1>
        <p>Voici où vous en êtes aujourd'hui.</p>
      </div>

      {erreur ? <div className="alert alert-error">{erreur}</div> : null}

      {consultations === null ? <Skeletons n={2} /> : prochain ? (
        <div className="next-rdv">
          <div className="lbl">Prochain rendez-vous</div>
          <h3 className="serif">{nomPsy(prochain)}</h3>
          <div className="when">{formatDate(prochain.date_consultation)}</div>
          <div className="row">
            <Link className="btn btn-ghost btn-sm" to="/consultations">Voir le détail</Link>
          </div>
        </div>
      ) : (
        <div className="card">
          <Empty emoji="📅" title="Aucun rendez-vous à venir">
            Prenez rendez-vous avec un psychothérapeute disponible, en quelques clics.
          </Empty>
          <Link className="btn btn-primary btn-block" to="/rendez-vous">Prendre rendez-vous</Link>
        </div>
      )}

      <div className="note-mobile" style={{ marginTop: 18 }}>
        <Icon name="video" size={20} />
        <div>
          <b>Les consultations vidéo se font sur mobile</b>
          Le jour du rendez-vous, ouvrez l'application SunuThérapie sur votre téléphone pour rejoindre l'appel.
        </div>
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <div className="card-h">
          <h2>Psychothérapeutes disponibles</h2>
          <Link to="/rendez-vous">Tout voir</Link>
        </div>
        {psys === null ? <Skeletons n={2} />
          : psys.length === 0 ? <Empty emoji="🕊️" title="Personne n'est disponible pour l'instant">Revenez un peu plus tard, les disponibilités sont mises à jour régulièrement.</Empty>
          : psys.slice(0, 4).map((p) => {
              const nom = p?.user?.name || p?.nom || 'Psychothérapeute';
              return (
                <div className="item" key={p.id}>
                  <div className="av">{initials(nom)}</div>
                  <div className="bd">
                    <div className="t">{nom}</div>
                    <div className="s">{p.specialite || p.structure || 'Psychothérapeute'}</div>
                  </div>
                  <div className="r"><span className="badge badge-ok">Disponible</span></div>
                </div>
              );
            })}
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <div className="card-h">
          <h2>Mes dernières consultations</h2>
          <Link to="/consultations">Tout voir</Link>
        </div>
        {consultations === null ? <Skeletons n={2} />
          : recentes.length === 0 ? <Empty emoji="💬" title="Rien pour le moment">Votre historique apparaîtra ici après votre première consultation.</Empty>
          : recentes.map((c) => (
              <div className="item" key={c.id}>
                <div className="av">{initials(nomPsy(c))}</div>
                <div className="bd">
                  <div className="t">{nomPsy(c)}</div>
                  <div className="s">{formatDate(c.date_consultation)}</div>
                </div>
                <div className="r">{statutBadge(c.statut)}</div>
              </div>
            ))}
      </div>
    </>
  );
}
