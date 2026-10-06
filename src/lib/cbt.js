import { supabase } from "./supabase";

export async function getExams(){if(!supabase)return[];const{data,error}=await supabase.from("exams").select("*").eq("active",true).order("name");if(error)throw error;return data||[]}
export async function getSubjects(){if(!supabase)return[];const{data,error}=await supabase.from("subjects").select("*").eq("active",true).order("name");if(error)throw error;return data||[]}
export async function getTopics(subjectId){if(!supabase)return[];const{data,error}=await supabase.from("topics").select("*").eq("subject_id",subjectId).eq("active",true).order("name");if(error)throw error;return data||[]}
export async function startCbt({examId,subjectId,topicId=null,difficulty=null,questionCount=10}){if(!supabase)throw new Error("Supabase is not configured.");const{data,error}=await supabase.rpc("start_cbt",{p_exam_id:examId,p_subject_id:subjectId,p_topic_id:topicId,p_difficulty:difficulty,p_question_count:questionCount});if(error)throw error;return data}
export async function submitCbt(attemptId,answers){if(!supabase)throw new Error("Supabase is not configured.");const{data,error}=await supabase.rpc("submit_cbt",{p_attempt_id:attemptId,p_answers:answers});if(error)throw error;return data}
