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

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/connexion" element={<Invite><Login /></Invite>} />
          <Route path="/inscription" element={<Invite><Register /></Invite>} />

          <Route element={<Protege><Layout /></Protege>}>
            <Route index element={<Home />} />
            <Route path="rendez-vous" element={<RendezVous />} />
            <Route path="consultations" element={<Consultations />} />
            <Route path="ressources" element={<Ressources />} />
            <Route path="bibliotheque" element={<Bibliotheque />} />
            <Route path="forum" element={<Forum />} />
            <Route path="profil" element={<Profil />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
