/*
  # Ajouter le trigger pour envoyer les notifications push automatiquement

  1. Modifications
    - Crée une fonction PL/pgSQL qui appelle l'Edge Function `send-push-notification` via pg_net
    - Crée un trigger qui s'exécute après chaque INSERT dans la table `notifications`
    - Le trigger envoie automatiquement une notification push à l'utilisateur

  2. Sécurité
    - La fonction utilise pg_net.http_post pour un appel HTTP asynchrone
    - Les erreurs sont gérées sans bloquer l'insertion de la notification
*/

-- Fonction pour envoyer une notification push via l'Edge Function
CREATE OR REPLACE FUNCTION public.send_push_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  request_id bigint;
  function_url text;
  payload jsonb;
BEGIN
  -- Construire l'URL de l'Edge Function
  function_url := current_setting('app.settings.api_external_url', true) || '/functions/v1/send-push-notification';
  
  -- Si l'URL n'est pas configurée, utiliser l'URL par défaut
  IF function_url IS NULL OR function_url = '/functions/v1/send-push-notification' THEN
    function_url := 'https://' || current_setting('app.settings.project_ref', true) || '.supabase.co/functions/v1/send-push-notification';
  END IF;

  -- Préparer le payload
  payload := jsonb_build_object(
    'user_id', NEW.user_id,
    'title', NEW.title,
    'message', NEW.message,
    'data', COALESCE(NEW.data, '{}'::jsonb)
  );

  -- Envoyer la requête HTTP asynchrone via pg_net
  SELECT INTO request_id net.http_post(
    url := function_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := payload
  );

  -- Journaliser l'ID de la requête pour le débogage
  RAISE LOG 'Push notification request sent with ID: %', request_id;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- En cas d'erreur, on journalise mais on ne bloque pas l'insertion
    RAISE LOG 'Error sending push notification: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Créer le trigger
DROP TRIGGER IF EXISTS trigger_send_push_notification ON public.notifications;

CREATE TRIGGER trigger_send_push_notification
  AFTER INSERT ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.send_push_notification();

-- Commentaires
COMMENT ON FUNCTION public.send_push_notification() IS 
  'Fonction trigger qui envoie une notification push via l''Edge Function quand une nouvelle notification est insérée';

COMMENT ON TRIGGER trigger_send_push_notification ON public.notifications IS 
  'Déclenche l''envoi d''une notification push après chaque insertion dans la table notifications';
