# Guide d'intégration WebView ↔ React Native

Ce guide explique comment intégrer la communication entre votre site web (repostme.com) et l'application mobile React Native.

## Fonctionnement

L'application mobile charge votre site web dans une WebView et communique avec lui via des messages JavaScript.

## 1. Détecter l'environnement mobile

Dans votre site web, ajoutez ce code pour détecter si vous êtes dans l'app mobile :

```javascript
// Vérifier si on est dans l'app React Native
const isReactNativeApp = typeof window.ReactNativeWebView !== 'undefined';

if (isReactNativeApp) {
  console.log('App mobile détectée');
}
```

## 2. Envoyer l'ID utilisateur après connexion

Quand un utilisateur se connecte sur votre site, envoyez son ID à l'app mobile :

```javascript
// Après une connexion réussie
function onUserLoggedIn(userId) {
  if (typeof window.sendToNative !== 'undefined') {
    window.sendToNative('USER_LOGGED_IN', { userId: userId });
    console.log('User ID envoyé à l\'app:', userId);
  }
}
```

## 3. Exemple d'intégration complète

```javascript
// Dans votre code de connexion
async function handleLogin(email, password) {
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (data.success && data.user) {
      // Connexion réussie
      localStorage.setItem('user', JSON.stringify(data.user));

      // Envoyer à l'app mobile (si présent)
      if (typeof window.sendToNative !== 'undefined') {
        window.sendToNative('USER_LOGGED_IN', {
          userId: data.user.id
        });
      }

      // Rediriger vers le dashboard
      window.location.href = '/dashboard';
    }
  } catch (error) {
    console.error('Erreur de connexion:', error);
  }
}
```

## 4. Écouter les réponses de l'app mobile (optionnel)

Si vous voulez savoir quand le push token est enregistré :

```javascript
// Écouter les messages de React Native
if (typeof document !== 'undefined') {
  document.addEventListener('message', function(event) {
    try {
      const data = JSON.parse(event.data);

      if (data.type === 'PUSH_TOKEN_REGISTERED') {
        console.log('Push token enregistré avec succès');
        // Vous pouvez afficher une notification à l'utilisateur
      }
    } catch (error) {
      console.error('Erreur parsing message:', error);
    }
  });
}
```

## 5. Vérifier au chargement de la page

Si l'utilisateur est déjà connecté, envoyez son ID au chargement :

```javascript
// Au chargement de la page
window.addEventListener('load', function() {
  // Vérifier si l'utilisateur est connecté
  const userStr = localStorage.getItem('user');

  if (userStr && typeof window.sendToNative !== 'undefined') {
    try {
      const user = JSON.parse(userStr);
      window.sendToNative('USER_LOGGED_IN', {
        userId: user.id
      });
    } catch (error) {
      console.error('Erreur:', error);
    }
  }
});
```

## Récapitulatif

### Depuis votre site web → App mobile

```javascript
// Envoyer l'ID utilisateur
window.sendToNative('USER_LOGGED_IN', { userId: 'user-id-123' });
```

### Depuis l'app mobile → Votre site web

L'app mobile vous notifiera quand le push token est enregistré :

```javascript
{
  type: 'PUSH_TOKEN_REGISTERED',
  success: true
}
```

## Notes importantes

1. **L'ID utilisateur doit correspondre** à celui utilisé dans Supabase pour la table `user_push_tokens`
2. Appelez `sendToNative` **uniquement si la fonction existe** pour éviter les erreurs
3. Vous pouvez appeler `sendToNative` plusieurs fois sans problème (par exemple à chaque navigation)
4. Le push token sera automatiquement enregistré en base de données

## Test

Pour tester l'intégration :

1. Ajoutez des `console.log` dans votre code de connexion
2. Ouvrez l'app mobile et connectez-vous
3. Vérifiez les logs dans la console web (Safari/Chrome remote debugging)
4. Vérifiez que le push token apparaît dans la table `user_push_tokens` de Supabase
