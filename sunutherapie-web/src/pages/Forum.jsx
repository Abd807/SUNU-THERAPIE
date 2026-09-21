import { useEffect, useState } from 'react';
import * as api from '../lib/api';
import { Icon, Skeletons, Empty, Modal, initials, formatDate } from '../components/ui';

export default function Forum() {
  const [posts, setPosts] = useState(null);
  const [erreur, setErreur] = useState(null);
  const [redaction, setRedaction] = useState(false);

  const charger = () => {
    api.getForum()
      .then(setPosts)
      .catch((e) => { setErreur(e.message); setPosts([]); });
  };

  useEffect(charger, []);

  return (
    <>
      <div className="page-head" style={{ display: 'flex', justifyContent: 'space-between',
                                          alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 className="serif">Forum</h1>
          <p>Un espace d'entraide entre étudiants. Vous pouvez publier anonymement.</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setRedaction(true)}>Publier</button>
      </div>

      {erreur ? <div className="alert alert-error">{erreur}</div> : null}

      {posts === null ? <Skeletons n={3} />
        : posts.length === 0 ? (
          <div className="card">
            <Empty emoji="💬" title="Le forum est encore vide">
              Lancez la première conversation. Parler, même anonymement, fait déjà du bien.
            </Empty>
          </div>
        ) : posts.map((p) => <Post key={p.id} post={p} onChange={charger} />)}

      {redaction ? (
        <Redaction onClose={() => setRedaction(false)}
                   onDone={() => { setRedaction(false); charger(); }} />
      ) : null}
    </>
  );
}

function Post({ post, onChange }) {
  const [commentaire, setCommentaire] = useState('');
  const [ouvrirComm, setOuvrirComm] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [likes, setLikes] = useState(post.likes || 0);
  const [likeEnCours, setLikeEnCours] = useState(false);

  const auteur = post.anonyme ? 'Anonyme' : (post.user?.name || 'Étudiant');
  const commentaires = post.comments || post.commentaires || [];

  const liker = async () => {
    if (likeEnCours) return;
    setLikeEnCours(true);
    setLikes((n) => n + 1);           // retour immédiat, on corrige si le serveur refuse
    try {
      await api.likerForum(post.id);
    } catch {
      setLikes((n) => Math.max(0, n - 1));
    } finally {
      setLikeEnCours(false);
    }
  };

  const commenter = async (e) => {
    e.preventDefault();
    if (!commentaire.trim()) return;
    setEnvoi(true);
    try {
      await api.commenterForum(post.id, commentaire.trim());
      setCommentaire('');
      onChange();
    } catch { /* le message d'erreur global suffit */ }
    finally { setEnvoi(false); }
  };

  return (
    <article className="post">
      <div className="post-h">
        <div className="av">{post.anonyme ? '?' : initials(auteur)}</div>
        <div>
          <div className="nm">{auteur}</div>
          <div className="dt">{formatDate(post.created_at)}</div>
        </div>
      </div>

      {post.titre ? (
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{post.titre}</div>
      ) : null}
      <div className="post-body">{post.contenu}</div>

      <div className="post-foot">
        <button onClick={liker}>
          <Icon name="heart" size={16} /> {likes}
        </button>
        <button onClick={() => setOuvrirComm((v) => !v)}>
          <Icon name="chat" size={16} /> {commentaires.length} réponse{commentaires.length > 1 ? 's' : ''}
        </button>
      </div>

      {ouvrirComm ? (
        <div>
          {commentaires.map((c) => (
            <div className="comment" key={c.id}>
              <div className="nm">{c.anonyme ? 'Anonyme' : (c.user?.name || 'Étudiant')}</div>
              <p>{c.contenu}</p>
            </div>
          ))}
          <form onSubmit={commenter} style={{ display: 'flex', gap: 8, marginTop: 11 }}>
            <input value={commentaire} onChange={(e) => setCommentaire(e.target.value)}
                   placeholder="Écrire une réponse…"
                   style={{ flex: 1, border: '1px solid var(--border)', borderRadius: 11, padding: '10px 13px' }} />
            <button className="btn btn-primary btn-sm" disabled={envoi || !commentaire.trim()}>Envoyer</button>
          </form>
        </div>
      ) : null}
    </article>
  );
}

function Redaction({ onClose, onDone }) {
  const [titre, setTitre] = useState('');
  const [contenu, setContenu] = useState('');
  const [anonyme, setAnonyme] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [envoi, setEnvoi] = useState(false);

  const publier = async (e) => {
    e.preventDefault();
    setErreur(null);
    setEnvoi(true);
    try {
      await api.publierForum({ titre: titre.trim(), contenu: contenu.trim(), anonyme });
      onDone();
    } catch (err) {
      setErreur(err.message);
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <Modal title="Publier un message" sub="Votre message sera visible par les autres étudiants." onClose={onClose}>
      <form onSubmit={publier}>
        {erreur ? <div className="alert alert-error">{erreur}</div> : null}

        <div className="field">
          <label htmlFor="ft">Titre</label>
          <input id="ft" required maxLength={255} value={titre} onChange={(e) => setTitre(e.target.value)} />
        </div>

        <div className="field">
          <label htmlFor="fc">Message</label>
          <textarea id="fc" required value={contenu} onChange={(e) => setContenu(e.target.value)}
                    style={{ minHeight: 130 }} />
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 14, cursor: 'pointer' }}>
          <input type="checkbox" checked={anonyme} onChange={(e) => setAnonyme(e.target.checked)}
                 style={{ width: 17, height: 17 }} />
          Publier anonymement
        </label>

        <div className="modal-actions">
          <button type="button" className="btn btn-outline btn-sm" onClick={onClose}>Annuler</button>
          <button className="btn btn-primary btn-sm" disabled={envoi}>
            {envoi ? 'Publication…' : 'Publier'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
