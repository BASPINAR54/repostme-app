/*
  # Corriger le trigger pour utiliser l'URL Supabase correcte

  1. Modifications
    - Met à jour la fonction pour utiliser l'URL Supabase correcte
    - Utilise l'URL fixe du projet pour appeler l'Edge Function
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
  -- URL de l'Edge Function
  function_url := 'https://muvxuuybmdnbcwnjxbpw.supabase.co/functions/v1/send-push-notification';

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
      'Content-Type', 'application/json'
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
