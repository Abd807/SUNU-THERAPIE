<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SunuThérapie — Santé mentale universitaire au Sénégal</title>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
    <style>
        :root {
            --teal: #0B6E6E;
            --teal-dark: #085050;
            --teal-light: #C8EEEE;
            --teal-pale: #F4FAFA;
            --white: #ffffff;
            --text: #1A202C;
            --text-muted: #4A5568;
            --border: rgba(11,110,110,0.12);
            --shadow: 0 8px 40px rgba(11,110,110,0.10);
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { font-family: 'DM Sans', sans-serif; background: #f7fbf8; color: var(--text); overflow-x: hidden; }

        /* NAV */
        nav {
            position: fixed; top: 0; left: 0; right: 0; z-index: 200;
            display: flex; justify-content: space-between; align-items: center;
            padding: 12px 60px;
            background: rgba(255,255,255,0.95);
            backdrop-filter: blur(16px);
            border-bottom: 1px solid var(--border);
            box-shadow: 0 2px 20px rgba(0,0,0,0.05);
        }
        .nav-brand { display: flex; align-items: center; gap: 12px; text-decoration: none; }
        .nav-logo { width: 44px; height: 44px; border-radius: 12px; object-fit: cover; }
        .nav-name { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 700; color: var(--teal); }
        .nav-links { display: flex; align-items: center; gap: 32px; list-style: none; }
        .nav-links a { color: var(--text-muted); text-decoration: none; font-size: 14px; font-weight: 500; transition: color 0.2s; }
        .nav-links a:hover { color: var(--teal); }
        .nav-dl { background: var(--teal); color: white !important; padding: 8px 18px; border-radius: 20px; font-weight: 600 !important; }
        .nav-dl:hover { background: var(--teal-dark) !important; }

        /* HERO */
        .hero {
            min-height: 100vh; display: flex; align-items: center;
            padding: 120px 60px 80px;
            background: linear-gradient(160deg, #ffffff 0%, #f0fafa 60%, #C8EEEE 100%);
            position: relative; overflow: hidden;
        }
        .hero-content { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
        .hero-logos { display: flex; align-items: center; gap: 20px; margin-bottom: 28px; }
        .hero-logo-item { display: flex; flex-direction: column; align-items: center; gap: 6px; }
        .hero-logo-img { width: 70px; height: 70px; border-radius: 18px; object-fit: cover; box-shadow: 0 4px 20px rgba(11,110,110,0.2); }
        .hero-logo-img.ucad { border-radius: 50%; }
        .hero-logo-label { font-size: 10px; color: var(--text-muted); font-weight: 600; }
        .hero-logo-x { font-size: 22px; color: rgba(11,110,110,0.3); font-weight: 300; }
        .hero-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(11,110,110,0.1); border: 1px solid rgba(11,110,110,0.2); color: var(--teal); padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: 600; margin-bottom: 20px; }
        .hero-title { font-family: 'Playfair Display', serif; font-size: 52px; font-weight: 700; line-height: 1.15; color: var(--text); margin-bottom: 20px; }
        .hero-title span { color: var(--teal); }
        .hero-desc { font-size: 17px; line-height: 1.8; color: var(--text-muted); margin-bottom: 36px; }
        .hero-actions { display: flex; gap: 16px; flex-wrap: wrap; }
        .btn-primary { display: inline-flex; align-items: center; gap: 10px; background: var(--teal); color: white; padding: 16px 32px; border-radius: 14px; text-decoration: none; font-size: 16px; font-weight: 600; box-shadow: 0 8px 30px rgba(11,110,110,0.35); transition: transform 0.2s; }
        .btn-primary:hover { transform: translateY(-2px); }
        .hero-phone { position: relative; display: flex; justify-content: center; }
        .phone-mockup { width: 280px; background: #1a1a2e; border-radius: 40px; padding: 12px; box-shadow: 0 30px 80px rgba(0,0,0,0.25); }
        .phone-screen { border-radius: 30px; overflow: hidden; }
        .phone-screen img { width: 100%; display: block; }

        /* STATS */
        .stats { background: white; padding: 50px 60px; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
        .stats-inner { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: repeat(4, 1fr); gap: 40px; text-align: center; }
        .stat-number { font-family: 'Playfair Display', serif; font-size: 42px; font-weight: 700; color: var(--teal); margin-bottom: 6px; }
        .stat-label { font-size: 14px; color: var(--text-muted); font-weight: 500; }

        /* FEATURES */
        .features { padding: 100px 60px; background: var(--teal-pale); }
        .section-label { text-align: center; font-size: 12px; font-weight: 700; letter-spacing: 2px; color: var(--teal); text-transform: uppercase; margin-bottom: 16px; }
        .section-title { text-align: center; font-family: 'Playfair Display', serif; font-size: 40px; font-weight: 700; color: var(--text); margin-bottom: 60px; }
        .features-grid { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
        .feature-card { background: white; padding: 36px 28px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border); transition: transform 0.2s; }
        .feature-card:hover { transform: translateY(-4px); }
        .feature-icon { width: 56px; height: 56px; border-radius: 16px; background: var(--teal-light); display: flex; align-items: center; justify-content: center; font-size: 26px; margin-bottom: 20px; }
        .feature-card h3 { font-size: 17px; font-weight: 700; color: var(--text); margin-bottom: 10px; }
        .feature-card p { font-size: 14px; color: var(--text-muted); line-height: 1.7; }

        /* SCREENSHOTS */
        .screenshots { padding: 100px 60px; background: white; overflow: hidden; }
        .screenshots-scroll { display: flex; gap: 24px; overflow-x: auto; padding: 20px 0 40px; scrollbar-width: none; max-width: 1100px; margin: 0 auto; }
        .screenshots-scroll::-webkit-scrollbar { display: none; }
        .screenshot-item { flex: 0 0 220px; }
        .screenshot-item img { width: 220px; border-radius: 24px; box-shadow: 0 20px 60px rgba(11,110,110,0.2); border: 3px solid var(--teal-light); }
        .screenshot-label { text-align: center; margin-top: 12px; font-size: 13px; color: var(--text-muted); font-weight: 500; }

        /* PARTENAIRES */
        .partners { padding: 80px 60px; background: var(--teal-pale); }
        .partners-grid { max-width: 900px; margin: 0 auto; display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; }
        .partner-card { background: white; border-radius: 20px; padding: 36px 28px; text-align: center; border: 1px solid var(--border); box-shadow: var(--shadow); transition: transform 0.2s; text-decoration: none; }
        .partner-card:hover { transform: translateY(-4px); }
        .partner-logo { height: 80px; object-fit: contain; margin-bottom: 16px; }
        .partner-name { font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 6px; }
        .partner-desc { font-size: 13px; color: var(--text-muted); line-height: 1.6; }
        .partner-link { display: inline-block; margin-top: 14px; font-size: 13px; color: var(--teal); font-weight: 600; }

        /* FOOTER */
        footer { background: var(--teal); color: rgba(255,255,255,0.7); padding: 50px 60px; }
        .footer-inner { max-width: 1100px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 24px; }
        .footer-brand { display: flex; align-items: center; gap: 12px; }
        .footer-logo { width: 38px; height: 38px; border-radius: 10px; object-fit: cover; opacity: 0.9; }
        .footer-name { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; color: white; }
        .footer-links { display: flex; gap: 32px; list-style: none; flex-wrap: wrap; }
        .footer-links a { color: rgba(255,255,255,0.6); text-decoration: none; font-size: 14px; transition: color 0.2s; }
        .footer-links a:hover { color: white; }
        .footer-admin { color: rgba(255,255,255,0.3) !important; font-size: 12px !important; }
        .footer-copy { font-size: 13px; width: 100%; text-align: center; margin-top: 16px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 16px; }

        @media (max-width: 900px) {
            nav { padding: 12px 16px; }
            .nav-links { display: none; }
            .hero { padding: 100px 24px 60px; }
            .hero-content { grid-template-columns: 1fr; gap: 40px; }
            .hero-title { font-size: 36px; }
            .stats { padding: 40px 24px; }
            .stats-inner { grid-template-columns: repeat(2,1fr); }
            .features { padding: 60px 24px; }
            .features-grid { grid-template-columns: repeat(2,1fr); }
            .screenshots { padding: 60px 24px; }
            .partners { padding: 60px 24px; }
            .partners-grid { grid-template-columns: 1fr; }
            footer { padding: 40px 24px; }
            .footer-inner { flex-direction: column; text-align: center; }
        }
    </style>
</head>
<body>

<!-- NAV -->
<nav>
    <a href="/" class="nav-brand">
        <img src="/images/logo.jpeg" alt="SunuThérapie" class="nav-logo">
        <span class="nav-name">SunuThérapie</span>
    </a>
    <ul class="nav-links">
        <li><a href="#fonctionnalites">Fonctionnalités</a></li>
        <li><a href="#screenshots">L'application</a></li>
        <li><a href="#partenaires">Partenaires</a></li>
        <li><a href="mailto:kaneabdourahmane46@gmail.com">Contact</a></li>
        <li><a href="#telecharger" class="nav-dl">Télécharger</a></li>
    </ul>
</nav>

<!-- HERO -->
<section class="hero">
    <div class="hero-content">
        <div>
            <div class="hero-logos">
                <div class="hero-logo-item">
                    <img src="/images/logo.jpeg" alt="SunuThérapie" class="hero-logo-img">
                    <span class="hero-logo-label">SunuThérapie</span>
                </div>
                <span class="hero-logo-x">×</span>
                <div class="hero-logo-item">
                    <img src="/images/ucad.png" alt="UCAD" class="hero-logo-img ucad">
                    <span class="hero-logo-label">UCAD</span>
                </div>
            </div>
            <div class="hero-badge">Pour les étudiants du Sénégal</div>
            <h1 class="hero-title">
                Votre bien-être mental,<br>
                <span>notre priorité</span>
            </h1>
            <p class="hero-desc">
                SunuThérapie connecte les étudiants sénégalais avec des psychothérapeutes qualifiés pour des consultations vidéo sécurisées, confidentielles et accessibles partout.
            </p>
            <div class="hero-actions" id="telecharger">
                <a href="https://apps.apple.com/app/sunutherapie/id6762513116" class="btn-primary">Télécharger sur iOS</a>
            </div>
        </div>
        <div class="hero-phone">
            <div class="phone-mockup">
                <div class="phone-screen">
                    <img src="/images/screen1.png" alt="SunuThérapie App">
                </div>
            </div>
        </div>
    </div>
</section>

<!-- STATS -->
<section class="stats">
    <div class="stats-inner">
        <div><div class="stat-number">88</div><div class="stat-label">Étudiants inscrits</div></div>
        <div><div class="stat-number">17</div><div class="stat-label">Psychothérapeutes</div></div>
        <div><div class="stat-number">100</div><div class="stat-label">Consultations réalisées</div></div>
        <div><div class="stat-number">6+</div><div class="stat-label">Universités représentées</div></div>
    </div>
</section>

<!-- FEATURES -->
<section class="features" id="fonctionnalites">
    <p class="section-label">Fonctionnalités</p>
    <h2 class="section-title">Tout ce dont vous avez besoin</h2>
    <div class="features-grid">
        <div class="feature-card">
            <div class="feature-icon">📅</div>
            <h3>Prise de RDV</h3>
            <p>Réservez une consultation avec votre psychothérapeute en quelques clics.</p>
        </div>
        <div class="feature-card">
            <div class="feature-icon">🎥</div>
            <h3>Vidéo sécurisée</h3>
            <p>Consultations en visioconférence confidentielles depuis votre smartphone.</p>
        </div>
        <div class="feature-card">
            <div class="feature-icon">💬</div>
            <h3>Forum étudiant</h3>
            <p>Échangez avec d'autres étudiants dans un espace bienveillant et anonyme.</p>
        </div>
        <div class="feature-card">
            <div class="feature-icon">📚</div>
            <h3>Ressources</h3>
            <p>Accédez aux ressources partagées par votre psychothérapeute.</p>
        </div>
    </div>
</section>

<!-- SCREENSHOTS -->
<section class="screenshots" id="screenshots">
    <p class="section-label">L'application</p>
    <h2 class="section-title">Découvrez SunuThérapie</h2>
    <div class="screenshots-scroll">
        <div class="screenshot-item">
            <img src="/images/screen1.png" alt="Accueil étudiant">
            <p class="screenshot-label">Accueil étudiant</p>
        </div>
        <div class="screenshot-item">
            <img src="/images/screen2.png" alt="Forum de discussion">
            <p class="screenshot-label">Forum de discussion</p>
        </div>
        <div class="screenshot-item">
            <img src="/images/screen3.png" alt="Espace psychothérapeute">
            <p class="screenshot-label">Espace psychothérapeute</p>
        </div>
        <div class="screenshot-item">
            <img src="/images/screen4.png" alt="Gestion des consultations">
            <p class="screenshot-label">Gestion des consultations</p>
        </div>
    </div>
</section>

<!-- PARTENAIRES -->
<section class="partners" id="partenaires">
    <p class="section-label">Partenaires</p>
    <h2 class="section-title">Ils nous font confiance</h2>
    <div class="partners-grid">
        <a href="https://amref.org" target="_blank" class="partner-card">
            <img src="/images/amref.png" alt="AMREF" class="partner-logo">
            <div class="partner-name">AMREF Health Africa</div>
            <p class="partner-desc">Partenaire santé — financement et accompagnement du projet SunuThérapie.</p>
            <span class="partner-link">amref.org →</span>
        </a>
        <a href="https://ucad.edu.sn" target="_blank" class="partner-card">
            <img src="/images/ucad.png" alt="UCAD" class="partner-logo">
            <div class="partner-name">UCAD</div>
            <p class="partner-desc">Université Cheikh Anta Diop de Dakar — partenaire académique principal.</p>
            <span class="partner-link">ucad.edu.sn →</span>
        </a>
        <a href="https://mastercardfdn.org" target="_blank" class="partner-card">
            <img src="/images/mastercard.png" alt="Mastercard Foundation" class="partner-logo">
            <div class="partner-name">Fondation Mastercard</div>
            <p class="partner-desc">Financement et soutien au développement de SunuThérapie.</p>
            <span class="partner-link">mastercardfdn.org →</span>
        </a>
    </div>
</section>

<!-- FOOTER -->
<footer>
    <div class="footer-inner">
        <div class="footer-brand">
            <img src="/images/logo.jpeg" alt="Logo" class="footer-logo">
            <span class="footer-name">SunuThérapie</span>
        </div>
        <ul class="footer-links">
            <li><a href="#fonctionnalites">Fonctionnalités</a></li>
            <li><a href="#screenshots">L'application</a></li>
            <li><a href="#partenaires">Partenaires</a></li>
            <li><a href="mailto:kaneabdourahmane46@gmail.com">Contact</a></li>
            <li><a href="/admin" class="footer-admin">Admin</a></li>
        </ul>
        <p class="footer-copy">© 2026 SunuThérapie — GIE FUAM. Tous droits réservés.</p>
    </div>
</footer>

</body>
</html>
