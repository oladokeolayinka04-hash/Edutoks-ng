import {supabase} from "./supabase";
export async function getAttemptHistory(limit=30){const{data,error}=await supabase.rpc("my_attempt_history",{p_limit:limit});if(error)throw error;return data||[]}
export async function getPerformance(){const{data,error}=await supabase.rpc("my_performance");if(error)throw error;return data||[]}
export async function getAttemptCorrections(attemptId){if(!supabase)throw new Error("Supabase is not configured.");const{data,error}=await supabase.rpc("get_attempt_corrections",{p_attempt_id:attemptId});if(error)throw error;return Array.isArray(data)?data:[]}
