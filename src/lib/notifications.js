import {supabase} from "./supabase";

export async function getNotifications(limit=30){
  if(!supabase) return [];
  const {data,error}=await supabase.from("notifications").select("id,type,title,body,data,read_at,created_at").order("created_at",{ascending:false}).limit(limit);
  if(error) throw error;
  return data||[];
}
export async function getUnreadNotificationCount(){
  if(!supabase) return 0;
  const {data,error}=await supabase.rpc("get_notification_unread_count");
  if(error) throw error;
  return Number(data||0);
}
export async function markNotificationRead(id){
  const {data,error}=await supabase.rpc("mark_notification_read",{p_notification_id:id});
  if(error) throw error;
  return data;
}
export async function markAllNotificationsRead(){
  const {data,error}=await supabase.rpc("mark_all_notifications_read");
  if(error) throw error;
  return Number(data||0);
}
