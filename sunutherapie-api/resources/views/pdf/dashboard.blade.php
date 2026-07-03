<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Rapport SunuThérapie</title>
    <style>
        body { font-family: Arial, sans-serif; color: #333; margin: 30px; }
        h1 { color: #0B6E6E; text-align: center; font-size: 22px; }
        h2 { color: #138A8A; font-size: 15px; border-bottom: 2px solid #0B6E6E; padding-bottom: 5px; margin-top: 25px; }
        .date { text-align: center; color: #888; font-size: 12px; margin-bottom: 20px; }
        .grid { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 10px; }
        .card { background: #f4fafa; border: 1px solid #C8EEEE; border-radius: 8px; padding: 12px 20px; min-width: 150px; text-align: center; }
        .card .label { font-size: 11px; color: #666; margin-bottom: 4px; }
        .card .value { font-size: 28px; font-weight: bold; color: #0B6E6E; }
        .warning { color: #E8813A; }
        .success { color: #27AE60; }
        .danger { color: #C0392B; }
        .footer { text-align: center; margin-top: 40px; font-size: 11px; color: #aaa; }
    </style>
</head>
<body>

<h1>🌿 SunuThérapie — Rapport Statistique</h1>
<p class="date">Généré le {{ $date_export }}</p>

<h2>👨‍🎓 Étudiants</h2>
<div class="grid">
    <div class="card">
        <div class="label">Total inscrits</div>
        <div class="value">{{ $total_etudiants }}</div>
    </div>
    <div class="card">
        <div class="label">Avec psy référent</div>
        <div class="value success">{{ $etudiants_avec_psy }}</div>
    </div>
    <div class="card">
        <div class="label">Sans psy référent</div>
        <div class="value warning">{{ $etudiants_sans_psy }}</div>
    </div>
</div>

<h2>👨‍⚕️ Psychothérapeutes</h2>
<div class="grid">
    <div class="card">
        <div class="label">Total</div>
        <div class="value">{{ $total_psy }}</div>
    </div>
    <div class="card">
        <div class="label">Disponibles</div>
        <div class="value success">{{ $psy_disponibles }}</div>
    </div>
    <div class="card">
        <div class="label">Urgences</div>
        <div class="value warning">{{ $psy_urgence }}</div>
    </div>
</div>

<h2>📅 Consultations</h2>
<div class="grid">
    <div class="card">
        <div class="label">Total</div>
        <div class="value">{{ $total_consultations }}</div>
    </div>
    <div class="card">
        <div class="label">En attente</div>
        <div class="value warning">{{ $en_attente }}</div>
    </div>
    <div class="card">
        <div class="label">En cours</div>
        <div class="value">{{ $en_cours }}</div>
    </div>
    <div class="card">
        <div class="label">Terminées</div>
        <div class="value success">{{ $terminees }}</div>
    </div>
    <div class="card">
        <div class="label">Refusées</div>
        <div class="value danger">{{ $refusees }}</div>
    </div>
</div>

<h2>📚 Ressources</h2>
<div class="grid">
    <div class="card">
        <div class="label">Total</div>
        <div class="value">{{ $total_ressources }}</div>
    </div>
    <div class="card">
        <div class="label">En modération</div>
        <div class="value warning">{{ $ressources_en_attente }}</div>
    </div>
    <div class="card">
        <div class="label">Publiées</div>
        <div class="value success">{{ $ressources_actives }}</div>
    </div>
</div>

<h2>🔄 Transferts & Sponsors</h2>
<div class="grid">
    <div class="card">
        <div class="label">Transferts en attente</div>
        <div class="value warning">{{ $transferts_en_attente }}</div>
    </div>
    <div class="card">
        <div class="label">Sponsors actifs</div>
        <div class="value success">{{ $total_sponsors }}</div>
    </div>
</div>

<div class="footer">
    SunuThérapie — Plateforme de santé mentale universitaire<br>
    Financé par AMREF Health Africa & Fondation Mastercard
</div>

</body>
</html>
