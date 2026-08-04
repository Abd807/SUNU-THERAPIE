<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ExpoPushService
{
    // Envoi à un seul token
    public function send($token, string $title, string $body, array $data = []): void
    {
        $this->sendMany([$token], $title, $body, $data);
    }

    // Envoi à plusieurs tokens
    public function sendMany(array $tokens, string $title, string $body, array $data = []): void
    {
        $tokens = array_values(array_filter($tokens, function ($t) {
            return !empty($t) && str_starts_with($t, 'ExponentPushToken');
        }));

        if (empty($tokens)) {
            return;
        }

        try {
            $messages = array_map(function ($t) use ($title, $body, $data) {
                return [
                    'to' => $t,
                    'title' => $title,
                    'body' => $body,
                    'sound' => 'default',
                    'priority' => 'high',
                    'data' => $data,
                ];
            }, $tokens);

            Http::acceptJson()
                ->withHeaders(['Content-Type' => 'application/json'])
                ->post('https://exp.host/--/api/v2/push/send', $messages);
        } catch (\Exception $e) {
            Log::error('ExpoPushService: ' . $e->getMessage());
        }
    }
}
