<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SunuThérapie - Maintenance</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #e8f5e9 0%, #f0f9f0 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .card {
      background: white;
      border-radius: 24px;
      padding: 48px 40px;
      max-width: 420px;
      width: 100%;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0,0,0,0.1);
    }
    .logo { font-size: 64px; margin-bottom: 16px; }
    .brand { font-size: 28px; font-weight: 800; color: #27ae60; margin-bottom: 8px; }
    .tagline { font-size: 14px; color: #888; margin-bottom: 40px; }
    .icon-container {
      width: 100px; height: 100px;
      background: linear-gradient(135deg, #27ae60, #2ecc71);
      border-radius: 24px;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 24px;
      box-shadow: 0 8px 24px rgba(39,174,96,0.3);
    }
    .apple-icon { font-size: 56px; }
    .title { font-size: 22px; font-weight: 700; color: #1a1a1a; margin-bottom: 12px; }
    .message { font-size: 15px; color: #666; line-height: 1.6; margin-bottom: 32px; }
    .badge {
      display: inline-flex; align-items: center; gap: 8px;
      background: #e8f5e9; color: #27ae60;
      padding: 10px 20px; border-radius: 50px;
      font-size: 14px; font-weight: 600; margin-bottom: 32px;
    }
    .pulse {
      width: 10px; height: 10px;
      background: #27ae60; border-radius: 50%;
      animation: pulse 1.5s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(0.8); }
    }
    .features {
      display: flex; flex-direction: column; gap: 12px;
      margin-bottom: 32px; text-align: left;
    }
    .feature {
      display: flex; align-items: center; gap: 12px;
      background: #f8f9fa; padding: 12px 16px; border-radius: 12px;
    }
    .feature-icon { font-size: 20px; }
    .feature-text { font-size: 13px; color: #555; font-weight: 500; }
    .footer { font-size: 12px; color: #bbb; }
    .footer span { color: #27ae60; font-weight: 600; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">🌿</div>
    <h1 class="brand">SunuThérapie</h1>
    <p class="tagline">Plateforme de santé mentale • 🇸🇳 Sénégal</p>

    <div class="icon-container">
      <span class="apple-icon"></span>
    </div>

    <h2 class="title">Mise à jour en cours</h2>
    <p class="message">
      Une nouvelle version de l'application est en cours de déploiement sur l'<strong>App Store iOS</strong>.
      Nous revenons très bientôt avec de nouvelles fonctionnalités.
    </p>

    <div class="badge">
      <div class="pulse"></div>
      Déploiement en cours...
    </div>

    <div class="features">
      <div class="feature">
        <span class="feature-icon">📹</span>
        <span class="feature-text">Consultations vidéo améliorées</span>
      </div>
      <div class="feature">
        <span class="feature-icon">🔒</span>
        <span class="feature-text">Sécurité renforcée</span>
      </div>
      <div class="feature">
        <span class="feature-icon">⚡</span>
        <span class="feature-text">Performances optimisées</span>
      </div>
    </div>

    <p class="footer">Merci pour votre patience • <span>SunuThérapie</span></p>
  </div>
</body>
</html>
