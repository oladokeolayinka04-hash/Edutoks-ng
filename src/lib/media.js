import {supabase} from "./supabase";

const MAX_IMAGE=8*1024*1024;
const MAX_VIDEO=100*1024*1024;

export async function getCloudinaryUploadSignature(resource_type="image",folder="edutoks/profiles"){
  if(!supabase) throw new Error("SUPABASE_NOT_CONFIGURED");
  const {data:{session},error}=await supabase.auth.getSession();
  if(error||!session) throw new Error("AUTH_REQUIRED");
  const {data,error:fnError}=await supabase.functions.invoke("cloudinary-sign-upload",{
    body:{resource_type,folder}
  });
  if(fnError) throw fnError;
  if(!data?.signature) throw new Error(data?.error||"UPLOAD_SIGNATURE_FAILED");
  return data;
}

export async function uploadMedia(file,{resourceType="image",folder="edutoks/profiles",onProgress}={}){
  if(!(file instanceof File)) throw new Error("INVALID_FILE");
  const isVideo=resourceType==="video";
  const max=isVideo?MAX_VIDEO:MAX_IMAGE;
  if(file.size>max) throw new Error(isVideo?"VIDEO_TOO_LARGE_MAX_100MB":"IMAGE_TOO_LARGE_MAX_8MB");
  if(isVideo&&!file.type.startsWith("video/")) throw new Error("INVALID_VIDEO_TYPE");
  if(!isVideo&&!file.type.startsWith("image/")) throw new Error("INVALID_IMAGE_TYPE");
  const signed=await getCloudinaryUploadSignature(resourceType,folder);
  const endpoint=`https://api.cloudinary.com/v1_1/${signed.cloud_name}/${resourceType}/upload`;
  const form=new FormData();
  form.append("file",file);
  form.append("api_key",signed.api_key);
  form.append("timestamp",String(signed.timestamp));
  form.append("signature",signed.signature);
  form.append("folder",signed.folder);
  return await new Promise((resolve,reject)=>{
    const xhr=new XMLHttpRequest();
    xhr.open("POST",endpoint);
    xhr.upload.onprogress=e=>{if(e.lengthComputable) onProgress?.(Math.round(e.loaded/e.total*100));};
    xhr.onload=()=>{try{const body=JSON.parse(xhr.responseText);if(xhr.status>=200&&xhr.status<300)resolve(body);else reject(new Error(body?.error?.message||"CLOUDINARY_UPLOAD_FAILED"));}catch{reject(new Error("CLOUDINARY_UPLOAD_FAILED"));}};
    xhr.onerror=()=>reject(new Error("NETWORK_UPLOAD_FAILED"));
    xhr.send(form);
  });
}

export async function saveProfileAvatar(userId,secureUrl){
  if(!supabase) throw new Error("SUPABASE_NOT_CONFIGURED");
  const {error}=await supabase.from("profiles").update({avatar_url:secureUrl}).eq("id",userId);
  if(error) throw error;
}

export async function savePostMedia(postId,media){
  if(!supabase) throw new Error("SUPABASE_NOT_CONFIGURED");
  const {error}=await supabase.from("post_media").insert(media.map((m,i)=>({
    post_id:postId,media_type:m.resource_type==="video"?"video":"image",
    media_url:m.secure_url,thumbnail_url:m.thumbnail_url||null,sort_order:i
  })));
  if(error) throw error;
}

export async function saveStoryMedia(userId,media,expiresAt){
  if(!supabase) throw new Error("SUPABASE_NOT_CONFIGURED");
  const {error}=await supabase.from("stories").insert({
    user_id:userId,media_type:media.resource_type==="video"?"video":"image",
    media_url:media.secure_url,expires_at:expiresAt
  });
  if(error) throw error;
}
