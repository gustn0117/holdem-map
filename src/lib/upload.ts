import { supabase } from "./supabase";

export async function uploadImage(file: File, folder: string = "images"): Promise<string> {
  const ext = file.name.split(".").pop();
  const name = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from("holdem-map")
    .upload(name, file, { cacheControl: "3600", upsert: false });

  if (error) throw error;

  const { data } = supabase.storage.from("holdem-map").getPublicUrl(name);
  return data.publicUrl;
}
