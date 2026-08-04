import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

// Identifiant du projet EAS (app.json > extra.eas.projectId)
const PROJECT_ID = '3a7fd94e-9cf9-413d-a2ae-21c21e8b7741';

// Affichage des notifications quand l'app est au premier plan
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Demande la permission et renvoie le token push Expo (ou null).
export async function registerForPushNotificationsAsync() {
  // Le push distant ne fonctionne que sur un appareil physique (pas le simulateur).
  if (!Device.isDevice) return null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Général',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') return null;

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId: PROJECT_ID });
    return tokenData.data; // ex: ExponentPushToken[xxxxxxxx]
  } catch (e) {
    console.log('Push token error:', e);
    return null;
  }
}
