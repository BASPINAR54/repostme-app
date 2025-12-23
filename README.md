# RepostMe Mobile App

Application mobile React Native qui wrape le site repostme.com dans une WebView avec support des push notifications.

## Architecture

L'application est un **wrapper WebView** qui :
- Affiche votre site web repostme.com
- Gère les push notifications natives
- Communique avec le site web pour enregistrer les tokens de notification

## Flux utilisateur

### Premier lancement

1. **Onboarding** (3 slides)
   - Slide 1 : Présentation de RepostMe
   - Slide 2 : Explication des missions
   - Slide 3 : Activation des notifications

2. **Demande de permissions push**
   - Si accepté : Token stocké localement
   - Si refusé : Utilisateur peut activer plus tard

3. **WebView de repostme.com**
   - L'utilisateur navigue sur votre site
   - Quand il se connecte, son user_id est envoyé à l'app
   - L'app enregistre le push token en base

### Lancements suivants

- Direct vers la WebView de repostme.com
- L'onboarding est affiché une seule fois

## Communication WebView ↔ React Native

### Depuis le site web → App mobile

Quand l'utilisateur se connecte sur votre site, appelez :

```javascript
window.sendToNative('USER_LOGGED_IN', { userId: 'xxx' });
```

### Depuis l'app mobile → Site web

L'app notifie quand le push token est enregistré :

```javascript
{
  type: 'PUSH_TOKEN_REGISTERED',
  success: true
}
```

Voir `WEBVIEW_INTEGRATION.md` pour le guide complet d'intégration.

## Notifications push

### Configuration

Les notifications sont configurées dans `lib/pushNotifications.ts` :
- Demande de permissions iOS/Android
- Récupération du token Expo
- Enregistrement en base Supabase

### Edge Function

L'envoi de notifications se fait via l'edge function `send-push-notification` :

```javascript
// Envoyer une notification
await supabase.rpc('test_push_notification', {
  p_title: 'Nouvelle mission',
  p_body: 'Vous avez reçu une nouvelle mission de repost',
  p_data: { mission_id: '123' }
});
```

### Base de données

Table `user_push_tokens` :
- `user_id` : ID de l'utilisateur (doit correspondre à celui du site web)
- `push_token` : Token Expo pour envoyer les notifications
- `device_type` : 'ios' ou 'android'

## Développement

### Installation

```bash
npm install
```

### Lancement

```bash
npm run dev
```

### Build iOS/Android

```bash
# iOS
expo build:ios

# Android
expo build:android
```

## Structure des fichiers

```
app/
├── index.tsx           # Point d'entrée, vérifie l'onboarding
├── onboarding.tsx      # Carousel de 3 slides
├── webview.tsx         # WebView principale de repostme.com
├── login.tsx          # (Inutilisé, ancien écran de login natif)
└── notifications.tsx  # (Inutilisé, ancien écran de notifications natif)

lib/
├── pushNotifications.ts  # Gestion des permissions et tokens
└── supabase.ts          # Client Supabase

supabase/
├── migrations/          # Migrations de base de données
└── functions/
    └── send-push-notification/  # Edge function pour envoyer des notifications
```

## Configuration

### Variables d'environnement

Fichier `.env` :

```
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=xxx
```

### Info.plist (iOS)

Permissions requises :
- `NSUserNotificationsUsageDescription`

### AndroidManifest.xml (Android)

Permissions requises :
- `RECEIVE_BOOT_COMPLETED`
- `VIBRATE`

## Intégration sur votre site web

Voir le guide détaillé dans `WEBVIEW_INTEGRATION.md`.

Résumé rapide :

```javascript
// Dans votre code de connexion
if (typeof window.sendToNative !== 'undefined') {
  window.sendToNative('USER_LOGGED_IN', {
    userId: user.id  // ID Supabase de l'utilisateur
  });
}
```

## Déploiement

### TestFlight (iOS)

1. Build avec Expo :
   ```bash
   eas build --platform ios
   ```

2. Upload vers TestFlight via Transporter

3. Tester l'app sur TestFlight

### Google Play (Android)

1. Build avec Expo :
   ```bash
   eas build --platform android
   ```

2. Upload vers Google Play Console

## Debugging

### Logs React Native

```bash
# iOS
npx react-native log-ios

# Android
npx react-native log-android
```

### Logs WebView

Utilisez Safari Remote Debugging (iOS) ou Chrome DevTools (Android) pour voir les logs du site web dans la WebView.

## Notes importantes

1. L'**user_id** envoyé depuis le site web doit correspondre exactement à celui dans Supabase
2. Le push token est stocké localement tant que l'utilisateur ne se connecte pas
3. Les notifications fonctionnent uniquement sur device physique (pas sur simulateur)
4. Testez toujours sur TestFlight/Play Store avant production
