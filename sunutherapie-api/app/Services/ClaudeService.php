<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ClaudeService
{
    protected string $apiKey;
    protected string $endpoint = 'https://api.anthropic.com/v1/messages';
    protected string $model = 'claude-sonnet-4-6';
    protected string $version = '2023-06-01';

    public function __construct()
    {
        $this->apiKey = (string) config('services.anthropic.api_key');
    }

    /**
     * Envoie une requête à Claude et renvoie le texte de la réponse.
     *
     * @param  string  $systemPrompt  Le rôle / les consignes données à Claude
     * @param  string  $userMessage   Le message de l'utilisateur
     * @param  int     $maxTokens     Longueur max de la réponse
     */
    public function ask(string $systemPrompt, string $userMessage, int $maxTokens = 1024): array
    {
        if (empty($this->apiKey)) {
            return ['success' => false, 'error' => 'Clé API non configurée.'];
        }

        try {
            $response = Http::withHeaders([
                'x-api-key' => $this->apiKey,
                'anthropic-version' => $this->version,
                'content-type' => 'application/json',
            ])->timeout(60)->post($this->endpoint, [
                'model' => $this->model,
                'max_tokens' => $maxTokens,
                'system' => $systemPrompt,
                'messages' => [
                    ['role' => 'user', 'content' => $userMessage],
                ],
            ]);

            if ($response->failed()) {
                Log::error('Claude API error', ['status' => $response->status(), 'body' => $response->body()]);
                return ['success' => false, 'error' => 'Le service IA est momentanément indisponible.'];
            }

            $data = $response->json();
            $text = $data['content'][0]['text'] ?? '';

            return ['success' => true, 'text' => trim($text)];

        } catch (\Throwable $e) {
            Log::error('Claude API exception', ['message' => $e->getMessage()]);
            return ['success' => false, 'error' => 'Une erreur est survenue avec le service IA.'];
        }
    }
}
