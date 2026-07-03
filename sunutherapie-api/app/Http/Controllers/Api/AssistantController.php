<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ClaudeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AssistantController extends Controller
{
    // Mots-clés de détresse grave → on déclenche le protocole de crise
    protected array $crisisKeywords = [
        'suicide', 'me tuer', 'mourir', 'plus envie de vivre', 'en finir',
        'me faire du mal', 'automutilation', 'disparaître', 'idées noires',
        'plus la force', 'à quoi bon vivre',
    ];

    protected function emergencyResources(): string
    {
        return "Si tu es en danger immédiat ou en grande souffrance, parle à quelqu'un maintenant :\n"
            . "• Centre de Guidance Infantile et Familiale : 33 889 38 00 (24h/24, 7j/7)\n"
            . "• Unité de Santé Mentale – Hôpital de Fann : 33 825 50 22 (lun-ven, 8h-18h)\n"
            . "• SAMU : 15 (urgence vitale)\n"
            . "Tu peux aussi prendre rendez-vous avec un psychologue de SunuThérapie, qui est là pour toi.";
    }

    public function chat(Request $request, ClaudeService $claude): JsonResponse
    {
        $data = $request->validate([
            'message' => ['required', 'string', 'max:2000'],
        ]);

        $message = $data['message'];

        // 1. Détection de crise AVANT tout appel IA
        $lower = mb_strtolower($message);
        foreach ($this->crisisKeywords as $kw) {
            if (str_contains($lower, $kw)) {
                return response()->json([
                    'success' => true,
                    'crisis' => true,
                    'reply' => "Je vois que tu traverses un moment très difficile, et je veux que tu saches "
                        . "que tu n'es pas seul. Ce que tu ressens compte.\n\n"
                        . $this->emergencyResources(),
                ]);
            }
        }

        // 2. Sinon, on appelle Claude avec un rôle strict d'orientation
        $system = <<<PROMPT
Tu es l'assistant d'accueil de SunuThérapie, une plateforme sénégalaise de soutien psychologique pour étudiants.

TON RÔLE :
- Accueillir l'étudiant avec chaleur, bienveillance et sans jugement.
- L'aider à mettre des mots sur ce qu'il ressent.
- L'encourager doucement à prendre rendez-vous avec un psychologue de la plateforme.
- Suggérer de consulter les ressources de bien-être disponibles dans l'application.

CE QUE TU NE FAIS JAMAIS :
- Tu ne poses aucun diagnostic médical ou psychologique.
- Tu ne fais pas de thérapie et ne remplaces jamais un psychologue.
- Tu ne donnes pas de conseil clinique.

STYLE :
- Réponds en français simple et chaleureux, avec des phrases courtes.
- Reste humble : tu orientes, tu ne soignes pas.
- Maximum 4-5 phrases.
- N'utilise JAMAIS de formatage Markdown (pas de **, pas de #, pas de tirets de liste). Écris en texte simple, comme un message.
PROMPT;

        $result = $claude->ask($system, $message, 600);

        if (! $result['success']) {
            return response()->json([
                'success' => false,
                'reply' => "Je ne peux pas répondre pour le moment. Tu peux contacter directement un psychologue de la plateforme.",
            ], 503);
        }

        return response()->json([
            'success' => true,
            'crisis' => false,
            'reply' => $result['text'],
        ]);
    }
}
