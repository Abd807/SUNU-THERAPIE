import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, Platform,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

const IS_SIMULATOR = Platform.OS === 'ios' && !Platform.isPad && __DEV__;

let createAgoraRtcEngine, ChannelProfileType, ClientRoleType, VideoSourceType, RtcSurfaceView;

if (!IS_SIMULATOR) {
  try {
    const Agora = require('react-native-agora');
    createAgoraRtcEngine = Agora.createAgoraRtcEngine;
    ChannelProfileType = Agora.ChannelProfileType;
    ClientRoleType = Agora.ClientRoleType;
    VideoSourceType = Agora.VideoSourceType;
    RtcSurfaceView = Agora.RtcSurfaceView;
  } catch (e) {
    console.log('Agora non disponible:', e);
  }
}

const AGORA_APP_ID = '30038ff84c324c059bf46fa992452e2b';

export default function VideoCallScreen({ route, navigation }) {
  const { consultationId, channelName, token: agoraToken, uid = 0 } = route?.params || {};
  const { token } = useAuth();

  const agoraEngineRef = useRef(null);
  const [isJoined, setIsJoined] = useState(false);
  const [remoteUid, setRemoteUid] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(true);
  const [loading, setLoading] = useState(true);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (IS_SIMULATOR) {
      setLoading(false);
      return;
    }
    setupAgora();
    return () => cleanup();
  }, []);

  useEffect(() => {
    let interval;
    if (isJoined) {
      interval = setInterval(() => setDuration(d => d + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isJoined]);

  const setupAgora = async () => {
    try {
      if (!createAgoraRtcEngine) {
        Alert.alert('Erreur', 'Module vidéo non disponible');
        setLoading(false);
        return;
      }

      const engine = createAgoraRtcEngine();
      agoraEngineRef.current = engine;

      engine.initialize({
        appId: AGORA_APP_ID,
        channelProfile: ChannelProfileType.ChannelProfileCommunication,
      });

      engine.registerEventHandler({
        onJoinChannelSuccess: () => {
          setIsJoined(true);
          setLoading(false);
        },
        onUserJoined: (connection, uid) => setRemoteUid(uid),
        onUserOffline: () => setRemoteUid(null),
        onError: (err) => {
          console.error('Agora error:', err);
          setLoading(false);
        },
      });

      engine.enableVideo();
      engine.startPreview();
      engine.setEnableSpeakerphone(true);

      await engine.joinChannel(agoraToken || null, channelName || `consultation_${consultationId}`, uid, {
        clientRoleType: ClientRoleType.ClientRoleBroadcaster,
      });

    } catch (error) {
      console.error('Setup Agora error:', error);
      Alert.alert('Erreur', 'Impossible de démarrer l\'appel vidéo');
      setLoading(false);
    }
  };

  const cleanup = () => {
    if (agoraEngineRef.current) {
      agoraEngineRef.current.leaveChannel();
      agoraEngineRef.current.release();
    }
  };

  const toggleMute = () => {
    agoraEngineRef.current?.muteLocalAudioStream(!isMuted);
    setIsMuted(!isMuted);
  };

  const toggleCamera = () => {
    agoraEngineRef.current?.muteLocalVideoStream(!isCameraOff);
    setIsCameraOff(!isCameraOff);
  };

  const toggleSpeaker = () => {
    agoraEngineRef.current?.setEnableSpeakerphone(!isSpeaker);
    setIsSpeaker(!isSpeaker);
  };

  const switchCamera = () => {
    agoraEngineRef.current?.switchCamera();
  };

  const endCall = () => {
    Alert.alert('Terminer l\'appel', 'Voulez-vous terminer la consultation ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Terminer', style: 'destructive', onPress: () => {
          cleanup();
          navigation.goBack();
        }
      },
    ]);
  };

  const formatDuration = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Simulateur
  if (IS_SIMULATOR) {
    return (
      <View style={styles.simulatorContainer}>
        <Text style={styles.simulatorIcon}>📵</Text>
        <Text style={styles.simulatorTitle}>Appel Vidéo</Text>
        <Text style={styles.simulatorText}>Non disponible sur simulateur</Text>
        <Text style={styles.simulatorSub}>Testez sur un appareil réel</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>← Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Loading
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={styles.loadingText}>Connexion en cours...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* Vidéo distante */}
      <View style={styles.remoteVideo}>
        {remoteUid && RtcSurfaceView ? (
          <RtcSurfaceView
            style={StyleSheet.absoluteFill}
            canvas={{ uid: remoteUid, sourceType: VideoSourceType.VideoSourceRemote }}
          />
        ) : (
          <View style={styles.waitingContainer}>
            <Text style={styles.waitingIcon}>👨‍⚕️</Text>
            <Text style={styles.waitingText}>
              {isJoined ? 'En attente du participant...' : 'Connexion...'}
            </Text>
          </View>
        )}
      </View>

      {/* Vidéo locale */}
      {!isCameraOff && RtcSurfaceView && (
        <View style={styles.localVideo}>
          <RtcSurfaceView
            style={StyleSheet.absoluteFill}
            canvas={{ uid: 0, sourceType: VideoSourceType.VideoSourceCamera }}
          />
        </View>
      )}

      {/* Header */}
      <View style={styles.callHeader}>
        <Text style={styles.callTitle}>Consultation en cours</Text>
        <Text style={styles.callDuration}>{formatDuration(duration)}</Text>
      </View>

      {/* Contrôles */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlBtn, isMuted && styles.controlBtnOff]}
          onPress={toggleMute}
        >
          <Text style={styles.controlIcon}>{isMuted ? '🔇' : '🎤'}</Text>
          <Text style={styles.controlLabel}>{isMuted ? 'Muet' : 'Micro'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlBtn, isCameraOff && styles.controlBtnOff]}
          onPress={toggleCamera}
        >
          <Text style={styles.controlIcon}>{isCameraOff ? '📵' : '📷'}</Text>
          <Text style={styles.controlLabel}>{isCameraOff ? 'Caméra off' : 'Caméra'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.endCallBtn} onPress={endCall}>
          <Text style={styles.endCallIcon}>📵</Text>
          <Text style={styles.endCallLabel}>Terminer</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlBtn} onPress={toggleSpeaker}>
          <Text style={styles.controlIcon}>{isSpeaker ? '🔊' : '🔈'}</Text>
          <Text style={styles.controlLabel}>Audio</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlBtn} onPress={switchCamera}>
          <Text style={styles.controlIcon}>🔄</Text>
          <Text style={styles.controlLabel}>Retourner</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1A2E' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1A1A2E' },
  loadingText: { color: '#FFFFFF', marginTop: 16, fontSize: 16 },
  simulatorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1A1A2E' },
  simulatorIcon: { fontSize: 60, marginBottom: 16 },
  simulatorTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 8 },
  simulatorText: { fontSize: 16, color: '#C8EEEE', marginBottom: 4 },
  simulatorSub: { fontSize: 13, color: '#888', marginBottom: 30 },
  backBtn: { backgroundColor: '#0B6E6E', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 20 },
  backBtnText: { color: '#FFFFFF', fontWeight: 'bold' },
  remoteVideo: { flex: 1 },
  waitingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1A1A2E' },
  waitingIcon: { fontSize: 60, marginBottom: 16 },
  waitingText: { color: '#C8EEEE', fontSize: 16 },
  localVideo: { position: 'absolute', top: 60, right: 16, width: 100, height: 150, borderRadius: 12, overflow: 'hidden', borderWidth: 2, borderColor: '#0B6E6E' },
  callHeader: { position: 'absolute', top: 0, left: 0, right: 0, padding: 20, alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' },
  callTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  callDuration: { color: '#C8EEEE', fontSize: 14, marginTop: 4 },
  controls: { position: 'absolute', bottom: 40, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 16, paddingHorizontal: 20 },
  controlBtn: { alignItems: 'center', width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center' },
  controlBtnOff: { backgroundColor: 'rgba(192,57,43,0.7)' },
  controlIcon: { fontSize: 22 },
  controlLabel: { color: '#FFFFFF', fontSize: 10, marginTop: 2 },
  endCallBtn: { alignItems: 'center', width: 68, height: 68, borderRadius: 34, backgroundColor: '#C0392B', justifyContent: 'center' },
  endCallIcon: { fontSize: 28 },
  endCallLabel: { color: '#FFFFFF', fontSize: 10, marginTop: 2 },
});
