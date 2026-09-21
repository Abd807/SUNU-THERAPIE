import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { Icon, Skeletons, Empty, initials, formatDate, statutBadge } from '../../components/ui';

export default function Accueil() {
  const { user } = useAuth();
  const [demandes, setDemandes] = useState(null);
  const [consultations, setConsultations] = useState(null);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    let annule = false;
    Promise.all([
      api.getDemandesEnAttente().catch(() => []),
      api.getConsultationsPsy().catch(() => []),
    ]).then(([d, c]) => {
      if (annule) return;
      setDemandes(d);
      setConsultations(c);
    }).catch((e) => { if (!annule) setErreur(e.message); });
    return () => { annule = true; };
  }, []);

  const prenom = (user?.name || '').replace(/^Dr\.?\s*/i, '').split(' ')[0] || '';
  const nomEtudiant = (c) => c?.etudiant?.user?.name || c?.etudiant?.nom || 'Étudiant';

  const aVenir = (consultations || [])
    .filter((c) => ['acceptee', 'en_cours'].includes(c.statut)
      && new Date(String(c.date_consultation).replace(' ', 'T')) >= new Date(Date.now() - 36e5))
    .sort((a, b) => new Date(a.date_consultation) - new Date(b.date_consultation));

  const Stat = ({ n, label, to }) => (
    <Link className="card" to={to} style={{ textAlign: 'center' }}>
      <div className="serif" style={{ fontSize: 34, color: 'var(--primary)', lineHeight: 1 }}>{n}</div>
      <div style={{ fontSize: 13.5, fontWeight: 600, marginTop: 8 }}>{label}</div>
    </Link>
  );

  return (
    <>
      <div className="page-head">
        <h1 className="serif">Bonjour Dr {prenom} 👋</h1>
        <p>Vos demandes et vos rendez-vous du moment.</p>
      </div>

      {erreur ? <div className="alert alert-error">{erreur}</div> : null}

      <div className="grid grid-3">
        <Stat n={demandes === null ? '…' : demandes.length} label="Demandes en attente" to="/demandes" />
        <Stat n={aVenir.length || 0} label="Consultations à venir" to="/consultations" />
        <Stat n={consultations === null ? '…' : consultations.filter((c) => c.statut === 'terminee').length}
              label="Consultations terminées" to="/consultations" />
      </div>

      <div className="note-mobile" style={{ marginTop: 18 }}>
        <Icon name="video" size={20} />
        <div>
          <b>Les appels se font sur mobile</b>
          Cet espace web sert à gérer vos demandes, vos disponibilités, vos notes et vos ressources. L'appel vidéo se lance depuis l'application SunuThérapie.
        </div>
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <div className="card-h">
          <h2>Demandes en attente</h2>
          <Link to="/demandes">Tout voir</Link>
        </div>
        {demandes === null ? <Skeletons n={2} />
          : demandes.length === 0 ? <Empty emoji="✅" title="Aucune demande en attente">Vous êtes à jour.</Empty>
          : demandes.slice(0, 4).map((c) => (
              <div className="item" key={c.id}>
                <div className="av">{initials(nomEtudiant(c))}</div>
                <div className="bd">
                  <div className="t">{nomEtudiant(c)}</div>
                  <div className="s">{formatDate(c.date_consultation)}</div>
                </div>
                <div className="r"><span className="badge badge-wait">À traiter</span></div>
              </div>
            ))}
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <div className="card-h">
          <h2>Prochaines consultations</h2>
          <Link to="/consultations">Tout voir</Link>
        </div>
        {consultations === null ? <Skeletons n={2} />
          : aVenir.length === 0 ? <Empty emoji="📅" title="Rien de prévu">Vos prochains rendez-vous acceptés apparaîtront ici.</Empty>
          : aVenir.slice(0, 4).map((c) => (
              <div className="item" key={c.id}>
                <div className="av">{initials(nomEtudiant(c))}</div>
                <div className="bd">
                  <div className="t">{nomEtudiant(c)}</div>
                  <div className="s">{formatDate(c.date_consultation)}</div>
                </div>
                <div className="r">{statutBadge(c.statut)}</div>
              </div>
            ))}
      </div>
    </>
  );
}
