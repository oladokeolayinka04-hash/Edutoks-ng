import { supabase } from "./supabase";

export async function getExams() {
  if (!supabase) return [];
  const { data, error } = await supabase.from("exams").select("*").eq("active", true).order("name");
  if (error) throw error;
  return data || [];
}

export async function getSubjects() {
  if (!supabase) return [];
  const { data, error } = await supabase.from("subjects").select("*").eq("active", true).order("name");
  if (error) throw error;
  return data || [];
}

export async function getPublishedQuestions({ examId, subjectId, topicId, difficulty, limit = 20 }) {
  if (!supabase) return [];
  let q = supabase.from("questions")
    .select("id,question_text,explanation,difficulty,is_ai_generated,source_label,question_options(id,option_key,option_text)")
    .eq("status","PUBLISHED")
    .eq("exam_id",examId)
    .eq("subject_id",subjectId)
    .limit(limit);
  if (topicId) q = q.eq("topic_id", topicId);
  if (difficulty) q = q.eq("difficulty", difficulty);
  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

export async function createAttempt(payload) {
  if (!supabase) throw new Error("Supabase is not configured.");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Please sign in to start a CBT.");
  const { data, error } = await supabase.from("exam_attempts").insert({
    ...payload, user_id: user.id
  }).select().single();
  if (error) throw error;
  return data;
}

export async function saveAnswer(payload) {
  if (!supabase) throw new Error("Supabase is not configured.");
  const { data, error } = await supabase.from("attempt_answers").upsert(payload, { onConflict:"attempt_id,question_id" }).select().single();
  if (error) throw error;
  return data;
}
