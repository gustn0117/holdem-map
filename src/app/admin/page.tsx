"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useStores, useNotices } from "@/hooks/useData";
import { Store } from "@/types";
import * as api from "@/lib/api";
import { geocodeAddress } from "@/lib/geocode";
import Select from "@/components/Select";
import ImageUpload from "@/components/ImageUpload";
import JobAvatarPicker from "@/components/JobAvatarPicker";

import { supabase } from "@/lib/supabase";

type Tab = "stores" | "events" | "notices" | "banners" | "shorts" | "users" | "live" | "promotions" | "inquiries" | "board" | "market" | "trade" | "jobs";

interface TradeItemRow {
  id: string;
  user_id: string | null;
  nickname: string;
  title: string;
  category: string;
  price: string;
  condition: string;
  description: string;
  images: string[];
  region: string;
  contact: string;
  status: string;
  views: number;
  pinned_rank?: number;
  created_at: string;
}

interface MarketListing {
  id: string;
  user_id: string | null;
  type: string;
  title: string;
  region: string;
  address: string;
  price: string;
  description: string;
  images: string[];
  contact: string;
  status: string;
  is_featured: boolean;
  is_hidden?: boolean;
  hidden_reason?: string;
  report_count?: number;
  pinned_rank?: number;
  created_at: string;
}

interface Post {
  id: string;
  user_id: string | null;
  nickname: string;
  title: string;
  content: string;
  category?: string;
  views: number;
  pinned: boolean;
  image?: string;
  status?: string;
  hidden_reason?: string;
  report_count?: number;
  pinned_rank?: number;
  created_at: string;
}

interface PostComment {
  id: string;
  post_id: string;
  user_id: string | null;
  nickname: string;
  content: string;
  created_at: string;
}

const EVENT_DEFAULT_NOTICE = `※ 본 페이지는 이벤트 정보 안내용이며, 실제 진행 및 참여는 각 업장에서 개별적으로 이루어집니다.
※ 본 사이트는 운영·모집·정산 등에 관여하지 않으며, 이용은 업장 기준에 따릅니다.
※ 관련 법령에 위반될 수 있는 행위는 지원하지 않습니다.`;

interface Inquiry {
  id: string;
  name: string;
  phone: string;
  store_name: string;
  store_address: string | null;
  region: string;
  message: string;
  status: string;
  store_images: string[] | null;
  created_at: string;
}
const ADMIN_PASSWORD = "1234";
const inputClass = "w-full bg-white border border-border-custom rounded-xl px-4 py-3 text-base text-surface focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all placeholder:text-muted";

interface Profile {
  id: string;
  email: string;
  nickname: string;
  role: string;
  is_blocked: boolean;
  created_at: string;
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("stores");
  const [modal, setModal] = useState<{ type: "create" | "edit"; tab: Tab; data?: Record<string, unknown> } | null>(null);
  const [saving, setSaving] = useState(false);
  const { stores, refresh: refreshStores } = useStores();
  const { notices, refresh: refreshNotices } = useNotices();
  const [events, setEvents] = useState<import("@/types").Event[]>([]);
  const [tournamentApps, setTournamentApps] = useState<{ event_id: string; user_id: string | null; nickname: string; email: string; phone: string | null; created_at: string }[]>([]);
  const [applicantsModal, setApplicantsModal] = useState<{ eventId: string; eventTitle: string } | null>(null);
  const refreshTournamentApps = async () => {
    const { data } = await supabase.from("tournament_applications").select("event_id, user_id, created_at");
    if (!data || data.length === 0) { setTournamentApps([]); return; }
    const userIds = [...new Set(data.map(d => d.user_id).filter(Boolean) as string[])];
    const { data: profs } = await supabase.from("profiles").select("id, nickname, email, phone").in("id", userIds);
    const map = new Map((profs || []).map(p => [p.id, p]));
    setTournamentApps(data.map(d => {
      const p = d.user_id ? map.get(d.user_id) : null;
      return {
        event_id: d.event_id,
        user_id: d.user_id,
        nickname: p?.nickname || "(알 수 없음)",
        email: p?.email || "",
        phone: p?.phone || null,
        created_at: d.created_at,
      };
    }));
  };
  const refreshEvents = async () => { const data = await api.getAllEvents(); setEvents(data); };
  const [jobs, setJobs] = useState<import("@/types").Job[]>([]);
  const refreshJobs = async () => { const data = await api.getJobs(); setJobs(data); };
  const [banners, setBanners] = useState<import("@/types").Banner[]>([]);
  const [bannerSaving, setBannerSaving] = useState<string | null>(null);
  const [shorts, setShorts] = useState<import("@/types").Short[]>([]);
  const [liveGames, setLiveGames] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [noticePostOpen, setNoticePostOpen] = useState(false);
  const [noticePostForm, setNoticePostForm] = useState({ title: "", content: "", image: "" });
  const [noticePostSaving, setNoticePostSaving] = useState(false);
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [postComments, setPostComments] = useState<Record<string, PostComment[]>>({});
  const [marketListings, setMarketListings] = useState<MarketListing[]>([]);
  const [tradeItems, setTradeItems] = useState<TradeItemRow[]>([]);

  useEffect(() => { api.getBanners().then(setBanners); api.getAllShorts().then(setShorts); refreshUsers(); refreshLiveGames(); refreshPromotions(); refreshInquiries(); refreshEvents(); refreshPosts(); refreshMarket(); refreshTrade(); refreshJobs(); refreshTournamentApps(); }, []);

  const refreshTrade = async () => {
    const { data } = await supabase.from("trade_items").select("*").order("pinned_rank", { ascending: false }).order("created_at", { ascending: false });
    setTradeItems((data as TradeItemRow[]) || []);
  };

  const handleTradeDelete = async (id: string) => {
    if (!confirm("이 상품을 삭제하시겠습니까?")) return;
    await supabase.from("trade_items").delete().eq("id", id);
    refreshTrade();
  };

  const handleTradeStatus = async (id: string, status: string) => {
    const order = ["판매중", "예약중", "판매완료"];
    const idx = order.indexOf(status);
    const next = order[(idx + 1) % order.length];
    await supabase.from("trade_items").update({ status: next }).eq("id", id);
    refreshTrade();
  };

  const refreshMarket = async () => {
    const { data } = await supabase.from("market_listings").select("*").order("pinned_rank", { ascending: false }).order("is_featured", { ascending: false }).order("created_at", { ascending: false });
    setMarketListings((data as MarketListing[]) || []);
  };

  const handleMarketDelete = async (id: string) => {
    if (!confirm("이 매물을 삭제하시겠습니까?")) return;
    await supabase.from("market_listings").delete().eq("id", id);
    refreshMarket();
  };

  const handleMarketToggleHide = async (id: string, isHidden: boolean) => {
    await supabase.from("market_listings").update({ is_hidden: !isHidden, hidden_reason: !isHidden ? "관리자 숨김" : null }).eq("id", id);
    refreshMarket();
  };

  const handleMarketToggleFeatured = async (id: string, isFeatured: boolean) => {
    await supabase.from("market_listings").update({ is_featured: !isFeatured }).eq("id", id);
    refreshMarket();
  };

  const handleMarketToggleStatus = async (id: string, status: string) => {
    const next = status === "모집중" ? "거래완료" : "모집중";
    await supabase.from("market_listings").update({ status: next }).eq("id", id);
    refreshMarket();
  };

  const refreshPosts = async () => {
    const { data } = await supabase.from("posts").select("*").order("pinned_rank", { ascending: false }).order("pinned", { ascending: false }).order("created_at", { ascending: false });
    setPosts((data as Post[]) || []);
  };

  const handlePostDelete = async (id: string) => {
    if (!confirm("이 글을 삭제하시겠습니까? 복구할 수 없습니다.")) return;
    await supabase.from("posts").delete().eq("id", id);
    refreshPosts();
  };

  const handlePostTogglePin = async (id: string, pinned: boolean) => {
    await supabase.from("posts").update({ pinned: !pinned }).eq("id", id);
    refreshPosts();
  };

  const handlePinnedRankSet = async (table: string, id: string, value: number, refreshFn: () => void) => {
    await supabase.from(table).update({ pinned_rank: value }).eq("id", id);
    refreshFn();
  };

  const handlePostToggleStatus = async (id: string, status: string) => {
    const newStatus = status === "approved" ? "hidden" : "approved";
    await supabase.from("posts").update({ status: newStatus, hidden_reason: newStatus === "hidden" ? "관리자 숨김" : null }).eq("id", id);
    refreshPosts();
  };

  const togglePostComments = async (postId: string) => {
    if (expandedPostId === postId) {
      setExpandedPostId(null);
      return;
    }
    setExpandedPostId(postId);
    if (!postComments[postId]) {
      const { data } = await supabase.from("comments").select("*").eq("post_id", postId).order("created_at", { ascending: true });
      setPostComments(prev => ({ ...prev, [postId]: (data as PostComment[]) || [] }));
    }
  };

  const handleCommentDelete = async (postId: string, commentId: string) => {
    if (!confirm("이 댓글을 삭제하시겠습니까? 복구할 수 없습니다.")) return;
    await supabase.from("comments").delete().eq("id", commentId);
    setPostComments(prev => ({
      ...prev,
      [postId]: (prev[postId] || []).filter(c => c.id !== commentId),
    }));
  };

  const handleNoticePostSubmit = async () => {
    if (!noticePostForm.title.trim() || !noticePostForm.content.trim()) { alert("제목과 내용을 입력하세요."); return; }
    setNoticePostSaving(true);
    await supabase.from("posts").insert({
      user_id: null, nickname: "관리자",
      title: noticePostForm.title.trim(),
      content: noticePostForm.content.trim(),
      image: noticePostForm.image || null,
      category: "공지", pinned: true, views: 0,
    });
    setNoticePostSaving(false);
    setNoticePostForm({ title: "", content: "", image: "" });
    setNoticePostOpen(false);
    refreshPosts();
  };

  const refreshInquiries = async () => {
    const { data } = await supabase.from("inquiries").select("*").order("created_at", { ascending: false });
    setInquiries((data as Inquiry[]) || []);
  };

  const handleInquiryApprove = async (inq: Inquiry) => {
    setModal({
      type: "create",
      tab: "stores",
      data: {
        name: inq.store_name,
        address: inq.store_address || "",
        phone: inq.phone || "",
        region: inq.region,
        description: inq.message || "",
        hours: "",
        tags: "",
        is_recommended: "false",
        images: inq.store_images || [],
        _inquiryId: inq.id,
      },
    });
  };

  const handleInquiryReject = async (id: string) => {
    if (!confirm("이 문의를 반려 처리하시겠습니까?")) return;
    await supabase.from("inquiries").update({ status: "rejected" }).eq("id", id);
    refreshInquiries();
  };

  const handleInquiryDelete = async (id: string) => {
    if (!confirm("이 문의를 삭제하시겠습니까?")) return;
    await supabase.from("inquiries").delete().eq("id", id);
    refreshInquiries();
  };

  const refreshLiveGames = async () => {
    const { data } = await supabase.from("live_games").select("*").order("pinned_rank", { ascending: false }).order("created_at", { ascending: false });
    setLiveGames(data || []);
  };

  const handleDeleteLive = async (id: string) => {
    if (!confirm("삭제하시겠습니까?")) return;
    await supabase.from("live_games").delete().eq("id", id);
    refreshLiveGames();
  };

  const handleEndLive = async (id: string) => {
    await supabase.from("live_games").update({ status: "종료", end_time: new Date().toISOString() }).eq("id", id);
    refreshLiveGames();
  };

  const refreshPromotions = async () => {
    const { data } = await supabase.from("promotions").select("*").order("pinned_rank", { ascending: false }).order("sort_order", { ascending: true });
    setPromotions(data || []);
  };
  const [promoForm, setPromoForm] = useState({ title: "", content: "", badge: "EVENT", start_date: "", end_date: "", image: "", link: "" });
  const [promoSaving, setPromoSaving] = useState(false);
  const [promoEditing, setPromoEditing] = useState<string | null>(null);
  const handlePromoSubmit = async () => {
    if (!promoForm.title.trim() || !promoForm.content.trim()) { alert("제목과 내용을 입력하세요."); return; }
    setPromoSaving(true);
    if (promoEditing) {
      await supabase.from("promotions").update(promoForm).eq("id", promoEditing);
    } else {
      await supabase.from("promotions").insert(promoForm);
    }
    setPromoSaving(false); setPromoEditing(null);
    setPromoForm({ title: "", content: "", badge: "EVENT", start_date: "", end_date: "", image: "", link: "" });
    refreshPromotions();
  };
  const handlePromoDelete = async (id: string) => {
    if (!confirm("삭제하시겠습니까?")) return;
    await supabase.from("promotions").delete().eq("id", id);
    refreshPromotions();
  };
  const handlePromoToggle = async (id: string, active: boolean) => {
    await supabase.from("promotions").update({ active }).eq("id", id);
    refreshPromotions();
  };

