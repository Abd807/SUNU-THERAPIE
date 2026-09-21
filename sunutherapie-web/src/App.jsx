import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth';
import { Spinner } from './components/ui';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import RendezVous from './pages/RendezVous';
import Consultations from './pages/Consultations';
import Ressources from './pages/Ressources';
import Bibliotheque from './pages/Bibliotheque';
import Forum from './pages/Forum';
import Profil from './pages/Profil';
import PsyAccueil from './pages/psy/Accueil';
import PsyDemandes from './pages/psy/Demandes';
import PsyConsultations from './pages/psy/ConsultationsPsy';
import PsyDisponibilites from './pages/psy/Disponibilites';
import PsyRessources from './pages/psy/MesRessources';
import PsyNotes from './pages/psy/NotesPsy';

function Protege({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Spinner label="Chargement de votre espace…" />;
  if (!user) return <Navigate to="/connexion" replace state={{ from: location.pathname }} />;
  return children;
}

function Invite({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (user) return <Navigate to="/" replace />;
  return children;
}

// Les deux espaces partagent les mêmes URL : c'est le rôle qui décide de l'écran rendu.
function Espaces() {
  const { user } = useAuth();
  const psy = user?.role === 'psychologue';
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={psy ? <PsyAccueil /> : <Home />} />
        <Route path="consultations" element={psy ? <PsyConsultations /> : <Consultations />} />
        <Route path="ressources" element={psy ? <PsyRessources /> : <Ressources />} />
        <Route path="bibliotheque" element={<Bibliotheque />} />
        <Route path="profil" element={<Profil />} />

        {psy ? (
          <>
            <Route path="demandes" element={<PsyDemandes />} />
            <Route path="disponibilites" element={<PsyDisponibilites />} />
            <Route path="notes" element={<PsyNotes />} />
          </>
        ) : (
          <>
            <Route path="rendez-vous" element={<RendezVous />} />
            <Route path="forum" element={<Forum />} />
          </>
        )}

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/connexion" element={<Invite><Login /></Invite>} />
          <Route path="/inscription" element={<Invite><Register /></Invite>} />
          <Route path="/*" element={<Protege><Espaces /></Protege>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
