-- EduToks NG: social/feed/chat/rewards/CBT lookup indexes.
-- These statements were applied to the connected Supabase project and verified.
-- Kept in source control so the database changes are documented and reproducible.
CREATE UNIQUE INDEX IF NOT EXISTS follows_unique_pair_idx ON public.follows (follower_id, following_id);
CREATE INDEX IF NOT EXISTS follows_following_lookup_idx ON public.follows (following_id, created_at DESC);
CREATE INDEX IF NOT EXISTS follows_follower_lookup_idx ON public.follows (follower_id, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS blocks_unique_pair_idx ON public.blocks (blocker_id, blocked_id);
CREATE INDEX IF NOT EXISTS blocks_blocked_lookup_idx ON public.blocks (blocked_id, blocker_id);
CREATE INDEX IF NOT EXISTS posts_feed_created_idx ON public.posts (created_at DESC);
CREATE INDEX IF NOT EXISTS posts_user_created_idx ON public.posts (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS comments_post_created_idx ON public.comments (post_id, created_at ASC);
CREATE INDEX IF NOT EXISTS messages_conversation_created_idx ON public.messages (conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS point_transactions_user_created_idx ON public.point_transactions (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS reward_redemptions_user_created_idx ON public.reward_redemptions (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS exam_attempt_questions_attempt_order_idx ON public.exam_attempt_questions (attempt_id, question_order);
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'follows_no_self_follow') THEN
    ALTER TABLE public.follows ADD CONSTRAINT follows_no_self_follow CHECK (follower_id <> following_id) NOT VALID;
  END IF;
END $$;