  const refreshUsers = async () => {
    const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    setUsers(data || []);
  };

  const handleBlockUser = async (userId: string, blocked: boolean) => {
    await supabase.from("profiles").update({ is_blocked: blocked }).eq("id", userId);
    refreshUsers();
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("이 회원을 삭제하시겠습니까? 작성한 글도 모두 삭제됩니다.")) return;
    await supabase.from("profiles").delete().eq("id", userId);
    refreshUsers();
  };

  const refreshBanners = () => api.getBanners().then(setBanners);

  const handleBannerSave = async (id: string, image: string, link: string, title?: string, description?: string, contact?: string, detail_images?: string[], links?: import("@/types").BannerLink[], pinned_rank?: number, image_mobile?: string) => {
    setBannerSaving(id);
    try { await api.updateBanner(id, { image, image_mobile, link, title, description, contact, detail_images, links, pinned_rank } as any); await refreshBanners(); } catch { alert("저장 실패"); }
    setBannerSaving(null);
  };

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "stores", label: "매장", count: stores.length },
    { key: "events", label: "대회/이벤트", count: events.filter(e => e.status === "pending").length },
    { key: "promotions", label: "프로모션", count: promotions.length },
    { key: "notices", label: "공지", count: notices.length },
    { key: "banners", label: "배너 광고", count: banners.filter(b => b.image).length },
    { key: "shorts", label: "숏츠", count: shorts.length },
    { key: "users", label: "회원", count: users.length },
    { key: "live", label: "실시간", count: liveGames.length },
    { key: "inquiries", label: "매장 문의", count: inquiries.filter(i => i.status === "pending").length },
    { key: "board", label: "자유게시판", count: posts.filter(p => p.status === "hidden").length },
    { key: "market", label: "대관/매매", count: marketListings.length },
    { key: "trade", label: "중고거래", count: tradeItems.length },
    { key: "jobs", label: "구인구직", count: jobs.length },
  ];

  const refreshShorts = () => api.getAllShorts().then(setShorts);

  const handleShortDelete = async (id: string) => {
    if (!confirm("삭제하시겠습니까?")) return;
    await api.deleteShort(id); refreshShorts();
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw === ADMIN_PASSWORD) {
      setAuthed(true);
      setPwError(false);
    } else {
      setPwError(true);
    }
  };

  const handleDelete = async (tab: Tab, id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    try {
      if (tab === "stores") { await api.deleteStore(id); refreshStores(); }
      else if (tab === "events") { await api.deleteEvent(id); refreshEvents(); }
      else if (tab === "jobs") { await api.deleteJob(id); refreshJobs(); }
      else { await api.deleteNotice(id); refreshNotices(); }
    } catch { alert("삭제 실패"); }
  };

  const handleSave = async (formData: Record<string, unknown>) => {
    setSaving(true);
    try {
      if (modal?.tab === "stores") {
        const address = formData.address as string;
        let lat = parseFloat(formData.lat as string) || 0;
        let lng = parseFloat(formData.lng as string) || 0;
        if (!lat || !lng) {
          const coords = await geocodeAddress(address);
          if (coords) { lat = coords.lat; lng = coords.lng; }
          else { alert("주소로 좌표를 찾을 수 없습니다. 주소를 확인해주세요."); setSaving(false); return; }
        }
        const payload = {
          name: formData.name as string,
          address,
          phone: (formData.phone as string) || "",
          hours: (formData.hours as string) || "",
          description: (formData.description as string) || "",
          images: (formData.images as string[]) || [],
          lat, lng,
          region: formData.region as string,
          tags: (formData.tags as string).split(",").map((t: string) => t.trim()).filter(Boolean),
          is_recommended: formData.is_recommended === "true",
          is_hot: formData.is_hot === "true",
          pinned_rank: Number(formData.pinned_rank) || 0,
        };
        if (modal.type === "create") await api.createStore(payload);
        else await api.updateStore(formData.id as string, payload);
        refreshStores();
        const inquiryId = formData._inquiryId as string | undefined;
        if (inquiryId) {
          await supabase.from("inquiries").update({ status: "approved" }).eq("id", inquiryId);
          refreshInquiries();
        }
      } else if (modal?.tab === "events") {
        const payload = {
          store_id: null,
          store_name: (formData.location as string) || "",
          title: formData.title as string,
          date: formData.date as string,
          end_date: (formData.end_date as string) || "",
          time: formData.time as string,
          description: (formData.description as string) || "",
          prize: (formData.prize as string) || undefined,
          image: (formData.image as string) || "",
          content_images: (formData.content_images as string[]) || [],
          details: (formData.details as string) || "",
          buy_in: (formData.buy_in as string) || "",
          location: (formData.location as string) || "",
          is_international: Boolean(formData.is_international),
          status: (formData.status as string) || "approved",
          pinned_rank: Number(formData.pinned_rank) || 0,
        };
        if (modal.type === "create") await api.createEvent(payload);
        else await api.updateEvent(formData.id as string, payload);
        refreshEvents();
      } else if (modal?.tab === "notices") {
        const payload = {
          title: formData.title as string,
          content: formData.content as string,
          date: formData.date as string || new Date().toISOString().slice(0, 10),
          image: (formData.image as string) || "",
          pinned_rank: Number(formData.pinned_rank) || 0,
        };
        if (modal.type === "create") await api.createNotice(payload);
        else await api.updateNotice(formData.id as string, payload);
        refreshNotices();
      } else if (modal?.tab === "market") {
        const payload = {
          type: (formData.type as string) || "매매",
          title: formData.title as string,
          region: (formData.region as string) || "서울",
          address: (formData.address as string) || "",
          price: (formData.price as string) || "협의",
          description: (formData.description as string) || "",
          images: (formData.images as string[]) || [],
          contact: (formData.contact as string) || "",
          is_featured: Boolean(formData.is_featured),
          status: (formData.status as string) || "모집중",
          pinned_rank: Number(formData.pinned_rank) || 0,
        };
        if (modal.type === "create") {
          await supabase.from("market_listings").insert({ ...payload, user_id: null });
        } else {
          await supabase.from("market_listings").update(payload).eq("id", formData.id as string);
        }
        refreshMarket();
      } else if (modal?.tab === "trade") {
        const payload = {
          title: formData.title as string,
          category: (formData.category as string) || "기타",
          price: (formData.price as string) || "협의",
          condition: (formData.condition as string) || "중고",
          description: (formData.description as string) || "",
          images: (formData.images as string[]) || [],
          region: (formData.region as string) || "",
          contact: (formData.contact as string) || "",
          status: (formData.status as string) || "판매중",
          pinned_rank: Number(formData.pinned_rank) || 0,
        };
        if (modal.type === "create") {
          await supabase.from("trade_items").insert({ ...payload, user_id: null, nickname: "관리자", views: 0 });
        } else {
          await supabase.from("trade_items").update(payload).eq("id", formData.id as string);
        }
        refreshTrade();
      } else if (modal?.tab === "jobs") {
        const areasRaw = formData.areas;
        const areas = Array.isArray(areasRaw)
          ? (areasRaw as string[])
          : ((areasRaw as string) || "").split(",").map(a => a.trim()).filter(Boolean);
        const payload = {
          type: (formData.type as string) || "구직",
          nickname: (formData.nickname as string) || "익명",
          role: (formData.role as string) || "딜러",
          experience: (formData.experience as string) || "",
          areas,
          contact_type: (formData.contact_type as string) || "전화",
          contact: (formData.contact as string) || "",
          photo: (formData.photo as string) || "",
          message: (formData.message as string) || "",
          store_name: (formData.store_name as string) || "",
          salary: (formData.salary as string) || "",
          work_hours: (formData.work_hours as string) || "",
          headcount: (formData.headcount as string) || "",
          gender: (formData.gender as string) || "",
          pinned_rank: Number(formData.pinned_rank) || 0,
        };
        if (modal.type === "create") {
          await api.createJob({ ...payload, user_id: null });
        } else {
          await api.updateJob(formData.id as string, payload);
        }
        refreshJobs();
      } else if (modal?.tab === "live") {
        const payload = {
          store_name: (formData.store_name as string) || "",
          category: (formData.category as string) || "토너",
          title: (formData.title as string) || "",
          blind: (formData.blind as string) || "",
          buy_in: (formData.buy_in as string) || "",
          prize: (formData.prize as string) || "",
          rake: (formData.rake as string) || "",
          players_current: Number(formData.players_current) || 0,
          players_max: Number(formData.players_max) || 0,
          description: (formData.description as string) || "",
          image: (formData.image as string) || "",
          contact_kakao: (formData.contact_kakao as string) || "",
          contact_telegram: (formData.contact_telegram as string) || "",
          contact_phone: (formData.contact_phone as string) || "",
          status: (formData.status as string) || "진행중",
          pinned_rank: Number(formData.pinned_rank) || 0,
        };
        if (!payload.title.trim() || !payload.store_name.trim()) {
          alert("매장명과 제목을 입력해주세요.");
          setSaving(false);
          return;
        }
        if (modal.type === "create") {
          await supabase.from("live_games").insert({ ...payload, created_by: null });
        } else {
          await supabase.from("live_games").update(payload).eq("id", formData.id as string);
        }
        refreshLiveGames();
      }
      setModal(null);
    } catch {
      alert("저장 실패");
    } finally {
      setSaving(false);
    }
  };

  // ─── Login Screen ───
  if (!authed) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <div className="w-16 h-16 gold-shine rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-accent/25">
              <svg className="w-8 h-8 text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-surface mb-2">관리자 로그인</h1>
            <p className="text-muted text-base">홀덤맵 관리자 페이지에 접속합니다</p>
          </div>

          <form onSubmit={handleLogin} className="bg-white rounded-3xl p-8 border border-border-custom">
            <label className="text-sub text-sm font-medium block mb-2">비밀번호</label>
            <input
              type="password"
              value={pw}
              onChange={e => { setPw(e.target.value); setPwError(false); }}
              placeholder="비밀번호를 입력하세요"
              className={`${inputClass} ${pwError ? "border-red/50" : ""}`}
              autoFocus
            />
            {pwError && <p className="text-red text-sm mt-3">비밀번호가 올바르지 않습니다.</p>}
            <button
              type="submit"
              className="w-full bg-accent hover:bg-accent-hover text-white py-3.5 rounded-xl text-base font-bold shadow-lg shadow-accent/25 mt-6 transition-all"
            >
              로그인
            </button>
          </form>

          <div className="text-center mt-8">
            <Link href="/" className="text-muted hover:text-accent text-sm transition-colors">← 홈으로 돌아가기</Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── Admin Dashboard ───
  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-border-custom">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="홀덤맵KOREA" className="h-8 w-auto" />
            <span className="text-xs text-muted bg-gray-100 px-2.5 py-1 rounded-lg font-semibold">ADMIN</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-muted hover:text-accent text-sm transition-colors">사이트 보기</Link>
            <button onClick={() => setAuthed(false)} className="text-muted hover:text-red text-sm transition-colors">로그아웃</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-8">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`p-5 rounded-2xl border text-left transition-all ${
                activeTab === tab.key
                  ? "bg-accent/10 border-accent/20"
                  : "bg-white border-border-custom hover:border-accent/20"
              }`}
            >
              <p className={`text-3xl font-bold ${activeTab === tab.key ? "text-accent" : "text-surface"}`}>{tab.count}</p>
              <p className="text-muted/50 text-sm mt-1">{tab.label}</p>
            </button>
          ))}
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-surface">{tabs.find(t => t.key === activeTab)?.label} 관리</h2>
          {activeTab !== "inquiries" && activeTab !== "board" && (
            <button
              onClick={() => setModal({ type: "create", tab: activeTab })}
              className="bg-accent hover:bg-accent-hover text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-lg shadow-accent/20 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              새로 등록
            </button>
          )}
          {activeTab === "board" && (
            <button
              onClick={() => setNoticePostOpen(true)}
              className="bg-accent hover:bg-accent-hover text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-lg shadow-accent/20 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              공지글 작성
            </button>
          )}
        </div>

        {/* Store Table */}
        {activeTab === "stores" && (
          <div className="bg-white rounded-2xl border border-border-custom overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border-custom">
                    <th className="text-left text-muted text-sm font-medium px-5 py-4">매장명</th>
                    <th className="text-left text-muted text-sm font-medium px-5 py-4 hidden md:table-cell">주소</th>
                    <th className="text-left text-muted text-sm font-medium px-5 py-4">지역</th>
                    <th className="text-left text-muted text-sm font-medium px-5 py-4 hidden md:table-cell">영업시간</th>
                    <th className="text-left text-muted text-sm font-medium px-5 py-4">추천</th>
                    <th className="text-right text-muted text-sm font-medium px-5 py-4">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {stores.map((store) => (
                    <tr key={store.id} className="border-b border-border-custom/50 hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3">
                        <p className="text-surface text-base font-semibold">
                          {(store.pinned_rank || 0) > 0 && <span className="bg-accent text-white text-[10px] font-bold px-1.5 py-0.5 rounded mr-1.5 inline-flex items-center gap-0.5"><svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2z"/></svg>{store.pinned_rank}</span>}
                          {store.name}
                        </p>
                      </td>
                      <td className="px-5 py-3 hidden md:table-cell"><p className="text-muted text-sm truncate max-w-48">{store.address}</p></td>
                      <td className="px-5 py-3"><span className="bg-accent/10 text-accent text-xs px-2 py-0.5 rounded">{store.region}</span></td>
                      <td className="px-5 py-3 hidden md:table-cell"><p className="text-muted/50 text-sm">{store.hours}</p></td>
                      <td className="px-5 py-3">{store.is_recommended ? <svg className="w-4 h-4 text-gold" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l2.6 7.6h7.9l-6.4 4.7 2.4 7.7L12 17.3 5.5 22l2.4-7.7-6.4-4.7h7.9z"/></svg> : <span className="text-muted/20">-</span>}</td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button onClick={() => setModal({ type: "edit", tab: "stores", data: { ...store, tags: store.tags.join(", "), is_recommended: store.is_recommended ? "true" : "false", is_hot: (store as any).is_hot ? "true" : "false" } })} className="text-muted hover:text-accent text-sm transition-colors">수정</button>
                          <button onClick={() => handleDelete("stores", store.id)} className="text-muted hover:text-red text-sm transition-colors">삭제</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Event Table */}
        {activeTab === "events" && (
          <div className="bg-white rounded-2xl border border-border-custom overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border-custom">
                    <th className="text-left text-muted text-sm font-medium px-5 py-4">상태</th>
                    <th className="text-left text-muted text-sm font-medium px-5 py-4">제목</th>
                    <th className="text-left text-muted text-sm font-medium px-5 py-4 hidden md:table-cell">장소</th>
                    <th className="text-left text-muted text-sm font-medium px-5 py-4 hidden md:table-cell">날짜</th>
                    <th className="text-left text-muted text-sm font-medium px-5 py-4 hidden md:table-cell">제출자</th>
                    <th className="text-right text-muted text-sm font-medium px-5 py-4">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event.id} className="border-b border-border-custom/50 hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          event.status === "approved" ? "bg-accent-light text-accent" :
                          event.status === "rejected" ? "bg-red-50 text-red-500" :
                          "bg-yellow-50 text-yellow-700"
                        }`}>{event.status === "approved" ? "승인" : event.status === "rejected" ? "반려" : "대기"}</span>
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-surface text-base font-semibold">
                          {(event.pinned_rank || 0) > 0 && <span className="bg-accent text-white text-[10px] font-bold px-1.5 py-0.5 rounded mr-1.5 inline-flex items-center gap-0.5"><svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2z"/></svg>{event.pinned_rank}</span>}
                          {event.title}
                        </p>
                      </td>
                      <td className="px-5 py-3 hidden md:table-cell"><p className="text-muted/80 text-sm truncate max-w-48">{event.location || event.store_name}</p></td>
                      <td className="px-5 py-3 hidden md:table-cell"><p className="text-muted/80 text-sm">{event.date}{event.end_date ? ` ~ ${event.end_date}` : ""} {event.time}</p></td>
                      <td className="px-5 py-3 hidden md:table-cell"><p className="text-muted/80 text-sm">{event.submitter_nickname || (event.submitted_by ? "회원" : "관리자")}</p></td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-2 flex-wrap">
                          {event.status === "pending" && (
                            <>
                              <button onClick={async () => { await api.updateEvent(event.id, { status: "approved" }); refreshEvents(); }}
                                className="text-[12px] font-semibold px-3 py-1.5 rounded-lg bg-accent text-white hover:bg-accent-hover transition-all">승인</button>
                              <button onClick={async () => { await api.updateEvent(event.id, { status: "rejected" }); refreshEvents(); }}
                                className="text-[12px] font-semibold px-3 py-1.5 rounded-lg bg-yellow-50 text-yellow-700 hover:bg-yellow-100 transition-all">반려</button>
                            </>
                          )}
                          {(() => {
                            const cnt = tournamentApps.filter(a => a.event_id === event.id).length;
                            return (
                              <button onClick={() => setApplicantsModal({ eventId: event.id, eventTitle: event.title })}
                                className="text-[12px] font-semibold px-3 py-1.5 rounded-lg bg-bg text-sub hover:bg-accent-light hover:text-accent transition-all whitespace-nowrap">
                                신청자 {cnt}명
                              </button>
                            );
                          })()}
                          <button onClick={() => setModal({ type: "edit", tab: "events", data: event as unknown as Record<string, unknown> })} className="text-muted hover:text-accent text-sm transition-colors">수정</button>
                          <button onClick={() => handleDelete("events", event.id)} className="text-muted hover:text-red text-sm transition-colors">삭제</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Notice List */}
        {activeTab === "notices" && (
          <div className="space-y-2">
            {notices.map((notice) => (
              <div key={notice.id} className="bg-white rounded-2xl p-5 border border-border-custom flex items-start justify-between">
                <div>
                  <h3 className="text-surface font-semibold text-base">
                    {(notice.pinned_rank || 0) > 0 && <span className="bg-accent text-white text-[10px] font-bold px-1.5 py-0.5 rounded mr-1.5 inline-flex items-center gap-0.5"><svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2z"/></svg>{notice.pinned_rank}</span>}
                    {notice.title}
                  </h3>
                  <p className="text-muted text-sm mt-1.5">{notice.content}</p>
                  <p className="text-muted text-xs mt-2">{notice.date}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <button onClick={() => setModal({ type: "edit", tab: "notices", data: notice as unknown as Record<string, unknown> })} className="text-muted hover:text-accent text-sm transition-colors">수정</button>
                  <button onClick={() => handleDelete("notices", notice.id)} className="text-muted hover:text-red text-sm transition-colors">삭제</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Banner Management */}
        {activeTab === "banners" && (
          <div className="space-y-6">
            {/* Main Banner */}
            {banners.filter(b => b.position === "main").map(banner => (
              <BannerEditor key={banner.id} banner={banner} label="메인 배너 (상단)" size="PC 2800x260 / 모바일 300x96" saving={bannerSaving === banner.id} onSave={handleBannerSave} hasMobile />
            ))}

            <h3 className="text-surface font-bold text-lg pt-4">사이드 배너</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {banners.filter(b => b.position.startsWith("side")).map((banner, i) => (
                <BannerEditor key={banner.id} banner={banner} label={`사이드 배너 ${i + 1}`} size="PC 2800x260 / 모바일 300x96" saving={bannerSaving === banner.id} onSave={handleBannerSave} hasMobile />
              ))}
            </div>
          </div>
        )}

        {/* Shorts Management */}
        {activeTab === "shorts" && (
          <div className="space-y-4">
            <ShortsEditor onSave={async (data) => { await api.createShort(data); refreshShorts(); }} />
            <h3 className="text-surface font-bold text-lg pt-2">등록된 숏츠 ({shorts.length}개)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {shorts.map((s) => (
                <div key={s.id} className="bg-white rounded-xl border border-border-custom overflow-hidden">
                  <div className="aspect-[9/16] max-h-64 bg-bg">
                    <video src={s.video_url} className="w-full h-full object-cover" muted />
                  </div>
                  <div className="p-4">
                    <h4 className="text-surface font-bold text-sm truncate">{s.title}</h4>
                    {s.description && <p className="text-muted text-xs mt-1 truncate">{s.description}</p>}
                    <div className="flex items-center justify-between mt-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${s.active ? "bg-accent-light text-accent" : "bg-bg text-muted"}`}>
                        {s.active ? "활성" : "비활성"}
                      </span>
                      <div className="flex items-center gap-2">
                        <label className="text-[11px] text-muted flex items-center gap-1" title="우선노출 순위">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2z"/></svg>
                          <input type="number" min={0} defaultValue={s.pinned_rank || 0}
                            onBlur={e => { const v = Number(e.target.value) || 0; if (v !== (s.pinned_rank || 0)) handlePinnedRankSet("shorts", s.id, v, refreshShorts); }}
                            className="w-12 border border-border-custom rounded px-1.5 py-0.5 text-[11px] text-center" />
                        </label>
                        <button onClick={async () => { await api.updateShort(s.id, { active: !s.active }); refreshShorts(); }} className="text-muted hover:text-accent text-xs">{s.active ? "비활성화" : "활성화"}</button>
                        <button onClick={() => handleShortDelete(s.id)} className="text-muted hover:text-red text-xs">삭제</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Users management */}
        {activeTab === "users" && (
          <div className="bg-white rounded-2xl border border-border-custom overflow-hidden">
            <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 bg-[#f9f9f9] border-b border-border-custom text-[12px] text-muted font-semibold">
              <div className="col-span-3">닉네임</div>
              <div className="col-span-4">이메일</div>
              <div className="col-span-2">가입일</div>
              <div className="col-span-1">상태</div>
              <div className="col-span-2 text-right">관리</div>
            </div>
            {users.length === 0 ? (
              <div className="text-center py-12 text-muted text-sm">등록된 회원이 없습니다</div>
            ) : (
              users.map(u => (
                <div key={u.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-5 py-4 border-b border-border-custom last:border-b-0 items-center">
                  <div className="md:col-span-3">
                    <p className="text-surface text-[14px] font-bold">{u.nickname}</p>
                    <p className="md:hidden text-muted text-[12px]">{u.email}</p>
                  </div>
                  <div className="hidden md:block md:col-span-4 text-sub text-[13px]">{u.email}</div>
                  <div className="hidden md:block md:col-span-2 text-muted text-[13px]">{u.created_at?.slice(0, 10)}</div>
                  <div className="md:col-span-1">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${u.is_blocked ? "bg-red-50 text-red-500" : "bg-accent-light text-accent"}`}>
                      {u.is_blocked ? "차단" : "정상"}
                    </span>
                  </div>
                  <div className="md:col-span-2 flex gap-2 justify-end">
                    <button onClick={() => handleBlockUser(u.id, !u.is_blocked)}
                      className={`text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-all ${u.is_blocked ? "bg-accent-light text-accent hover:bg-accent/20" : "bg-red-50 text-red-500 hover:bg-red-100"}`}>
                      {u.is_blocked ? "차단 해제" : "차단"}
                    </button>
                    <button onClick={() => handleDeleteUser(u.id)}
                      className="text-[12px] font-semibold px-3 py-1.5 rounded-lg bg-[#f5f6f8] text-muted hover:bg-red-50 hover:text-red-500 transition-all">
                      삭제
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Live games management */}
        {activeTab === "live" && (
          <div className="bg-white rounded-2xl border border-border-custom overflow-hidden">
            <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 bg-[#f9f9f9] border-b border-border-custom text-[12px] text-muted font-semibold">
              <div className="col-span-1">카테고리</div>
              <div className="col-span-3">제목</div>
              <div className="col-span-2">매장</div>
              <div className="col-span-2">상태</div>
              <div className="col-span-2">등록일</div>
              <div className="col-span-2 text-right">관리</div>
            </div>
            {liveGames.length === 0 ? (
              <div className="text-center py-12 text-muted text-sm">등록된 실시간 현황이 없습니다</div>
            ) : liveGames.map(g => (
              <div key={g.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-5 py-4 border-b border-border-custom last:border-b-0 items-center">
                <div className="md:col-span-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    g.category === "게임" ? "bg-blue-100 text-blue-600" :
                    g.category === "토너" ? "bg-emerald-100 text-emerald-700" :
                    g.category === "대회" ? "bg-red-100 text-red-600" :
                    "bg-amber-100 text-amber-700"
                  }`}>{g.category}</span>
                </div>
                <div className="md:col-span-3 text-surface text-[14px] font-bold">{g.title}</div>
                <div className="md:col-span-2 text-sub text-[13px]">{g.store_name}</div>
                <div className="md:col-span-2">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    g.status === "진행중" ? "bg-green-100 text-green-700" :
                    g.status === "대기중" ? "bg-yellow-100 text-yellow-700" :
                    "bg-gray-100 text-gray-600"
                  }`}>{g.status}</span>
                </div>
                <div className="md:col-span-2 text-muted text-[13px]">{g.created_at?.slice(0, 10)}</div>
                <div className="md:col-span-2 flex gap-2 justify-end items-center">
                  <label className="text-[11px] text-muted flex items-center gap-1" title="우선노출 순위">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2z"/></svg>
                    <input type="number" min={0} defaultValue={g.pinned_rank || 0}
                      onBlur={e => { const v = Number(e.target.value) || 0; if (v !== (g.pinned_rank || 0)) handlePinnedRankSet("live_games", g.id, v, refreshLiveGames); }}
                      className="w-12 border border-border-custom rounded px-1.5 py-0.5 text-[11px] text-center" />
                  </label>
                  <button onClick={() => setModal({ type: "edit", tab: "live", data: g as Record<string, unknown> })}
                    className="text-[12px] font-semibold px-3 py-1.5 rounded-lg bg-bg text-sub hover:bg-accent-light hover:text-accent transition-all">수정</button>
                  {g.status === "진행중" && (
                    <button onClick={() => handleEndLive(g.id)} className="text-[12px] font-semibold px-3 py-1.5 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition-all">종료</button>
                  )}
                  <button onClick={() => handleDeleteLive(g.id)} className="text-[12px] font-semibold px-3 py-1.5 rounded-lg bg-[#f5f6f8] text-muted hover:bg-red-50 hover:text-red-500 transition-all">삭제</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Promotions management */}
        {activeTab === "promotions" && (
          <div className="space-y-5">
            {/* Form */}
            <div className="bg-white rounded-2xl border border-border-custom p-6">
              <h3 className="text-surface font-bold text-lg mb-4">{promoEditing ? "이벤트 수정" : "새 이벤트 등록"}</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input className={inputClass} value={promoForm.title} onChange={e => setPromoForm(p => ({ ...p, title: e.target.value }))} placeholder="이벤트 제목 *" />
                  <div className="flex gap-2">
                    {["HOT", "NEW", "EVENT", "SALE"].map(b => (
                      <button key={b} type="button" onClick={() => setPromoForm(p => ({ ...p, badge: b }))}
                        className={`flex-1 py-2.5 rounded-xl text-[12px] font-bold border transition-all ${promoForm.badge === b ? "bg-accent text-white border-accent" : "border-border-custom text-sub"}`}>{b}</button>
                    ))}
                  </div>
                </div>
                <textarea className={inputClass + " resize-none"} rows={3} value={promoForm.content} onChange={e => setPromoForm(p => ({ ...p, content: e.target.value }))} placeholder="이벤트 내용 *" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input type="date" className={inputClass} value={promoForm.start_date} onChange={e => setPromoForm(p => ({ ...p, start_date: e.target.value }))} />
                  <input type="date" className={inputClass} value={promoForm.end_date} onChange={e => setPromoForm(p => ({ ...p, end_date: e.target.value }))} />
                  <input className={inputClass} value={promoForm.link} onChange={e => setPromoForm(p => ({ ...p, link: e.target.value }))} placeholder="링크 URL (선택)" />
                </div>
                <ImageUpload value={promoForm.image} onChange={v => setPromoForm(p => ({ ...p, image: v }))} folder="promotions" label="이벤트 이미지" hint="권장 1400x200px" />
                <div className="flex gap-2">
                  {promoEditing && <button onClick={() => { setPromoEditing(null); setPromoForm({ title: "", content: "", badge: "EVENT", start_date: "", end_date: "", image: "", link: "" }); }} className="px-5 py-2.5 rounded-xl border border-border-custom text-sub font-semibold">취소</button>}
                  <button onClick={handlePromoSubmit} disabled={promoSaving} className="bg-accent hover:bg-accent-hover text-white font-bold px-6 py-2.5 rounded-xl disabled:opacity-50 transition-all">
                    {promoSaving ? "저장 중..." : promoEditing ? "수정" : "등록"}
                  </button>
                </div>
              </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-2xl border border-border-custom overflow-hidden">
              {promotions.length === 0 ? (
                <div className="text-center py-12 text-muted text-sm">등록된 이벤트가 없습니다</div>
              ) : promotions.map(p => (
                <div key={p.id} className="flex items-center gap-4 px-5 py-4 border-b border-border-custom last:border-b-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {p.badge && <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${p.badge === "HOT" ? "bg-red-500 text-white" : p.badge === "NEW" ? "bg-accent text-white" : p.badge === "SALE" ? "bg-amber-500 text-white" : "bg-blue-500 text-white"}`}>{p.badge}</span>}
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${p.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{p.active ? "활성" : "비활성"}</span>
                    </div>
                    <p className="text-surface text-[14px] font-bold truncate">{p.title}</p>
                    <p className="text-muted text-[12px] truncate">{p.content}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <label className="text-[11px] text-muted flex items-center gap-1" title="우선노출 순위">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2z"/></svg>
                      <input type="number" min={0} defaultValue={p.pinned_rank || 0}
                        onBlur={e => { const v = Number(e.target.value) || 0; if (v !== (p.pinned_rank || 0)) handlePinnedRankSet("promotions", p.id, v, refreshPromotions); }}
                        className="w-12 border border-border-custom rounded px-1.5 py-0.5 text-[11px] text-center" />
                    </label>
                    <button onClick={() => { setPromoEditing(p.id); setPromoForm({ title: p.title, content: p.content, badge: p.badge || "EVENT", start_date: p.start_date || "", end_date: p.end_date || "", image: p.image || "", link: p.link || "" }); }}
                      className="text-[12px] font-semibold px-3 py-1.5 rounded-lg bg-[#f5f6f8] text-sub hover:bg-accent/10 hover:text-accent transition-all">수정</button>
                    <button onClick={() => handlePromoToggle(p.id, !p.active)}
                      className="text-[12px] font-semibold px-3 py-1.5 rounded-lg bg-[#f5f6f8] text-sub transition-all">{p.active ? "비활성" : "활성"}</button>
                    <button onClick={() => handlePromoDelete(p.id)}
                      className="text-[12px] font-semibold px-3 py-1.5 rounded-lg bg-[#f5f6f8] text-muted hover:bg-red-50 hover:text-red-500 transition-all">삭제</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Inquiries management */}
        {activeTab === "inquiries" && (
          <div className="bg-white rounded-2xl border border-border-custom overflow-hidden">
            {inquiries.length === 0 ? (
              <div className="text-center py-12 text-muted text-sm">접수된 매장 문의가 없습니다</div>
            ) : inquiries.map(inq => (
              <div key={inq.id} className="px-5 py-4 border-b border-border-custom last:border-b-0">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        inq.status === "approved" ? "bg-accent-light text-accent" :
                        inq.status === "rejected" ? "bg-red-50 text-red-500" :
                        "bg-yellow-50 text-yellow-700"
                      }`}>{inq.status === "approved" ? "승인됨" : inq.status === "rejected" ? "반려됨" : "대기중"}</span>
                      <span className="bg-accent/10 text-accent text-[11px] font-semibold px-2 py-0.5 rounded">{inq.region}</span>
                      <span className="text-muted text-[11px]">{inq.created_at?.slice(0, 16).replace("T", " ")}</span>
                    </div>
                    <p className="text-surface text-[15px] font-bold truncate">{inq.store_name}</p>
                    {inq.store_address && <p className="text-sub text-[13px] mt-0.5 truncate">📍 {inq.store_address}</p>}
                    <p className="text-muted text-[12px] mt-0.5">신청자: {inq.name} · {inq.phone}</p>
                    {inq.message && <p className="text-sub text-[13px] mt-2 bg-[#f9f9f9] rounded-lg p-3 whitespace-pre-wrap">{inq.message}</p>}
                    {inq.store_images && inq.store_images.length > 0 && (
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {inq.store_images.map((img, i) => (
                          <a key={i} href={img} target="_blank" rel="noopener noreferrer" className="block">
                            <img src={img} alt="" className="w-20 h-20 object-cover rounded-lg border border-border-custom hover:opacity-80 transition-opacity" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  {inq.status === "pending" && (
                    <>
                      <button onClick={() => handleInquiryApprove(inq)}
                        className="text-[12px] font-semibold px-3 py-1.5 rounded-lg bg-accent text-white hover:bg-accent-hover transition-all">
                        매장 등록하기
                      </button>
                      <button onClick={() => handleInquiryReject(inq.id)}
                        className="text-[12px] font-semibold px-3 py-1.5 rounded-lg bg-yellow-50 text-yellow-700 hover:bg-yellow-100 transition-all">
                        반려
                      </button>
                    </>
                  )}
                  <button onClick={() => handleInquiryDelete(inq.id)}
                    className="text-[12px] font-semibold px-3 py-1.5 rounded-lg bg-[#f5f6f8] text-muted hover:bg-red-50 hover:text-red-500 transition-all">
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Board management */}
        {activeTab === "board" && (
          <div className="bg-white rounded-2xl border border-border-custom overflow-hidden">
            {posts.length === 0 ? (
              <div className="text-center py-12 text-muted text-sm">등록된 게시글이 없습니다</div>
            ) : posts.map(p => (
              <div key={p.id} className={`border-b border-border-custom last:border-b-0 ${p.status === "hidden" ? "bg-red-50/30" : ""}`}>
                <div className="px-5 py-4 flex items-start justify-between gap-4">
                  <Link href={`/board/${p.id}`} target="_blank" className="flex-1 min-w-0 hover:bg-[#f9f9f9] -m-2 p-2 rounded-lg transition-colors">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      {p.status === "hidden" && <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">⚠️ 숨김</span>}
                      {p.pinned && <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-accent text-white"><svg className="w-3 h-3 inline-block align-middle mr-1" fill="currentColor" viewBox="0 0 24 24"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2z"/></svg>공지</span>}
                      {p.category && <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-bg text-sub">{p.category}</span>}
                      {(p.report_count ?? 0) > 0 && <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700"><svg className="w-3 h-3 inline-block align-middle mr-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2zm1 14h-2v2h2v-2zm0-6h-2v4h2v-4z"/></svg>신고 {p.report_count}</span>}
                      <span className="text-muted text-[11px]">{p.nickname} · 조회 {p.views}</span>
                      <span className="text-muted text-[11px]">{p.created_at?.slice(0, 10)}</span>
                    </div>
                    <p className="text-surface text-[14px] font-bold truncate">{p.title}</p>
                    <p className="text-muted text-[12px] truncate mt-0.5">{p.content}</p>
                    {p.hidden_reason && <p className="text-red-500 text-[11px] mt-1">숨김 사유: {p.hidden_reason}</p>}
                  </Link>
                  <div className="shrink-0 flex flex-col gap-1.5">
                    <button onClick={() => togglePostComments(p.id)}
                      className={`text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-all ${expandedPostId === p.id ? "bg-accent text-white" : "bg-bg text-sub hover:bg-accent-light hover:text-accent"}`}>
                      <svg className="w-3 h-3 inline-block align-middle mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>댓글 {expandedPostId === p.id ? "닫기" : "보기"}
                    </button>
                    <button onClick={() => handlePostToggleStatus(p.id, p.status || "approved")}
                      className={`text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-all ${p.status === "hidden" ? "bg-accent text-white hover:bg-accent-hover" : "bg-red-50 text-red-500 hover:bg-red-100"}`}>
                      {p.status === "hidden" ? "복구" : "숨기기"}
                    </button>
                    <button onClick={() => handlePostTogglePin(p.id, p.pinned)}
                      className={`text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-all ${p.pinned ? "bg-yellow-50 text-yellow-700 hover:bg-yellow-100" : "bg-bg text-sub hover:bg-accent-light hover:text-accent"}`}>
                      {p.pinned ? "공지 해제" : "공지 고정"}
                    </button>
                    <label className="text-[11px] text-muted flex items-center gap-1 px-2">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2z"/></svg>
                      <input type="number" min={0} defaultValue={(p as Post & { pinned_rank?: number }).pinned_rank || 0}
                        onBlur={e => { const v = Number(e.target.value) || 0; if (v !== ((p as Post & { pinned_rank?: number }).pinned_rank || 0)) handlePinnedRankSet("posts", p.id, v, refreshPosts); }}
                        className="w-12 border border-border-custom rounded px-1.5 py-0.5 text-[11px] text-center" title="우선노출 순위" />
                    </label>
                    <button onClick={() => handlePostDelete(p.id)}
                      className="text-[12px] font-semibold px-3 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-all">
                      삭제
                    </button>
                  </div>
                </div>
                {expandedPostId === p.id && (
                  <div className="bg-[#f9f9f9] border-t border-border-custom px-5 py-4">
                    <p className="text-sub text-[13px] font-bold mb-3">댓글 ({(postComments[p.id] || []).length})</p>
                    {(postComments[p.id] || []).length === 0 ? (
                      <p className="text-muted text-[12px] py-2">댓글이 없습니다</p>
                    ) : (
                      <div className="space-y-2">
                        {(postComments[p.id] || []).map(c => (
                          <div key={c.id} className="flex items-start justify-between gap-3 bg-white rounded-lg border border-border-custom px-4 py-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-surface text-[12px] font-semibold">{c.nickname}</span>
                                <span className="text-muted text-[11px]">{c.created_at?.slice(0, 16).replace("T", " ")}</span>
                              </div>
                              <p className="text-sub text-[13px] whitespace-pre-wrap break-all">{c.content}</p>
                            </div>
                            <button onClick={() => handleCommentDelete(p.id, c.id)}
                              className="shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-md bg-red-50 text-red-500 hover:bg-red-100 transition-all">
                              삭제
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Market management */}
        {activeTab === "market" && (
          <div className="bg-white rounded-2xl border border-border-custom overflow-hidden">
            {marketListings.length === 0 ? (
              <div className="text-center py-12 text-muted text-sm">등록된 매물이 없습니다</div>
            ) : marketListings.map(l => (
              <div key={l.id} className={`border-b border-border-custom last:border-b-0 ${l.is_hidden ? "bg-red-50/30" : ""}`}>
                <div className="px-5 py-4 flex items-start justify-between gap-4">
                  <Link href={`/market/${l.id}`} target="_blank" className="flex-1 min-w-0 hover:bg-[#f9f9f9] -m-2 p-2 rounded-lg transition-colors">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      {((l as MarketListing & { pinned_rank?: number }).pinned_rank || 0) > 0 && <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-accent text-white"><svg className="w-3 h-3 inline-block align-middle mr-1" fill="currentColor" viewBox="0 0 24 24"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2z"/></svg>{(l as MarketListing & { pinned_rank?: number }).pinned_rank}</span>}
                      {l.is_hidden && <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">⚠️ 숨김</span>}
                      {l.is_featured && <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-500"><svg className="w-3 h-3 inline-block align-middle mr-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l2.6 7.6h7.9l-6.4 4.7 2.4 7.7L12 17.3 5.5 22l2.4-7.7-6.4-4.7h7.9z"/></svg>추천</span>}
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        l.type === "매매" ? "bg-red-100 text-red-600" :
                        l.type === "대관" ? "bg-blue-100 text-blue-600" :
                        "bg-amber-100 text-amber-700"
                      }`}>{l.type}</span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${l.status === "모집중" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>{l.status || "모집중"}</span>
                      {(l.report_count ?? 0) > 0 && <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700"><svg className="w-3 h-3 inline-block align-middle mr-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2zm1 14h-2v2h2v-2zm0-6h-2v4h2v-4z"/></svg>신고 {l.report_count}</span>}
                      <span className="text-muted text-[11px]">{l.region}</span>
                      <span className="text-muted text-[11px]">{l.created_at?.slice(0, 10)}</span>
                    </div>
                    <p className="text-surface text-[14px] font-bold truncate">{l.title}</p>
                    <p className="text-accent text-[13px] font-bold mt-0.5">{l.price}</p>
                    <p className="text-muted text-[12px] truncate mt-0.5">{l.address} · {l.description}</p>
                  </Link>
                  <div className="shrink-0 flex flex-col gap-1.5">
                    <button onClick={() => setModal({ type: "edit", tab: "market", data: { ...l, images: l.images || [] } as unknown as Record<string, unknown> })}
                      className="text-[12px] font-semibold px-3 py-1.5 rounded-lg bg-bg text-sub hover:bg-accent-light hover:text-accent transition-all">
                      수정
                    </button>
                    <button onClick={() => handleMarketToggleFeatured(l.id, l.is_featured)}
                      className={`text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-all ${l.is_featured ? "bg-yellow-50 text-yellow-700 hover:bg-yellow-100" : "bg-bg text-sub hover:bg-red-50 hover:text-red-500"}`}>
                      {l.is_featured ? "추천 해제" : "추천"}
                    </button>
                    <button onClick={() => handleMarketToggleStatus(l.id, l.status || "모집중")}
                      className="text-[12px] font-semibold px-3 py-1.5 rounded-lg bg-bg text-sub hover:bg-accent-light hover:text-accent transition-all">
                      {l.status === "모집중" ? "거래완료" : "모집중으로"}
                    </button>
                    <button onClick={() => handleMarketToggleHide(l.id, l.is_hidden || false)}
                      className={`text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-all ${l.is_hidden ? "bg-accent text-white hover:bg-accent-hover" : "bg-red-50 text-red-500 hover:bg-red-100"}`}>
                      {l.is_hidden ? "공개" : "숨기기"}
                    </button>
                    <button onClick={() => handleMarketDelete(l.id)}
                      className="text-[12px] font-semibold px-3 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-all">
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Trade management */}
        {activeTab === "jobs" && (
          <div className="bg-white rounded-2xl border border-border-custom overflow-hidden">
            <div className="px-5 py-4 border-b border-border-custom flex items-center justify-between">
              <p className="text-muted text-sm">총 {jobs.length}건</p>
              <button onClick={() => setModal({ type: "create", tab: "jobs", data: { type: "구직", role: "딜러", contact_type: "전화", areas: [] } })}
                className="text-[12px] font-semibold px-3 py-1.5 rounded-lg bg-accent text-white hover:bg-accent-hover transition-all">+ 새 글 등록</button>
            </div>
            {jobs.length === 0 ? (
              <div className="text-center py-12 text-muted text-sm">등록된 구인구직 글이 없습니다</div>
            ) : jobs.map(j => (
              <div key={j.id} className="border-b border-border-custom last:border-b-0">
                <div className="px-5 py-4 flex items-start justify-between gap-4">
                  <Link href={`/jobs/${j.id}`} target="_blank" className="flex-1 min-w-0 hover:bg-[#f9f9f9] -m-2 p-2 rounded-lg transition-colors">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      {(j.pinned_rank || 0) > 0 && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-accent text-white"><svg className="w-3 h-3 inline-block align-middle mr-1" fill="currentColor" viewBox="0 0 24 24"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2z"/></svg>{j.pinned_rank}</span>
                      )}
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${j.type === "구인" ? "bg-blue-100 text-blue-600" : "bg-emerald-100 text-emerald-700"}`}>{j.type}</span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-bg text-sub">{j.role}</span>
                      {j.experience && <span className="text-muted text-[11px]">{j.experience}</span>}
                      <span className="text-muted text-[11px]">{j.created_at?.slice(0, 10)}</span>
                    </div>
                    <p className="text-surface text-[14px] font-bold truncate">{j.nickname}{j.store_name ? ` · ${j.store_name}` : ""}</p>
                    <p className="text-muted text-[12px] truncate mt-0.5">
                      {j.areas?.join(", ") || ""}
                      {j.salary ? ` · ${j.salary}` : ""}
                      {j.work_hours ? ` · ${j.work_hours}` : ""}
                    </p>
                    {j.message && <p className="text-muted text-[12px] truncate mt-0.5">{j.message}</p>}
                  </Link>
                  <div className="shrink-0 flex flex-col gap-1.5">
                    <button onClick={() => setModal({ type: "edit", tab: "jobs", data: { ...j, areas: j.areas || [] } as unknown as Record<string, unknown> })}
                      className="text-[12px] font-semibold px-3 py-1.5 rounded-lg bg-bg text-sub hover:bg-accent-light hover:text-accent transition-all">
                      수정
                    </button>
                    <button onClick={() => handleDelete("jobs", j.id)}
                      className="text-[12px] font-semibold px-3 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-all">
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "trade" && (
          <div className="bg-white rounded-2xl border border-border-custom overflow-hidden">
            {tradeItems.length === 0 ? (
              <div className="text-center py-12 text-muted text-sm">등록된 중고거래 상품이 없습니다</div>
            ) : tradeItems.map(t => (
              <div key={t.id} className="border-b border-border-custom last:border-b-0">
                <div className="px-5 py-4 flex items-start justify-between gap-4">
                  <Link href={`/trade/${t.id}`} target="_blank" className="flex-1 min-w-0 hover:bg-[#f9f9f9] -m-2 p-2 rounded-lg transition-colors">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      {((t as TradeItemRow & { pinned_rank?: number }).pinned_rank || 0) > 0 && <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-accent text-white"><svg className="w-3 h-3 inline-block align-middle mr-1" fill="currentColor" viewBox="0 0 24 24"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2z"/></svg>{(t as TradeItemRow & { pinned_rank?: number }).pinned_rank}</span>}
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        t.status === "판매중" ? "bg-emerald-100 text-emerald-700" :
                        t.status === "예약중" ? "bg-yellow-100 text-yellow-700" :
                        "bg-gray-200 text-gray-500"
                      }`}>{t.status || "판매중"}</span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-bg text-sub">{t.category}</span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-bg text-sub">{t.condition}</span>
                      <span className="text-muted text-[11px]">{t.nickname} · 조회 {t.views || 0}</span>
                      <span className="text-muted text-[11px]">{t.created_at?.slice(0, 10)}</span>
                    </div>
                    <p className="text-surface text-[14px] font-bold truncate">{t.title}</p>
                    <p className="text-accent text-[13px] font-bold mt-0.5">{t.price}</p>
                    <p className="text-muted text-[12px] truncate mt-0.5">{t.region} · {t.description}</p>
                  </Link>
                  <div className="shrink-0 flex flex-col gap-1.5">
                    <button onClick={() => setModal({ type: "edit", tab: "trade", data: { ...t, images: t.images || [] } as unknown as Record<string, unknown> })}
                      className="text-[12px] font-semibold px-3 py-1.5 rounded-lg bg-bg text-sub hover:bg-accent-light hover:text-accent transition-all">
                      수정
                    </button>
                    <button onClick={() => handleTradeStatus(t.id, t.status || "판매중")}
                      className="text-[12px] font-semibold px-3 py-1.5 rounded-lg bg-bg text-sub hover:bg-accent-light hover:text-accent transition-all">
                      상태 변경
                    </button>
                    <button onClick={() => handleTradeDelete(t.id)}
                      className="text-[12px] font-semibold px-3 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-all">
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Notice post modal */}
        {noticePostOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setNoticePostOpen(false)} />
            <div className="relative bg-white rounded-3xl p-8 border border-border-custom w-full max-w-xl max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-surface font-bold text-2xl"><svg className="w-3 h-3 inline-block align-middle mr-1" fill="currentColor" viewBox="0 0 24 24"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2z"/></svg>공지글 작성</h2>
                <button onClick={() => setNoticePostOpen(false)} className="text-muted hover:text-accent">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <p className="text-muted text-xs mb-5">자유게시판 상단에 고정됩니다. 작성자는 '관리자'로 표시됩니다.</p>
              <div className="space-y-4">
                <div>
                  <label className="text-sub text-sm font-medium block mb-2">제목 *</label>
                  <input className={inputClass} value={noticePostForm.title} onChange={e => setNoticePostForm(p => ({ ...p, title: e.target.value }))} placeholder="공지사항 제목" />
                </div>
                <div>
                  <label className="text-sub text-sm font-medium block mb-2">내용 *</label>
                  <textarea className={inputClass + " resize-none"} rows={8} value={noticePostForm.content} onChange={e => setNoticePostForm(p => ({ ...p, content: e.target.value }))} placeholder="공지 내용을 입력하세요" />
                </div>
                <ImageUpload value={noticePostForm.image} onChange={v => setNoticePostForm(p => ({ ...p, image: v }))} folder="posts" label="이미지" hint="선택" />
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setNoticePostOpen(false)} className="flex-1 bg-gray-100 border border-border-custom text-muted hover:text-accent px-4 py-3 rounded-xl text-base font-medium transition-colors">취소</button>
                  <button onClick={handleNoticePostSubmit} disabled={noticePostSaving}
                    className="flex-1 bg-accent hover:bg-accent-hover text-white px-4 py-3 rounded-xl text-base font-bold shadow-lg shadow-accent/20 disabled:opacity-50 transition-all">
                    {noticePostSaving ? "등록 중..." : "공지글 등록"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal */}
        {applicantsModal && (() => {
          const list = tournamentApps.filter(a => a.event_id === applicantsModal.eventId)
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setApplicantsModal(null)} />
              <div className="relative bg-white rounded-3xl p-6 md:p-8 border border-border-custom w-full max-w-2xl max-h-[85vh] overflow-y-auto">
                <div className="flex items-start justify-between gap-3 mb-5">
                  <div className="min-w-0">
                    <p className="text-muted text-[12px] mb-1">무료 토너먼트 신청자</p>
                    <h2 className="text-surface font-bold text-xl truncate">{applicantsModal.eventTitle}</h2>
                    <p className="text-accent text-[14px] font-bold mt-1">총 {list.length}명 신청</p>
                  </div>
                  <button onClick={() => setApplicantsModal(null)} className="text-muted hover:text-accent shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                {list.length === 0 ? (
                  <div className="text-center py-12 text-muted text-sm">아직 신청자가 없습니다</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border-custom">
                          <th className="text-left text-muted text-[12px] font-medium px-3 py-2">닉네임</th>
                          <th className="text-left text-muted text-[12px] font-medium px-3 py-2 hidden sm:table-cell">이메일</th>
                          <th className="text-left text-muted text-[12px] font-medium px-3 py-2 hidden sm:table-cell">전화</th>
                          <th className="text-right text-muted text-[12px] font-medium px-3 py-2">신청일시</th>
                        </tr>
                      </thead>
                      <tbody>
                        {list.map(a => (
                          <tr key={`${a.event_id}-${a.user_id}-${a.created_at}`} className="border-b border-border-custom/50">
                            <td className="px-3 py-2.5 text-surface text-[14px] font-semibold">{a.nickname}</td>
                            <td className="px-3 py-2.5 text-sub text-[13px] hidden sm:table-cell">{a.email?.includes("@phone.holdemmap") ? "(전화번호 가입)" : a.email}</td>
                            <td className="px-3 py-2.5 text-sub text-[13px] hidden sm:table-cell">{a.phone || "-"}</td>
                            <td className="px-3 py-2.5 text-muted text-[12px] text-right">{a.created_at?.slice(0, 16).replace("T", " ")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {modal && (
          <AdminModal modal={modal} stores={stores} saving={saving} onClose={() => setModal(null)} onSave={handleSave} />
        )}
      </main>
    </div>
  );
}

// ─── Modal Component ───
function AdminModal({ modal, stores, saving, onClose, onSave }: {
  modal: { type: "create" | "edit"; tab: Tab; data?: Record<string, unknown> };
  stores: Store[];
  saving: boolean;
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => void;
}) {
  const [form, setForm] = useState<Record<string, unknown>>(() => {
    const initial = modal.data || {};
    if (modal.tab === "events" && modal.type === "create" && !initial.details) {
      return { ...initial, details: EVENT_DEFAULT_NOTICE };
    }
    return initial;
  });
  const set = (key: string, value: unknown) => setForm(prev => ({ ...prev, [key]: value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl p-8 border border-border-custom w-full max-w-xl max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-surface font-bold text-2xl">{modal.type === "create" ? "새로 등록" : "수정"}</h2>
          <button onClick={onClose} className="text-muted hover:text-accent transition-colors p-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {modal.tab === "stores" && (
          <div className="space-y-5">
            <div>
              <label className="text-sub text-sm font-medium block mb-2">매장명 *</label>
              <input className={inputClass} value={(form.name as string) || ""} onChange={e => set("name", e.target.value)} placeholder="예: 로얄홀덤펍 강남점" />
            </div>
            <div>
              <label className="text-sub text-sm font-medium block mb-2">주소 (도로명) *</label>
              <input className={inputClass} value={(form.address as string) || ""} onChange={e => set("address", e.target.value)} placeholder="예: 서울 강남구 테헤란로 123" />
              <p className="text-muted text-xs mt-2">도로명 주소를 입력하면 지도 좌표가 자동으로 변환됩니다</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sub text-sm font-medium block mb-2">연락처</label>
                <input className={inputClass} value={(form.phone as string) || ""} onChange={e => set("phone", e.target.value)} placeholder="02-0000-0000" />
              </div>
              <div>
                <label className="text-sub text-sm font-medium block mb-2">영업시간</label>
                <input className={inputClass} value={(form.hours as string) || ""} onChange={e => set("hours", e.target.value)} placeholder="14:00 ~ 04:00" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sub text-sm font-medium block mb-2">지역 *</label>
                <Select value={(form.region as string) || "서울"} onChange={v => set("region", v)} options={[
                  { value: "서울", label: "서울" }, { value: "경기", label: "경기" }, { value: "인천", label: "인천" },
                  { value: "충청", label: "충청" }, { value: "경상", label: "경상" }, { value: "전라", label: "전라" },
                  { value: "강원", label: "강원" }, { value: "제주", label: "제주" },
                ]} />
              </div>
              <div>
                <label className="text-sub text-sm font-medium block mb-2">추천 매장</label>
                <Select value={(form.is_recommended as string) || "false"} onChange={v => set("is_recommended", v)} options={[
                  { value: "false", label: "아니오" }, { value: "true", label: "예" },
                ]} />
              </div>
            </div>
            <div>
              <label className="text-sub text-sm font-medium block mb-2"><svg className="w-3 h-3 inline-block align-middle mr-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2s1 4 4 6c2 1.3 3 3.5 3 6 0 3.9-3.1 7-7 7s-7-3.1-7-7c0-2 1-4 3-5-1 4 1 6 2 6-1-3 1-7 2-9 0 3 2 4 3 5 0-3-3-6-3-9z"/></svg>HOT 매장 (인기 매장 상단 노출)</label>
              <Select value={(form.is_hot as string) || "false"} onChange={v => set("is_hot", v)} options={[
                { value: "false", label: "아니오" }, { value: "true", label: "HOT 지정" },
              ]} />
            </div>
            <div>
              <label className="text-sub text-sm font-medium block mb-2">태그 (쉼표로 구분)</label>
              <input className={inputClass} value={(form.tags as string) || ""} onChange={e => set("tags", e.target.value)} placeholder="토너먼트, 초보환영, 주차가능" />
            </div>
            <div>
              <label className="text-sub text-sm font-medium block mb-2">매장 소개</label>
              <textarea className={inputClass + " resize-none"} rows={4} value={(form.description as string) || ""} onChange={e => set("description", e.target.value)} placeholder="매장에 대한 소개를 입력하세요" />
            </div>
            <div>
              <label className="text-sub text-sm font-medium block mb-2">매장 사진 <span className="text-muted font-normal">(최대 5장)</span></label>
              <div className="space-y-2">
                {((form.images as string[]) || []).map((img, i) => (
                  <div key={i} className="flex items-center gap-3 bg-[#f9f9f9] rounded-lg p-2.5">
                    <img src={img} alt="" className="w-16 h-16 object-cover rounded-lg" />
                    <button type="button" onClick={() => set("images", ((form.images as string[]) || []).filter((_, j) => j !== i))}
                      className="ml-auto text-red-500 text-[12px] font-semibold hover:text-red-600 px-2">삭제</button>
                  </div>
                ))}
                {((form.images as string[]) || []).length < 5 && (
                  <ImageUpload
                    value=""
                    onChange={v => { if (v) set("images", [...((form.images as string[]) || []), v]); }}
                    folder="stores"
                    label={((form.images as string[]) || []).length === 0 ? "사진 업로드" : "사진 추가"}
                    aspect="aspect-video"
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {modal.tab === "events" && (
          <div className="space-y-5">
            <div>
              <label className="text-sub text-sm font-medium block mb-2">대회/이벤트 제목 *</label>
              <input className={inputClass} value={(form.title as string) || ""} onChange={e => set("title", e.target.value)} placeholder="예: 주말 GTD 토너먼트" />
            </div>
            <div>
              <label className="text-sub text-sm font-medium block mb-2">국내/해외 *</label>
              <div className="flex gap-2">
                <button type="button" onClick={() => set("is_international", false)}
                  className={`flex-1 py-2.5 rounded-xl text-[14px] font-semibold border transition-all inline-flex items-center justify-center gap-1.5 ${!form.is_international ? "bg-accent text-white border-accent" : "border-border-custom text-sub"}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 3a14 14 0 010 18" /></svg>
                  국내
                </button>
                <button type="button" onClick={() => set("is_international", true)}
                  className={`flex-1 py-2.5 rounded-xl text-[14px] font-semibold border transition-all inline-flex items-center justify-center gap-1.5 ${form.is_international ? "bg-accent text-white border-accent" : "border-border-custom text-sub"}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" /></svg>
                  해외
                </button>
              </div>
            </div>
            <div>
              <label className="text-sub text-sm font-medium block mb-2">장소 *</label>
              <input className={inputClass} value={(form.location as string) || ""} onChange={e => set("location", e.target.value)} placeholder="예: OO호텔 그랜드볼룸, 서울 강남구 ○○로 123" />
              <p className="text-muted text-xs mt-1.5">매장/호텔/대관장 등 대회가 열리는 장소</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sub text-sm font-medium block mb-2">시작일 *</label>
                <input className={inputClass} type="date" value={(form.date as string) || ""} onChange={e => set("date", e.target.value)} />
              </div>
              <div>
                <label className="text-sub text-sm font-medium block mb-2">종료일 <span className="text-muted font-normal">(선택)</span></label>
                <input className={inputClass} type="date" value={(form.end_date as string) || ""} onChange={e => set("end_date", e.target.value)} />
              </div>
              <div>
                <label className="text-sub text-sm font-medium block mb-2">시간 *</label>
                <input className={inputClass} type="time" value={(form.time as string) || ""} onChange={e => set("time", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sub text-sm font-medium block mb-2">상금</label>
                <input className={inputClass} value={(form.prize as string) || ""} onChange={e => set("prize", e.target.value)} placeholder="예: GTD 300만원" />
              </div>
              <div>
                <label className="text-sub text-sm font-medium block mb-2">바이인</label>
                <input className={inputClass} value={(form.buy_in as string) || ""} onChange={e => set("buy_in", e.target.value)} placeholder="예: 50,000원" />
              </div>
            </div>
            <ImageUpload value={(form.image as string) || ""} onChange={v => set("image", v)} folder="events" label="대회 이미지" hint="선택" />
            <div>
              <label className="text-sub text-sm font-medium block mb-2">간단 설명</label>
              <textarea className={inputClass + " resize-none"} rows={3} value={(form.description as string) || ""} onChange={e => set("description", e.target.value)} placeholder="대회 간략 소개" />
            </div>
            <div>
              <label className="text-sub text-sm font-medium block mb-2">내용 이미지 <span className="text-muted font-normal">(선택, 최대 8장)</span></label>
              <div className="space-y-2">
                {((form.content_images as string[]) || []).length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {((form.content_images as string[]) || []).map((img, i) => (
                      <div key={i} className="relative aspect-video rounded-lg overflow-hidden border border-border-custom bg-bg">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => set("content_images", ((form.content_images as string[]) || []).filter((_, j) => j !== i))}
                          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md opacity-90 hover:opacity-100 hover:bg-red-600 transition-all">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {((form.content_images as string[]) || []).length < 8 && (
                  <ImageUpload value="" onChange={v => v && set("content_images", [...((form.content_images as string[]) || []), v])} folder="events" label={((form.content_images as string[]) || []).length === 0 ? "이미지 업로드" : "이미지 추가"} aspect="aspect-video" hint={`${((form.content_images as string[]) || []).length}/8`} />
                )}
              </div>
            </div>
            <div>
              <label className="text-sub text-sm font-medium block mb-2">상세 정보</label>
              <textarea className={inputClass + " resize-none"} rows={5} value={(form.details as string) || ""} onChange={e => set("details", e.target.value)} placeholder="룰, 시간표, 참가 방법 등 상세 내용" />
            </div>
          </div>
        )}

        {modal.tab === "notices" && (
          <div className="space-y-5">
            <div>
              <label className="text-sub text-sm font-medium block mb-2">제목 *</label>
              <input className={inputClass} value={(form.title as string) || ""} onChange={e => set("title", e.target.value)} placeholder="공지사항 제목을 입력하세요" />
            </div>
            <div>
              <label className="text-sub text-sm font-medium block mb-2">날짜</label>
              <input className={inputClass} type="date" value={(form.date as string) || new Date().toISOString().slice(0, 10)} onChange={e => set("date", e.target.value)} />
            </div>
            <div>
              <label className="text-sub text-sm font-medium block mb-2">내용 *</label>
              <textarea className={inputClass + " resize-none"} rows={6} value={(form.content as string) || ""} onChange={e => set("content", e.target.value)} placeholder="공지사항 내용을 입력하세요" />
            </div>
            <ImageUpload value={(form.image as string) || ""} onChange={v => set("image", v)} folder="notices" label="이미지" hint="선택" />
          </div>
        )}

        {modal.tab === "market" && (
          <div className="space-y-5">
            <div>
              <label className="text-sub text-sm font-medium block mb-2">거래 유형 *</label>
              <div className="flex gap-2">
                {["매매", "대관", "단기운영"].map(t => (
                  <button key={t} type="button" onClick={() => set("type", t)}
                    className={`flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition-all border ${(form.type as string) === t ? "bg-accent text-white border-accent" : "border-border-custom text-sub"}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sub text-sm font-medium block mb-2">매물명 *</label>
              <input className={inputClass} value={(form.title as string) || ""} onChange={e => set("title", e.target.value)} placeholder="예: 강남 홀덤펍 매매" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sub text-sm font-medium block mb-2">지역 *</label>
                <Select value={(form.region as string) || "서울"} onChange={v => set("region", v)} options={[
                  { value: "서울", label: "서울" }, { value: "경기", label: "경기" }, { value: "인천", label: "인천" },
                ]} />
              </div>
              <div>
                <label className="text-sub text-sm font-medium block mb-2">상세 주소</label>
                <input className={inputClass} value={(form.address as string) || ""} onChange={e => set("address", e.target.value)} placeholder="예: 강남구 역삼동" />
              </div>
            </div>
            <div>
              <label className="text-sub text-sm font-medium block mb-2">가격</label>
              <input className={inputClass} value={(form.price as string) || ""} onChange={e => set("price", e.target.value)} placeholder="예: 권리금 3000만 / 1일 30만 / 협의" />
            </div>
            <div>
              <label className="text-sub text-sm font-medium block mb-2">상세 내용</label>
              <textarea className={inputClass + " resize-none"} rows={5} value={(form.description as string) || ""} onChange={e => set("description", e.target.value)} placeholder="매장 규모, 시설 현황, 운영 가능 시간 등" />
            </div>
            <div>
              <label className="text-sub text-sm font-medium block mb-2">연락처</label>
              <input className={inputClass} value={(form.contact as string) || ""} onChange={e => set("contact", e.target.value)} placeholder="카카오톡 ID 또는 전화번호" />
            </div>
            <div>
              <label className="text-sub text-sm font-medium block mb-2">매물 사진 <span className="text-muted font-normal">(최대 8장)</span></label>
              <div className="space-y-2">
                {((form.images as string[]) || []).map((img, i) => (
                  <div key={i} className="flex items-center gap-3 bg-[#f9f9f9] rounded-lg p-2.5">
                    <img src={img} alt="" className="w-16 h-16 object-cover rounded-lg" />
                    <button type="button" onClick={() => set("images", ((form.images as string[]) || []).filter((_, j) => j !== i))}
                      className="ml-auto text-red-500 text-[12px] font-semibold hover:text-red-600 px-2">삭제</button>
                  </div>
                ))}
                {((form.images as string[]) || []).length < 8 && (
                  <ImageUpload
                    value=""
                    onChange={v => { if (v) set("images", [...((form.images as string[]) || []), v]); }}
                    folder="market"
                    label={((form.images as string[]) || []).length === 0 ? "사진 업로드" : "사진 추가"}
                    aspect="aspect-video"
                  />
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sub text-sm font-medium block mb-2">상태</label>
                <Select value={(form.status as string) || "모집중"} onChange={v => set("status", v)} options={[
                  { value: "모집중", label: "모집중" }, { value: "거래완료", label: "거래완료" },
                ]} />
              </div>
              <div>
                <label className="text-sub text-sm font-medium block mb-2">추천 매물</label>
                <Select value={form.is_featured ? "true" : "false"} onChange={v => set("is_featured", v === "true")} options={[
                  { value: "false", label: "아니오" }, { value: "true", label: "예" },
                ]} />
              </div>
            </div>
          </div>
        )}

        {modal.tab === "trade" && (
          <div className="space-y-5">
            <div>
              <label className="text-sub text-sm font-medium block mb-2">상품명 *</label>
              <input className={inputClass} value={(form.title as string) || ""} onChange={e => set("title", e.target.value)} placeholder="예: 포커 플라스틱 카드 2덱" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sub text-sm font-medium block mb-2">카테고리</label>
                <Select value={(form.category as string) || "기타"} onChange={v => set("category", v)} options={[
                  { value: "카드", label: "카드" }, { value: "칩", label: "칩" }, { value: "테이블", label: "테이블" },
                  { value: "악세서리", label: "악세서리" }, { value: "기타", label: "기타" },
                ]} />
              </div>
              <div>
                <label className="text-sub text-sm font-medium block mb-2">상품 상태</label>
                <Select value={(form.condition as string) || "중고"} onChange={v => set("condition", v)} options={[
                  { value: "새상품", label: "새상품" }, { value: "거의새것", label: "거의새것" },
                  { value: "중고", label: "중고" }, { value: "하자있음", label: "하자있음" },
                ]} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sub text-sm font-medium block mb-2">가격</label>
                <input className={inputClass} value={(form.price as string) || ""} onChange={e => set("price", e.target.value)} placeholder="예: 30,000원 또는 협의" />
              </div>
              <div>
                <label className="text-sub text-sm font-medium block mb-2">거래 지역</label>
                <input className={inputClass} value={(form.region as string) || ""} onChange={e => set("region", e.target.value)} placeholder="예: 서울 강남" />
              </div>
            </div>
            <div>
              <label className="text-sub text-sm font-medium block mb-2">상세 설명</label>
              <textarea className={inputClass + " resize-none"} rows={5} value={(form.description as string) || ""} onChange={e => set("description", e.target.value)} placeholder="상품 상태, 구매 시기 등" />
            </div>
            <div>
              <label className="text-sub text-sm font-medium block mb-2">연락처</label>
              <input className={inputClass} value={(form.contact as string) || ""} onChange={e => set("contact", e.target.value)} placeholder="카카오톡 ID 또는 전화번호" />
            </div>
            <div>
              <label className="text-sub text-sm font-medium block mb-2">상품 사진 <span className="text-muted font-normal">(최대 8장)</span></label>
              <div className="space-y-2">
                {((form.images as string[]) || []).map((img, i) => (
                  <div key={i} className="flex items-center gap-3 bg-[#f9f9f9] rounded-lg p-2.5">
                    <img src={img} alt="" className="w-16 h-16 object-cover rounded-lg" />
                    <button type="button" onClick={() => set("images", ((form.images as string[]) || []).filter((_, j) => j !== i))}
                      className="ml-auto text-red-500 text-[12px] font-semibold hover:text-red-600 px-2">삭제</button>
                  </div>
                ))}
                {((form.images as string[]) || []).length < 8 && (
                  <ImageUpload
                    value=""
                    onChange={v => { if (v) set("images", [...((form.images as string[]) || []), v]); }}
                    folder="trade"
                    label={((form.images as string[]) || []).length === 0 ? "사진 업로드" : "사진 추가"}
                    aspect="aspect-square"
                  />
                )}
              </div>
            </div>
            <div>
              <label className="text-sub text-sm font-medium block mb-2">판매 상태</label>
              <Select value={(form.status as string) || "판매중"} onChange={v => set("status", v)} options={[
                { value: "판매중", label: "판매중" }, { value: "예약중", label: "예약중" }, { value: "판매완료", label: "판매완료" },
              ]} />
            </div>
          </div>
        )}

        {modal.tab === "jobs" && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sub text-sm font-medium block mb-2">유형 *</label>
                <Select value={(form.type as string) || "구직"} onChange={v => set("type", v)} options={[
                  { value: "구직", label: "구직 (일자리 찾아요)" }, { value: "구인", label: "구인 (사람 구해요)" },
                ]} />
              </div>
              <div>
                <label className="text-sub text-sm font-medium block mb-2">역할 *</label>
                <Select value={(form.role as string) || "딜러"} onChange={v => set("role", v)} options={[
                  { value: "딜러", label: "딜러" }, { value: "플로어", label: "플로어" }, { value: "서빙", label: "서빙" },
                  { value: "매니저", label: "매니저" }, { value: "기타", label: "기타" },
                ]} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sub text-sm font-medium block mb-2">닉네임/상호 *</label>
                <input className={inputClass} value={(form.nickname as string) || ""} onChange={e => set("nickname", e.target.value)} placeholder="예: 홀덤러버 / OO홀덤펍" />
              </div>
              <div>
                <label className="text-sub text-sm font-medium block mb-2">매장명 <span className="text-muted font-normal">(구인 시)</span></label>
                <input className={inputClass} value={(form.store_name as string) || ""} onChange={e => set("store_name", e.target.value)} placeholder="예: OO홀덤펍 강남점" />
              </div>
            </div>
            <div>
              <label className="text-sub text-sm font-medium block mb-2">지역 <span className="text-muted font-normal">(쉼표로 구분)</span></label>
              <input className={inputClass}
                value={Array.isArray(form.areas) ? (form.areas as string[]).join(", ") : ((form.areas as string) || "")}
                onChange={e => set("areas", e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
                placeholder="예: 서울 강남, 서울 홍대" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sub text-sm font-medium block mb-2">경력</label>
                <input className={inputClass} value={(form.experience as string) || ""} onChange={e => set("experience", e.target.value)} placeholder="예: 2년" />
              </div>
              <div>
                <label className="text-sub text-sm font-medium block mb-2">성별 <span className="text-muted font-normal">(선택)</span></label>
                <Select value={(form.gender as string) || ""} onChange={v => set("gender", v)} options={[
                  { value: "", label: "무관" }, { value: "남", label: "남" }, { value: "여", label: "여" },
                ]} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sub text-sm font-medium block mb-2">급여</label>
                <input className={inputClass} value={(form.salary as string) || ""} onChange={e => set("salary", e.target.value)} placeholder="예: 시급 15,000원" />
              </div>
              <div>
                <label className="text-sub text-sm font-medium block mb-2">근무시간</label>
                <input className={inputClass} value={(form.work_hours as string) || ""} onChange={e => set("work_hours", e.target.value)} placeholder="예: 18:00~02:00" />
              </div>
              <div>
                <label className="text-sub text-sm font-medium block mb-2">인원</label>
                <input className={inputClass} value={(form.headcount as string) || ""} onChange={e => set("headcount", e.target.value)} placeholder="예: 2명" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sub text-sm font-medium block mb-2">연락 수단</label>
                <Select value={(form.contact_type as string) || "전화"} onChange={v => set("contact_type", v)} options={[
                  { value: "전화", label: "전화" }, { value: "문자", label: "문자" }, { value: "카카오톡", label: "카카오톡" }, { value: "텔레그램", label: "텔레그램" },
                ]} />
              </div>
              <div className="md:col-span-2">
                <label className="text-sub text-sm font-medium block mb-2">연락처</label>
                <input className={inputClass} value={(form.contact as string) || ""} onChange={e => set("contact", e.target.value)} placeholder="예: 010-0000-0000 / 카카오톡 ID" />
              </div>
            </div>
            <div>
              <label className="text-sub text-sm font-medium block mb-2">메시지/상세</label>
              <textarea className={inputClass + " resize-none"} rows={4} value={(form.message as string) || ""} onChange={e => set("message", e.target.value)} placeholder="자기소개 또는 구인 상세 내용" />
            </div>
            <JobAvatarPicker
              value={(form.photo as string) || ""}
              onChange={v => set("photo", v)}
              role={(form.role as string) || ""}
              gender={(form.gender as string) || ""}
            />
          </div>
        )}

        {modal.tab === "live" && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sub text-sm font-medium block mb-2">매장명 *</label>
                <input className={inputClass} value={(form.store_name as string) || ""} onChange={e => set("store_name", e.target.value)} placeholder="예: 강남홀덤펍" />
              </div>
              <div>
                <label className="text-sub text-sm font-medium block mb-2">카테고리 *</label>
                <Select value={(form.category as string) || "토너"} onChange={v => set("category", v)} options={[
                  { value: "게임", label: "게임" }, { value: "토너", label: "토너" }, { value: "대회", label: "대회" }, { value: "레이크", label: "레이크" },
                ]} />
              </div>
            </div>
            <div>
              <label className="text-sub text-sm font-medium block mb-2">제목 *</label>
              <input className={inputClass} value={(form.title as string) || ""} onChange={e => set("title", e.target.value)} placeholder="예: NLH 1/2 캐시게임, 주말 토너먼트" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sub text-sm font-medium block mb-2">블라인드</label>
                <input className={inputClass} value={(form.blind as string) || ""} onChange={e => set("blind", e.target.value)} placeholder="1/2" />
              </div>
              <div>
                <label className="text-sub text-sm font-medium block mb-2">바이인</label>
                <input className={inputClass} value={(form.buy_in as string) || ""} onChange={e => set("buy_in", e.target.value)} placeholder="100,000" />
              </div>
              <div>
                <label className="text-sub text-sm font-medium block mb-2">{(form.category as string) === "레이크" ? "레이크" : "프라이즈"}</label>
                <input className={inputClass}
                  value={((form.category as string) === "레이크" ? (form.rake as string) : (form.prize as string)) || ""}
                  onChange={e => set((form.category as string) === "레이크" ? "rake" : "prize", e.target.value)}
                  placeholder={(form.category as string) === "레이크" ? "5%" : "GTD 100만"} />
              </div>
              <div>
                <label className="text-sub text-sm font-medium block mb-2">상태</label>
                <Select value={(form.status as string) || "진행중"} onChange={v => set("status", v)} options={[
                  { value: "진행중", label: "진행중" }, { value: "대기중", label: "대기중" }, { value: "마감", label: "마감" }, { value: "종료", label: "종료" },
                ]} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sub text-sm font-medium block mb-2">현재 인원</label>
                <input className={inputClass} type="number" min={0} value={(form.players_current as number) ?? 0} onChange={e => set("players_current", Number(e.target.value) || 0)} />
              </div>
              <div>
                <label className="text-sub text-sm font-medium block mb-2">최대 인원</label>
                <input className={inputClass} type="number" min={0} value={(form.players_max as number) ?? 0} onChange={e => set("players_max", Number(e.target.value) || 0)} />
              </div>
            </div>
            <div>
              <label className="text-sub text-sm font-medium block mb-2">설명</label>
              <textarea className={inputClass + " resize-none"} rows={3} value={(form.description as string) || ""} onChange={e => set("description", e.target.value)} placeholder="추가 정보 (선택)" />
            </div>
            <ImageUpload value={(form.image as string) || ""} onChange={v => set("image", v)} folder="live" label="포스터 이미지" hint="선택" />
            <div className="space-y-2">
              <label className="text-sub text-sm font-medium block mb-1">연락처 <span className="text-muted font-normal">(선택)</span></label>
              <div className="flex items-center gap-2">
                <span className="w-16 text-[12px] font-semibold shrink-0">카카오톡</span>
                <input className={inputClass} value={(form.contact_kakao as string) || ""} onChange={e => set("contact_kakao", e.target.value)} placeholder="카톡 ID" />
              </div>
              <div className="flex items-center gap-2">
                <span className="w-16 text-[12px] font-semibold shrink-0">텔레그램</span>
                <input className={inputClass} value={(form.contact_telegram as string) || ""} onChange={e => set("contact_telegram", e.target.value)} placeholder="텔레 ID" />
              </div>
              <div className="flex items-center gap-2">
                <span className="w-16 text-[12px] font-semibold shrink-0">전화번호</span>
                <input className={inputClass} value={(form.contact_phone as string) || ""} onChange={e => set("contact_phone", e.target.value)} placeholder="01012345678" />
              </div>
            </div>
          </div>
        )}

        {["stores", "events", "notices", "market", "trade", "jobs", "live"].includes(modal.tab) && (
          <div className="mt-5 pt-5 border-t border-border-custom">
            <label className="text-sub text-sm font-medium block mb-2"><svg className="w-3 h-3 inline-block align-middle mr-1" fill="currentColor" viewBox="0 0 24 24"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2z"/></svg>우선노출 순위 <span className="text-muted font-normal">(0=일반, 숫자 클수록 상단 고정)</span></label>
            <input className={inputClass} type="number" min={0} value={(form.pinned_rank as number) ?? 0} onChange={e => set("pinned_rank", Number(e.target.value) || 0)} />
          </div>
        )}

        <div className="flex gap-4 mt-8">
          <button onClick={onClose} className="flex-1 bg-gray-100 border border-border-custom text-muted hover:text-accent px-4 py-3 rounded-xl text-base font-medium transition-colors">취소</button>
          <button onClick={() => onSave(form)} disabled={saving} className="flex-1 bg-accent hover:bg-accent-hover text-white px-4 py-3 rounded-xl text-base font-bold shadow-lg shadow-accent/20 disabled:opacity-50 transition-all">
            {saving ? "저장 중..." : modal.type === "create" ? "등록하기" : "수정하기"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Banner Editor ───
function BannerEditor({ banner, label, size, saving, onSave, hasMobile }: {
  banner: import("@/types").Banner & { title?: string; description?: string; contact?: string; detail_images?: string[]; links?: import("@/types").BannerLink[] };
  label: string;
  size: string;
  saving: boolean;
  onSave: (id: string, image: string, link: string, title?: string, description?: string, contact?: string, detail_images?: string[], links?: import("@/types").BannerLink[], pinned_rank?: number, image_mobile?: string) => void;
  hasMobile?: boolean;
}) {
  const [image, setImage] = useState(banner.image || "");
  const [imageMobile, setImageMobile] = useState(banner.image_mobile || "");
  const [link, setLink] = useState(banner.link || "");
  const [detailImages, setDetailImages] = useState<string[]>(banner.detail_images || []);
  const [title, setTitle] = useState(banner.title || "");
  const [description, setDescription] = useState(banner.description || "");
  const [contact, setContact] = useState(banner.contact || "");
  const [links, setLinks] = useState<import("@/types").BannerLink[]>(banner.links || []);
  const [pinnedRank, setPinnedRank] = useState<number>(banner.pinned_rank ?? 0);
  const inputClass = "w-full bg-white border border-border-custom rounded-xl px-4 py-3 text-base text-surface focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all placeholder:text-muted";

  return (
    <div className="bg-white rounded-2xl border border-border-custom p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-surface font-bold text-base flex items-center gap-2">
            {pinnedRank > 0 && <span className="bg-accent text-white text-[10px] font-bold px-1.5 py-0.5 rounded"><svg className="w-3 h-3 inline-block align-middle mr-1" fill="currentColor" viewBox="0 0 24 24"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2z"/></svg>{pinnedRank}</span>}
            {label}
          </h4>
          <p className="text-muted text-sm mt-0.5">권장 사이즈: <span className="text-accent font-semibold">{size}</span></p>
        </div>
        <button onClick={() => onSave(banner.id, image, link, title, description, contact, detailImages, links, pinnedRank, imageMobile)} disabled={saving}
          className="bg-accent hover:bg-accent-hover text-white text-sm font-bold px-5 py-2 rounded-lg transition-all disabled:opacity-50">
          {saving ? "저장 중..." : "저장"}
        </button>
      </div>

      <div className="space-y-4">
        <ImageUpload value={image} onChange={setImage} folder="banners" label={hasMobile ? "PC 배너 이미지" : "배너 이미지"} aspect="aspect-[4/1]" hint={hasMobile ? "권장 2800x260 (또는 1400x130)" : size} />
        {hasMobile && (
          <ImageUpload value={imageMobile} onChange={setImageMobile} folder="banners" label="모바일 배너 이미지 (선택)" aspect="aspect-[300/96]" hint="권장 300x96 — 비워두면 PC 이미지를 사용" />
        )}

        <div>
          <label className="text-sub text-sm font-medium block mb-2">제목 <span className="text-muted font-normal">(배너 상세 페이지에 표시)</span></label>
          <input className={inputClass} value={title} onChange={e => setTitle(e.target.value)} placeholder="예: 골프 여행 특가 안내" />
        </div>

        <div>
          <label className="text-sub text-sm font-medium block mb-2">상세 설명</label>
          <textarea className={inputClass + " resize-none"} rows={4} value={description} onChange={e => setDescription(e.target.value)} placeholder="배너 상세 페이지에 표시될 설명 (여행 코스, 혜택 등)" />
        </div>

        <div>
          <label className="text-sub text-sm font-medium block mb-2">연락처</label>
          <input className={inputClass} value={contact} onChange={e => setContact(e.target.value)} placeholder="전화번호, 카톡 ID 등" />
        </div>

        <div>
          <label className="text-sub text-sm font-medium block mb-2">외부 링크 URL <span className="text-muted font-normal">(선택, 상세 페이지 대신 바로 이동)</span></label>
          <input className={inputClass} value={link} onChange={e => setLink(e.target.value)} placeholder="https://example.com" />
        </div>

        <div>
          <label className="text-sub text-sm font-medium block mb-2">상세 페이지 링크 버튼 <span className="text-muted font-normal">(선택, 여러 개 추가 가능)</span></label>
          <div className="space-y-2">
            {links.map((l, i) => (
              <div key={i} className="flex items-center gap-2">
                <input className={inputClass + " flex-1"} value={l.label} onChange={e => setLinks(prev => prev.map((p, j) => j === i ? { ...p, label: e.target.value } : p))} placeholder="버튼 이름 (예: 예약하기)" />
                <input className={inputClass + " flex-[2]"} value={l.url} onChange={e => setLinks(prev => prev.map((p, j) => j === i ? { ...p, url: e.target.value } : p))} placeholder="https://example.com" />
                <button onClick={() => setLinks(prev => prev.filter((_, j) => j !== i))} className="text-red-400 text-[12px] font-semibold hover:text-red-500 px-2">삭제</button>
              </div>
            ))}
            <button onClick={() => setLinks(prev => [...prev, { label: "", url: "" }])} className="text-accent text-[13px] font-semibold hover:underline">+ 링크 버튼 추가</button>
          </div>
        </div>

        <div>
          <label className="text-sub text-sm font-medium block mb-2">상세 페이지 이미지 <span className="text-muted font-normal">(최대 5장)</span></label>
          <div className="space-y-2">
            {detailImages.map((img, i) => (
              <div key={i} className="flex items-center gap-2">
                <img src={img} alt="" className="w-16 h-16 object-cover rounded-lg" />
                <button onClick={() => setDetailImages(prev => prev.filter((_, j) => j !== i))} className="text-red-400 text-[12px] font-semibold hover:text-red-500">삭제</button>
              </div>
            ))}
            {detailImages.length < 5 && (
              <ImageUpload
                value=""
                onChange={v => { if (v) setDetailImages(prev => [...prev, v]); }}
                folder="banners-detail"
                label="이미지 추가"
              />
            )}
          </div>
        </div>

        <div>
          <label className="text-sub text-sm font-medium block mb-2"><svg className="w-3 h-3 inline-block align-middle mr-1" fill="currentColor" viewBox="0 0 24 24"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2z"/></svg>우선노출 순위 <span className="text-muted font-normal">(0=일반, 숫자 클수록 같은 위치 배너들 중 상단 고정)</span></label>
          <input className={inputClass} type="number" min={0} value={pinnedRank} onChange={e => setPinnedRank(Number(e.target.value) || 0)} />
        </div>
      </div>
    </div>
  );
}

// ─── Shorts Editor ───
function ShortsEditor({ onSave }: { onSave: (data: Omit<import("@/types").Short, "id" | "created_at">) => Promise<void> }) {
  const [form, setForm] = useState({ title: "", video_url: "", thumbnail: "", description: "", sort_order: 0, active: true });
  const [saving, setSaving] = useState(false);
  const inputClass = "w-full bg-white border border-border-custom rounded-xl px-4 py-3 text-base text-surface focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all placeholder:text-muted";

  const handleSubmit = async () => {
    if (!form.title || !form.video_url) { alert("제목과 영상 URL을 입력해주세요."); return; }
    setSaving(true);
    await onSave(form);
    setForm({ title: "", video_url: "", thumbnail: "", description: "", sort_order: 0, active: true });
    setSaving(false);
  };

  return (
    <div className="bg-white rounded-xl border border-border-custom p-6">
      <h3 className="text-surface font-bold text-lg mb-4">새 숏츠 등록</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-sub text-sm font-medium block mb-2">제목 *</label>
          <input className={inputClass} value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="숏츠 제목" />
        </div>
        <div>
          <label className="text-sub text-sm font-medium block mb-2">정렬 순서</label>
          <input className={inputClass} type="number" value={form.sort_order} onChange={e => setForm(p => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))} placeholder="0" />
        </div>
      </div>
      <div className="space-y-4 mb-4">
        <ImageUpload value={form.video_url} onChange={v => setForm(p => ({ ...p, video_url: v }))} folder="shorts" label="영상 파일 *" aspect="aspect-9/16 max-w-[180px]" hint="MP4, 9:16 비율" />
        <ImageUpload value={form.thumbnail} onChange={v => setForm(p => ({ ...p, thumbnail: v }))} folder="shorts-thumb" label="썸네일" aspect="aspect-9/16 max-w-[180px]" hint="선택, 9:16 비율" />
        <div>
          <label className="text-sub text-sm font-medium block mb-2">설명 <span className="text-muted font-normal">(선택)</span></label>
          <input className={inputClass} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="영상 설명" />
        </div>
      </div>

      <button onClick={handleSubmit} disabled={saving} className="bg-accent hover:bg-accent-hover text-white font-bold px-6 py-2.5 rounded-lg transition-all disabled:opacity-50">
        {saving ? "등록 중..." : "숏츠 등록"}
      </button>
    </div>
  );
}
