<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Consultation;
use App\Models\Psychologue;
use App\Models\Etudiant;
use Illuminate\Http\Request;
use BoogieFromZk\AgoraToken\RtcTokenBuilder2;

class VideoCallController extends Controller
{
    public function generateToken(Request $request, $consultationId)
    {
        try {
            $consultation = Consultation::findOrFail($consultationId);
            $userId = $request->user()->id;

            $psychologue = Psychologue::find($consultation->psychologue_id);
            $psychologueUserId = $psychologue ? $psychologue->user_id : null;

            $etudiant = Etudiant::where('user_id', $userId)->first();

            $isPsy = (int) $psychologueUserId === (int) $userId;
            $isEtudiant = $etudiant && (int) $consultation->etudiant_id === (int) $etudiant->id;

            if (!$isPsy && !$isEtudiant) {
                return response()->json([
                    'success' => false,
                    'message' => 'Non autorisé'
                ], 403);
            }

            $appId = env('AGORA_APP_ID');
            $appCertificate = env('AGORA_APP_CERTIFICATE');

            $channelName = $consultation->agora_channel_name
                ?? 'sunu_' . $consultationId . '_' . time();

            if (!$consultation->agora_channel_name) {
                $consultation->update(['agora_channel_name' => $channelName]);
            }

            // Mode test sans certificate
            if (empty($appCertificate)) {
                return response()->json([
                    'success' => true,
                    'token' => null,
                    'channel_name' => $channelName,
                    'uid' => $userId,
                    'app_id' => $appId,
                    'is_moderator' => $isPsy,
                ]);
            }

            // Token Agora officiel
            $token = RtcTokenBuilder2::buildTokenWithUid(
                $appId,
                $appCertificate,
                $channelName,
                $userId,
                RtcTokenBuilder2::ROLE_PUBLISHER,
                7200
            );

            return response()->json([
                'success' => true,
                'token' => $token,
                'channel_name' => $channelName,
                'uid' => $userId,
                'app_id' => $appId,
                'is_moderator' => $isPsy,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur génération token Agora',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
