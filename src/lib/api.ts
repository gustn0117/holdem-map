import { supabase } from "./supabase";
import { Store, Event, Notice, Job, Banner, Short } from "@/types";

export async function getStores(): Promise<Store[]> {
  const { data, error } = await supabase
    .from("stores")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function getStore(id: string): Promise<Store | null> {
  const { data, error } = await supabase
    .from("stores")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data;
}

export async function getEvent(id: string): Promise<Event | null> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data;
}

export async function getEvents(): Promise<Event[]> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("date", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function getEventsByStore(storeId: string): Promise<Event[]> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("store_id", storeId)
    .order("date", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function getNotices(): Promise<Notice[]> {
  const { data, error } = await supabase
    .from("notices")
    .select("*")
    .order("date", { ascending: false });
  if (error) throw error;
  return data || [];
}

// CRUD for admin
export async function createStore(store: Omit<Store, "id" | "created_at" | "updated_at">) {
  const { data, error } = await supabase.from("stores").insert(store).select().single();
  if (error) throw error;
  return data;
}

export async function updateStore(id: string, updates: Partial<Store>) {
  const { data, error } = await supabase
    .from("stores")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteStore(id: string) {
  const { error } = await supabase.from("stores").delete().eq("id", id);
  if (error) throw error;
}

export async function createEvent(event: Omit<Event, "id" | "created_at">) {
  const { data, error } = await supabase.from("events").insert(event).select().single();
  if (error) throw error;
  return data;
}

export async function updateEvent(id: string, updates: Partial<Event>) {
  const { data, error } = await supabase.from("events").update(updates).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteEvent(id: string) {
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) throw error;
}

export async function createNotice(notice: Omit<Notice, "id" | "created_at">) {
  const { data, error } = await supabase.from("notices").insert(notice).select().single();
  if (error) throw error;
  return data;
}

export async function updateNotice(id: string, updates: Partial<Notice>) {
  const { data, error } = await supabase.from("notices").update(updates).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteNotice(id: string) {
  const { error } = await supabase.from("notices").delete().eq("id", id);
  if (error) throw error;
}

// Jobs
export async function getJobs(): Promise<Job[]> {
  const { data, error } = await supabase.from("jobs").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createJob(job: Record<string, unknown>) {
  const { data, error } = await supabase.from("jobs").insert(job).select().single();
  if (error) throw error;
  return data;
}

export async function deleteJob(id: string) {
  const { error } = await supabase.from("jobs").delete().eq("id", id);
  if (error) throw error;
}

// Banners
export async function getBanners(): Promise<Banner[]> {
  const { data, error } = await supabase.from("banners").select("*").order("position");
  if (error) throw error;
  return data || [];
}

export async function updateBanner(id: string, updates: Partial<Banner>) {
  const { data, error } = await supabase.from("banners").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

// Shorts
export async function getShorts(): Promise<Short[]> {
  const { data, error } = await supabase.from("shorts").select("*").eq("active", true).order("sort_order");
  if (error) throw error;
  return data || [];
}

export async function getAllShorts(): Promise<Short[]> {
  const { data, error } = await supabase.from("shorts").select("*").order("sort_order");
  if (error) throw error;
  return data || [];
}

export async function createShort(short: Omit<Short, "id" | "created_at">) {
  const { data, error } = await supabase.from("shorts").insert(short).select().single();
  if (error) throw error;
  return data;
}

export async function updateShort(id: string, updates: Partial<Short>) {
  const { data, error } = await supabase.from("shorts").update(updates).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteShort(id: string) {
  const { error } = await supabase.from("shorts").delete().eq("id", id);
  if (error) throw error;
}
