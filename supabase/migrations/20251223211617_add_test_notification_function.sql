/*
  # Ajouter une fonction de test pour les notifications push

  1. Nouvelle fonction
    - `test_send_notification`: Permet d'envoyer une notification de test à un utilisateur
    - Utile pour déboguer et tester le système de notifications push

  2. Utilisation
    - SELECT test_send_notification('user_id_here', 'Test', 'Message de test');
*/

-- Fonction pour tester l'envoi d'une notification
CREATE OR REPLACE FUNCTION public.test_send_notification(
  p_user_id uuid,
  p_title text DEFAULT 'Notification de test',
  p_message text DEFAULT 'Ceci est une notification de test depuis Supabase'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_notification_id uuid;
  v_token_count int;
  v_result jsonb;
BEGIN
  -- Vérifier si l'utilisateur a des tokens push
  SELECT COUNT(*) INTO v_token_count
  FROM public.user_push_tokens
  WHERE user_id = p_user_id;

  IF v_token_count = 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'No push tokens found for user',
      'user_id', p_user_id
    );
  END IF;

  -- Insérer une notification (ce qui déclenchera automatiquement le trigger)
  INSERT INTO public.notifications (user_id, type, title, message, data)
  VALUES (
    p_user_id,
    'test',
    p_title,
    p_message,
    jsonb_build_object('test', true, 'timestamp', now())
  )
  RETURNING id INTO v_notification_id;

  -- Retourner le résultat
  v_result := jsonb_build_object(
    'success', true,
    'notification_id', v_notification_id,
    'user_id', p_user_id,
    'token_count', v_token_count,
    'message', 'Notification sent! Check your device.'
  );

  RETURN v_result;
END;
$$;

-- Commentaire
COMMENT ON FUNCTION public.test_send_notification(uuid, text, text) IS 
  'Fonction de test pour envoyer une notification push à un utilisateur. Retourne un JSON avec le résultat.';

-- Fonction pour lister les tokens d'un utilisateur (pour le débogage)
CREATE OR REPLACE FUNCTION public.get_user_push_tokens(p_user_id uuid)
RETURNS TABLE (
  push_token text,
  device_type text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT push_token, device_type, created_at, updated_at
  FROM public.user_push_tokens
  WHERE user_id = p_user_id
  ORDER BY updated_at DESC;
$$;

COMMENT ON FUNCTION public.get_user_push_tokens(uuid) IS 
  'Récupère tous les tokens push d''un utilisateur pour le débogage';
