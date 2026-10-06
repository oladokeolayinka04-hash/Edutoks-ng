import {supabase} from "./supabase";
export async function getAttemptHistory(limit=30){const{data,error}=await supabase.rpc("my_attempt_history",{p_limit:limit});if(error)throw error;return data||[]}
export async function getPerformance(){const{data,error}=await supabase.rpc("my_performance");if(error)throw error;return data||[]}
export async function getAttemptCorrections(attemptId){const{data,error}=await supabase.from("attempt_answers").select("question_id,selected_option_id,is_correct,questions(question_text,explanation,question_options(id,option_key,option_text,is_correct))").eq("attempt_id",attemptId);if(error)throw error;return data||[]}
