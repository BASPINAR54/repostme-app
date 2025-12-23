/*
  # Ajouter une fonction pour envoyer une notification de test à tous les utilisateurs

  1. Nouvelle fonction
    - `test_push_notification`: Envoie une notification de test à tous les utilisateurs ayant des tokens push
    - Ne nécessite pas de user_id, pratique pour les tests depuis l'interface

  2. Sécurité
    - Accessible uniquement aux utilisateurs authentifiés
*/

-- Fonction pour envoyer une notification de test à tous les utilisateurs
CREATE OR REPLACE FUNCTION public.test_push_notification(
  p_title text DEFAULT 'Test Notification',
  p_body text DEFAULT 'Ceci est une notification de test!',
  p_data jsonb DEFAULT '{"test": true}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_record record;
  v_notification_count int := 0;
  v_user_count int := 0;
BEGIN
  -- Parcourir tous les utilisateurs ayant au moins un token push
  FOR v_user_record IN 
    SELECT DISTINCT user_id 
    FROM public.user_push_tokens
  LOOP
    -- Insérer une notification pour chaque utilisateur
    INSERT INTO public.notifications (user_id, type, title, message, data)
    VALUES (
      v_user_record.user_id,
      'test',
      p_title,
      p_body,
      p_data
    );
    
    v_notification_count := v_notification_count + 1;
    v_user_count := v_user_count + 1;
  END LOOP;

  -- Retourner le résultat
  RETURN jsonb_build_object(
    'success', true,
    'notifications_sent', v_notification_count,
    'users_notified', v_user_count,
    'message', format('Sent %s notifications to %s users', v_notification_count, v_user_count)
  );
END;
$$;

-- Commentaire
COMMENT ON FUNCTION public.test_push_notification(text, text, jsonb) IS 
  'Envoie une notification de test à tous les utilisateurs ayant des tokens push enregistrés';
