import { fichierUrl } from '../lib/api';
import { Icon, Empty } from './ui';

// Extrait l'identifiant d'une URL YouTube, quelle que soit sa forme.
function youtubeId(url = '') {
  const m = String(url).match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  );
  return m ? m[1] : null;
}

export default function Lecteur({ item, onBack }) {
  const url = fichierUrl(item);
  const type = item.type || (url && /\.pdf($|\?)/i.test(url) ? 'pdf' : 'lien_web');

  return (
    <>
      <div className="pdf-head">
        <button className="btn btn-outline btn-sm" onClick={onBack}>
          <Icon name="back" size={16} /> Retour
        </button>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.25 }}>{item.titre}</div>
          {item.auteur ? <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>{item.auteur}</div> : null}
        </div>
      </div>

      {item.description && type === 'note' ? null : item.description ? (
        <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 14 }}>{item.description}</p>
      ) : null}

      <Contenu type={type} url={url} item={item} />

      {url && type !== 'note' ? (
        <p style={{ marginTop: 14 }}>
          <a className="btn btn-ghost btn-sm" href={url} target="_blank" rel="noreferrer">
            Ouvrir dans un nouvel onglet <Icon name="external" size={15} />
          </a>
        </p>
      ) : null}
    </>
  );
}

function Contenu({ type, url, item }) {
  if (type === 'note') {
    return (
      <div className="card" style={{ whiteSpace: 'pre-wrap', fontSize: 15, lineHeight: 1.7 }}>
        {item.description || item.contenu || 'Cette note est vide.'}
      </div>
    );
  }

  if (!url) {
    return (
      <div className="card">
        <Empty emoji="🔍" title="Contenu indisponible">
          Ce document n'a pas de fichier associé. Signalez-le à votre psychothérapeute.
        </Empty>
      </div>
    );
  }

  if (type === 'lien_youtube') {
    const id = youtubeId(url);
    if (!id) return <LienBrut url={url} />;
    return (
      <div style={{ position: 'relative', paddingTop: '56.25%', borderRadius: 16, overflow: 'hidden' }}>
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}`}
          title={item.titre}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
        />
      </div>
    );
  }

  if (type === 'video_upload') {
    return <video src={url} controls style={{ width: '100%', borderRadius: 16, background: '#000' }} />;
  }

  if (type === 'audio') {
    return (
      <div className="card">
        <audio src={url} controls style={{ width: '100%' }} />
      </div>
    );
  }

  if (type === 'pdf') {
    return <iframe className="pdf-frame" src={url} title={item.titre} />;
  }

  return <LienBrut url={url} />;
}

const LienBrut = ({ url }) => (
  <div className="card">
    <Empty emoji="🔗" title="Ressource externe">
      Ce contenu est hébergé ailleurs. Ouvrez-le dans un nouvel onglet pour le consulter.
    </Empty>
    <a className="btn btn-primary btn-block" href={url} target="_blank" rel="noreferrer">Ouvrir le lien</a>
  </div>
);
