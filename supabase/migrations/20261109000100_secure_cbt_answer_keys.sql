-- Prevent students from reading answer keys through the public Data API.
-- Exam delivery remains available through the SECURITY DEFINER start_cbt RPC.

REVOKE SELECT ON TABLE public.question_options FROM PUBLIC, anon, authenticated;
GRANT SELECT (id, question_id, option_key, option_text)
  ON TABLE public.question_options TO anon, authenticated;
REVOKE SELECT (is_correct) ON TABLE public.question_options FROM PUBLIC, anon, authenticated;

-- Answer correctness is internal grading state. No browser client needs direct
-- access to attempt_answers; corrections are returned by the owner-checked RPC.
REVOKE SELECT ON TABLE public.attempt_answers FROM PUBLIC, anon, authenticated;
DROP POLICY IF EXISTS answers_own ON public.attempt_answers;

CREATE OR REPLACE FUNCTION public.get_attempt_corrections(p_attempt_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_result jsonb;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'AUTH_REQUIRED' USING errcode = '42501';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.exam_attempts a
    WHERE a.id = p_attempt_id
      AND a.user_id = auth.uid()
      AND a.completed = true
  ) THEN
    RAISE EXCEPTION 'COMPLETED_ATTEMPT_NOT_FOUND' USING errcode = '42501';
  END IF;

  SELECT coalesce(
    jsonb_agg(
      jsonb_build_object(
        'question_id', aa.question_id,
        'selected_option_id', aa.selected_option_id,
        'is_correct', coalesce(aa.is_correct, false),
        'questions', jsonb_build_object(
          'question_text', q.question_text,
          'explanation', q.explanation,
          'question_options', coalesce((
            SELECT jsonb_agg(
              jsonb_build_object(
                'id', o.id,
                'option_key', o.option_key,
                'option_text', o.option_text,
                'is_correct', o.is_correct
              ) ORDER BY o.option_key
            )
            FROM public.question_options o
            WHERE o.question_id = q.id
          ), '[]'::jsonb)
        )
      ) ORDER BY aq.question_order
    ),
    '[]'::jsonb
  )
  INTO v_result
  FROM public.exam_attempt_questions aq
  JOIN public.questions q
    ON q.id = aq.question_id
  LEFT JOIN public.attempt_answers aa
    ON aa.attempt_id = aq.attempt_id
   AND aa.question_id = aq.question_id
  WHERE aq.attempt_id = p_attempt_id;

  RETURN v_result;
END;
$function$;

REVOKE ALL ON FUNCTION public.get_attempt_corrections(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_attempt_corrections(uuid) TO authenticated;
