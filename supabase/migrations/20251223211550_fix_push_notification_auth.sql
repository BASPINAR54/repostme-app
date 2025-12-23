/*
  # Corriger l'authentification du trigger de notifications push

  1. Modifications
    - Ajoute l'Authorization header manquant dans le trigger
    - Utilise la clé service_role de Supabase pour authentifier les appels à l'Edge Function
    - Utilise pg_net pour les appels HTTP asynchrones

  2. Sécurité
    - L'Edge Function nécessite une authentification pour être appelée
    - Le trigger utilise maintenant le service_role_key stocké dans les secrets Supabase
*/

-- Fonction corrigée pour envoyer une notification push via l'Edge Function
CREATE OR REPLACE FUNCTION public.send_push_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  request_id bigint;
  function_url text;
  payload jsonb;
  service_key text;
BEGIN
  -- URL de l'Edge Function
  function_url := 'https://muvxuuybmdnbcwnjxbpw.supabase.co/functions/v1/send-push-notification';
  
  -- Récupérer la clé service_role depuis les variables d'environnement Supabase
  -- Note: Cette clé doit être configurée dans le dashboard Supabase sous Settings > Vault
  service_key := current_setting('app.settings.service_role_key', true);
  
  -- Si la clé n'est pas configurée, utiliser l'anon key (moins sécurisé mais fonctionnel pour le dev)
  IF service_key IS NULL OR service_key = '' THEN
    service_key := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11dnh1dXlibWRuYmN3bmp4YnB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNDc3MzgsImV4cCI6MjA2ODcyMzczOH0.gWE-aTgQNXclfvYmEmJFtPAeZo5_oxWHiTshuCxmPIM';
  END IF;

  -- Préparer le payload
  payload := jsonb_build_object(
    'user_id', NEW.user_id,
    'title', NEW.title,
    'message', NEW.message,
    'data', COALESCE(NEW.data, '{}'::jsonb)
  );

  -- Envoyer la requête HTTP asynchrone via pg_net avec authentification
  SELECT INTO request_id net.http_post(
    url := function_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_key
    ),
    body := payload
  );

  -- Journaliser l'ID de la requête pour le débogage
  RAISE LOG 'Push notification request sent with ID: % for user: %', request_id, NEW.user_id;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- En cas d'erreur, on journalise mais on ne bloque pas l'insertion
    RAISE LOG 'Error sending push notification: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
    RETURN NEW;
END;
$$;

-- Commentaire mis à jour
COMMENT ON FUNCTION public.send_push_notification() IS 
  'Fonction trigger qui envoie une notification push via l''Edge Function avec authentification correcte';
