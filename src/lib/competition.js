import { supabase } from "./supabase";
export async function getCompetitions(){const{data,error}=await supabase.from("competitions").select("*").eq("active",true).order("starts_at");if(error)throw error;return data||[]}
export async function joinCompetition(id){const{error}=await supabase.rpc("join_competition",{p_competition_id:id});if(error)throw error}
export async function getLeaderboard(limit=20){const{data,error}=await supabase.rpc("leaderboard",{p_limit:limit});if(error)throw error;return data||[]}
