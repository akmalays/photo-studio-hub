import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, Plus, Trash2, Image, Settings, ChevronDown, ChevronUp, Bell, Mail, X, Edit, Loader2, BarChart3, Users, TrendingUp, Globe, MapPin } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface PortfolioCategory {
  id: string;
  name: string;
  description: string;
  display_order: number;
}

interface PortfolioPhoto {
  id: string;
  category_id: string;
  image_url: string;
  title: string;
  display_order: number;
  created_at: string;
}

interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  display_order: number;
}

interface ServicePhoto {
  id: string;
  category_id: string;
  image_url: string;
  display_order: number;
}

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
}

interface Announcement {
  id: string;
  text: string;
  is_active: boolean;
  display_order: number;
}

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  // Service states
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
  const [servicePhotos, setServicePhotos] = useState<ServicePhoto[]>([]);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [catName, setCatName] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const [serviceFile, setServiceFile] = useState<File | null>(null);
  const [servicePreview, setServicePreview] = useState<string | null>(null);
  const [uploadingService, setUploadingService] = useState(false);
  const [activeSection, setActiveSection] = useState<"portfolio" | "services" | "announcements" | "stats">("portfolio");

  // Stats state
  const [visitorStats, setVisitorStats] = useState<{ 
    total: number; 
    uniqueTotal: number; 
    today: number; 
    uniqueToday: number; 
    topCountries: { name: string; count: number }[];
    topCities: { name: string; count: number }[];
    last7Days: any[] 
  } | null>(null);
  const [fetchingStats, setFetchingStats] = useState(false);
  
  // Announcements (ticker) state
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [newAnnouncementText, setNewAnnouncementText] = useState("");
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [editAnnouncementText, setEditAnnouncementText] = useState("");
  
  // New Portfolio states
  const [portfolioCategories, setPortfolioCategories] = useState<PortfolioCategory[]>([]);
  const [portfolioPhotos, setPortfolioPhotos] = useState<PortfolioPhoto[]>([]);
  const [showPortfolioCategoryForm, setShowPortfolioCategoryForm] = useState(false);
  const [portfolioCatName, setPortfolioCatName] = useState("");
  const [portfolioCatDesc, setPortfolioCatDesc] = useState("");
  const [expandedPortfolioCat, setExpandedPortfolioCat] = useState<string | null>(null);
  const [portfolioFiles, setPortfolioFiles] = useState<File[]>([]);
  const [portfolioPreviews, setPortfolioPreviews] = useState<string[]>([]);
  const [uploadingPortfolio, setUploadingPortfolio] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<PortfolioPhoto | null>(null);
  const [editPhotoTitle, setEditPhotoTitle] = useState("");

  const [editingCategory, setEditingCategory] = useState<PortfolioCategory | null>(null);
  const [editCatName, setEditCatName] = useState("");
  const [editCatDesc, setEditCatDesc] = useState("");
  
  // Notification states
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [fetchingMessages, setFetchingMessages] = useState(false);
  const [expandMessages, setExpandMessages] = useState(false);
  const [lastReadAt, setLastReadAt] = useState<string>(
    localStorage.getItem("admin_last_read_at") || new Date(0).toISOString()
  );

  // Bulk Upload state
  const [serviceFiles, setServiceFiles] = useState<File[]>([]);
  const [servicePreviews, setServicePreviews] = useState<string[]>([]);

  const unreadCount = messages.filter(
    (msg) => new Date(msg.created_at) > new Date(lastReadAt)
  ).length;

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: "", description: "", onConfirm: () => {} });

  const confirmAction = (title: string, description: string, onConfirm: () => void) => {
    setConfirmDialog({ isOpen: true, title, description, onConfirm });
  };


  const fetchItems = useCallback(async () => {
    try {
      const [catRes, photoRes] = await Promise.all([
        supabase.from('portfolio_categories').select('*').order('display_order', {ascending: true}),
        supabase.from('portfolio_photos').select('*').order('display_order', {ascending: true})
      ]);
      setPortfolioCategories(catRes.data || []);
      setPortfolioPhotos(photoRes.data || []);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    setFetchingStats(true);
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { data, error } = await supabase.from('visitor_stats').select('*');
      if (error) throw error;
      
      const visits = data || [];
      const uniques = new Set(visits.map(v => v.ip_hash));
      const todayVisits = visits.filter(v => new Date(v.created_at) >= today);
      const todayUniques = new Set(todayVisits.map(v => v.ip_hash));
      
      const countriesMap: Record<string, number> = {};
      const citiesMap: Record<string, number> = {};
      visits.forEach(d => {
        if (d.country) countriesMap[d.country] = (countriesMap[d.country] || 0) + 1;
        if (d.city) citiesMap[d.city] = (citiesMap[d.city] || 0) + 1;
      });

      const topCountries = Object.keys(countriesMap).map(k => ({ name: k, count: countriesMap[k] })).sort((a, b) => b.count - a.count).slice(0, 5);
      const topCities = Object.keys(citiesMap).map(k => ({ name: k, count: citiesMap[k] })).sort((a, b) => b.count - a.count).slice(0, 5);

      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const start = new Date(); start.setDate(start.getDate() - i); start.setHours(0, 0, 0, 0);
        const end = new Date(start); end.setHours(23, 59, 59, 999);
        const dayVisits = visits.filter(v => {
          const d = new Date(v.created_at);
          return d >= start && d <= end;
        });
        last7Days.push({
          date: start.toLocaleDateString("id-ID", { weekday: "short" }),
          hits: dayVisits.length,
          uniques: new Set(dayVisits.map(d => d.ip_hash)).size
        });
      }

      setVisitorStats({ total: visits.length, uniqueTotal: uniques.size, today: todayVisits.length, uniqueToday: todayUniques.size, topCountries, topCities, last7Days });
    } catch (error: any) {
      console.error(error.message);
    } finally {
      setFetchingStats(false);
    }
  }, []);

  useEffect(() => {
    if (activeSection === "stats") {
      fetchStats();
    }
  }, [activeSection, fetchStats]);

  const fetchServices = useCallback(async () => {
    try {
      const [catRes, photoRes] = await Promise.all([
        supabase.from('service_categories').select('*').order('display_order', {ascending: true}),
        supabase.from('service_photos').select('*').order('display_order', {ascending: true})
      ]);
      setServiceCategories(catRes.data || []);
      setServicePhotos(photoRes.data || []);
    } catch (err: any) {
      toast.error(err.message);
    }
  }, []);

  const handleDeleteMessage = (id: string) => {
    confirmAction("Hapus Pesan", "Ini akan menghapus pesan secara permanen.", async () => {
      try {
        const { error } = await supabase.from('contact_messages').delete().eq('id', id);
        if (error) throw error;
        setMessages(prev => prev.filter(m => m.id !== id));
        toast.success("Pesan berhasil dihapus");
      } catch (err: any) {
        toast.error("Gagal menghapus pesan: " + err.message);
      }
    });
  };

  const fetchAnnouncements = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('announcements').select('*').order('display_order', {ascending: true});
      if (error) throw error;
      setAnnouncements(data || []);
    } catch(e) { console.error(e); }
  }, []);

  const handleCreateAnnouncement = async () => {
    if (!newAnnouncementText.trim()) return;
    try {
      const { error } = await supabase.from('announcements').insert([{ text: newAnnouncementText.trim(), is_active: true, display_order: announcements.length }]);
      if (error) throw error;
      toast.success("Pengumuman ditambahkan!");
      setNewAnnouncementText("");
      fetchAnnouncements();
    } catch(e: any) { toast.error(e.message); }
  };

  const handleUpdateAnnouncement = async () => {
    if (!editingAnnouncement || !editAnnouncementText.trim()) return;
    try {
      const { error } = await supabase.from('announcements').update({ text: editAnnouncementText.trim() }).eq('id', editingAnnouncement.id);
      if (error) throw error;
      toast.success("Pengumuman diperbarui!");
      setEditingAnnouncement(null);
      fetchAnnouncements();
    } catch(e: any) { toast.error(e.message); }
  };

  const handleToggleAnnouncement = async (ann: Announcement) => {
    try {
      const { error } = await supabase.from('announcements').update({ is_active: !ann.is_active }).eq('id', ann.id);
      if (error) throw error;
      fetchAnnouncements();
    } catch(e: any) { toast.error(e.message); }
  };

  const handleDeleteAnnouncement = (id: string) => {
    confirmAction("Hapus Pengumuman", "Pengumuman ini akan dihapus secara permanen.", async () => {
      try {
        const { error } = await supabase.from('announcements').delete().eq('id', id);
        if (error) throw error;
        toast.success("Pengumuman berhasil dihapus");
        fetchAnnouncements();
      } catch(e: any) { toast.error("Gagal menghapus pengumuman: " + e.message); }
    });
  };

  const fetchMessages = useCallback(async () => {
    try {
      setFetchingMessages(true);
      const { data, error } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      console.log("Fetched messages:", data?.length);
      setMessages(data || []);
    } catch (err: any) {
      console.error("Fetch messages error:", err);
    } finally {
      setFetchingMessages(false);
    }
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/admin/login"); return; }
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .single();
      if (!roles) { navigate("/admin/login"); return; }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", session.user.id)
        .single();
      setUserName(profile?.full_name || session.user.email || "Admin");

      fetchItems();
      fetchServices();
      fetchMessages();
      fetchAnnouncements();
    };

    checkAuth();

    // Poll for messages as backup
    const interval = setInterval(fetchMessages, 60000);

    // Real-time subscription
    console.log("Subscribing to contact_messages real-time...");
    const channel = supabase
      .channel("contact_messages_changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "contact_messages" },
        (payload) => {
          console.log("New contact message received via Realtime:", payload);
          fetchMessages();
        }
      )
      .subscribe((status) => {
        console.log("Real-time subscription status:", status);
      });

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [navigate, fetchItems, fetchServices, fetchMessages, fetchAnnouncements]);

  const handleAddPortfolioCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('portfolio_categories').insert([{ name: portfolioCatName, description: portfolioCatDesc, display_order: portfolioCategories.length }]);
      if (error) throw error;
      toast.success("Kategori portfolio ditambahkan!");
      setPortfolioCatName(""); setPortfolioCatDesc(""); setShowPortfolioCategoryForm(false);
      fetchItems();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleEditPortfolioCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    try {
      const { error } = await supabase.from('portfolio_categories').update({ name: editCatName, description: editCatDesc }).eq('id', editingCategory.id);
      if (error) throw error;
      toast.success("Kategori berhasil diedit!");
      setEditingCategory(null);
      fetchItems();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDeletePortfolioCategory = (id: string) => {
    confirmAction("Hapus Kategori", "Apakah Anda yakin ingin menghapus kategori portfolio ini beserta seluruh fotonya? Tindakan ini tidak dapat dibatalkan.", async () => {
      try {
        const { error } = await supabase.from('portfolio_categories').delete().eq('id', id);
        if (error) throw error;
        toast.success("Kategori berhasil dihapus!");
        fetchItems();
      } catch (err: any) {
        toast.error("Gagal menghapus kategori: " + err.message);
      }
    });
  };

  const handlePortfolioFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles: File[] = [];
    const previews: string[] = [];

    selectedFiles.forEach(f => {
      if (f.size > 2 * 1024 * 1024) {
        toast.error(`File ${f.name} melebihi 2 MB`);
      } else {
        validFiles.push(f);
        previews.push(URL.createObjectURL(f));
      }
    });

    setPortfolioFiles(prev => [...prev, ...validFiles]);
    setPortfolioPreviews(prev => [...prev, ...previews]);
  };

  const handleAddPortfolioPhotos = async (categoryId: string) => {
    if (portfolioFiles.length === 0) return;
    setUploadingPortfolio(true);

    let successCount = 0;
    const catPhotos = portfolioPhotos.filter((p) => p.category_id === categoryId);
    let currentOrder = catPhotos.length;

    for (const file of portfolioFiles) {
      try {
        const ext = file.name.split(".").pop();
        const fileName = `portfolio_${Date.now()}_${successCount}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("portfolio").upload(fileName, file);
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from("portfolio").getPublicUrl(fileName);
        const { error: dbError } = await supabase.from('portfolio_photos').insert([{
          category_id: categoryId, image_url: urlData.publicUrl, title: "", display_order: currentOrder++,
        }]);
        if (dbError) throw new Error("Gagal simpan ke DB");
        successCount++;
      } catch (err: any) {
        toast.error(`Gagal upload ${file.name}: ${err.message}`);
      }
    }

    if (successCount > 0) {
      toast.success(`${successCount} foto berhasil ditambahkan!`);
      setPortfolioFiles([]); setPortfolioPreviews([]);
      fetchItems();
    }
    setUploadingPortfolio(false);
  };

  const handleDeletePortfolioPhoto = (photo: PortfolioPhoto) => {
    confirmAction("Hapus Foto", "Apakah Anda yakin ingin menghapus foto portfolio ini secara permanen?", async () => {
      try {
        const urlParts = photo.image_url.split("/");
        const fileName = urlParts[urlParts.length - 1];
        await supabase.storage.from("portfolio").remove([fileName]);

        const { error } = await supabase.from('portfolio_photos').delete().eq('id', photo.id);
        if (error) throw new Error("Gagal hapus dari DB");
        toast.success("Foto berhasil dihapus!");
        fetchItems();
      } catch (err: any) {
        toast.error("Gagal menghapus foto: " + err.message);
      }
    });
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('service_categories').insert([{
        name: catName, description: catDesc, display_order: serviceCategories.length,
      }]);
      if (error) throw error;
      
      toast.success("Kategori ditambahkan!");
      setCatName(""); setCatDesc(""); setShowCategoryForm(false);
      fetchServices();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDeleteCategory = (id: string) => {
    confirmAction("Hapus Jasa", "Apakah Anda yakin ingin menghapus kategori jasa ini beserta seluruh fotonya? Tindakan ini tidak dapat dibatalkan.", async () => {
      // Delete photos from storage
      const catPhotos = servicePhotos.filter((p) => p.category_id === id);
      for (const p of catPhotos) {
        const urlParts = p.image_url.split("/");
        const fileName = urlParts[urlParts.length - 1];
        await supabase.storage.from("portfolio").remove([fileName]);
      }
      const { error } = await supabase.from('service_categories').delete().eq('id', id);
      if (error) { toast.error("Gagal menghapus jasa: " + error.message); } else { toast.success("Kategori jasa berhasil dihapus!"); fetchServices(); }
    });
  };

  const handleServiceFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles: File[] = [];
    const previews: string[] = [];

    selectedFiles.forEach(f => {
      if (f.size > 2 * 1024 * 1024) {
        toast.error(`File ${f.name} melebihi 2 MB`);
      } else {
        validFiles.push(f);
        previews.push(URL.createObjectURL(f));
      }
    });

    setServiceFiles(prev => [...prev, ...validFiles]);
    setServicePreviews(prev => [...prev, ...previews]);
  };

  const handleAddServicePhotos = async (categoryId: string) => {
    if (serviceFiles.length === 0) return;
    setUploadingService(true);

    let successCount = 0;
    const catPhotos = servicePhotos.filter((p) => p.category_id === categoryId);
    let currentOrder = catPhotos.length;

    for (const file of serviceFiles) {
      try {
        const ext = file.name.split(".").pop();
        const fileName = `service_${Date.now()}_${successCount}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("portfolio").upload(fileName, file);
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from("portfolio").getPublicUrl(fileName);
        const { error: dbError } = await supabase.from('service_photos').insert([{
          category_id: categoryId, image_url: urlData.publicUrl, display_order: currentOrder++,
        }]);
        if (dbError) throw new Error("Gagal simpan ke DB");
        successCount++;
      } catch (err: any) {
        toast.error(`Gagal upload ${file.name}: ${err.message}`);
      }
    }

    if (successCount > 0) {
      toast.success(`${successCount} foto berhasil ditambahkan!`);
      setServiceFiles([]); setServicePreviews([]);
      fetchServices();
    }
    setUploadingService(false);
  };

  const handleDeleteServicePhoto = (photo: ServicePhoto) => {
    confirmAction("Hapus Foto Jasa", "Apakah Anda yakin ingin menghapus foto jasa ini secara permanen?", async () => {
      const urlParts = photo.image_url.split("/");
      const fileName = urlParts[urlParts.length - 1];
      await supabase.storage.from("portfolio").remove([fileName]);
      const { error } = await supabase.from('service_photos').delete().eq('id', photo.id);
      if (error) { toast.error("Gagal menghapus foto: " + error.message); } else { toast.success("Foto jasa berhasil dihapus!"); fetchServices(); }
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-4 py-4 sm:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-xl font-semibold text-foreground sm:text-2xl">
              wArnA<span className="text-primary"> Studio</span> Admin
            </h1>
            <p className="font-body text-xs text-muted-foreground sm:text-sm">Kelola portfolio Anda</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="hidden font-body text-sm text-muted-foreground sm:inline">Halo, {userName}</span>
            <a href="/" className="font-body text-xs text-muted-foreground transition-colors hover:text-primary sm:text-sm">Lihat Website</a>
            
            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => {
                  fetchMessages(); // Refresh on click
                  if (!showNotifications) {
                    const now = new Date().toISOString();
                    console.log("Setting lastReadAt to:", now);
                    setLastReadAt(now);
                    localStorage.setItem("admin_last_read_at", now);
                  }
                  setShowNotifications(!showNotifications);
                }}
                className={`flex h-9 w-9 items-center justify-center border border-border transition-colors hover:border-primary hover:text-primary ${showNotifications ? "border-primary text-primary" : "text-muted-foreground"}`}
                title="Notifikasi"
              >
                <Bell className={`h-4 w-4 ${unreadCount > 0 ? "animate-bounce" : ""}`} />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground animate-pulse">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popup */}
              {showNotifications && (
                <div className="fixed left-1/2 -translate-x-1/2 top-[70px] w-[92vw] max-w-[420px] z-50 border border-border bg-card shadow-2xl sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:translate-x-0 sm:w-[380px]">
                  <div className="flex items-center justify-between border-b border-border p-4">
                    <h3 className="font-display text-sm font-semibold text-foreground">Pesan Terbaru</h3>
                    <button onClick={() => setShowNotifications(false)} className="text-muted-foreground hover:text-foreground">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div>
                    {fetchingMessages && messages.length === 0 ? (
                      <div className="p-8 text-center font-body text-xs text-muted-foreground">Memuat pesan...</div>
                    ) : messages.length === 0 ? (
                      <div className="p-8 text-center font-body text-xs text-muted-foreground">Tidak ada pesan masuk.</div>
                    ) : (
                      <div className="divide-y divide-border">
                        {(expandMessages ? messages : messages.slice(0, 3)).map((msg) => (
                          <div key={msg.id} className="group relative p-4 hover:bg-muted/50 transition-colors">
                            {/* Delete icon */}
                            <button
                              onClick={() => handleDeleteMessage(msg.id)}
                              className="absolute right-3 top-3 hidden h-6 w-6 items-center justify-center rounded text-muted-foreground transition-colors hover:text-destructive group-hover:flex"
                              title="Hapus pesan"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                            <div className="mb-1 flex items-center justify-between pr-6">
                              <span className="font-display text-xs font-semibold text-foreground uppercase tracking-wider">{msg.name}</span>
                              <span className="text-[10px] text-muted-foreground">
                                {new Date(msg.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'short' })}
                              </span>
                            </div>
                            <div className="mb-2 flex items-center gap-1 text-[10px] text-primary">
                              <Mail className="h-3 w-3" />
                              <span className="truncate">{msg.email}</span>
                            </div>
                            <p className="font-body text-xs text-muted-foreground line-clamp-3 leading-relaxed break-words">
                              {msg.message}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {messages.length > 3 && (
                    <div className="border-t border-border p-3 text-center">
                      <button
                        onClick={() => setExpandMessages(e => !e)}
                        className="flex w-full items-center justify-center gap-1 font-body text-[11px] text-muted-foreground transition-colors hover:text-primary"
                      >
                        {expandMessages ? (
                          <><ChevronUp className="h-3.5 w-3.5" /> Tampilkan lebih sedikit</>
                        ) : (
                          <><ChevronDown className="h-3.5 w-3.5" /> +{messages.length - 3} pesan lainnya</>
                        )}
                      </button>
                    </div>
                  )}
                  {messages.length > 0 && messages.length <= 3 && (
                    <div className="border-t border-border p-3 text-center">
                      <p className="font-body text-[10px] text-muted-foreground italic">Menampilkan {messages.length} pesan</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <button onClick={() => navigate("/admin/settings")} className="flex items-center gap-2 border border-border px-3 py-2 font-body text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary sm:px-4 sm:text-sm">
              <Settings className="h-4 w-4" /><span className="hidden sm:inline">Pengaturan</span>
            </button>
            <button onClick={handleLogout} className="flex items-center gap-2 border border-border px-3 py-2 font-body text-xs text-muted-foreground transition-colors hover:border-destructive hover:text-destructive sm:px-4 sm:text-sm">
              <LogOut className="h-4 w-4" /><span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Section Tabs */}
      <div className="border-b border-border px-4 sm:px-8">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveSection("portfolio")}
            className={`border-b-2 px-4 py-3 font-body text-sm transition-colors ${
              activeSection === "portfolio" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Portfolio / Jasa Fotografi
          </button>
          <button
            onClick={() => setActiveSection("services")}
            className={`border-b-2 px-4 py-3 font-body text-sm transition-colors ${
              activeSection === "services" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Jasa Lainnya
          </button>
          <button
            onClick={() => setActiveSection("announcements")}
            className={`border-b-2 px-4 py-3 font-body text-sm transition-colors ${
              activeSection === "announcements" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Pengumuman / Ticker
          </button>
          <button
            onClick={() => setActiveSection("stats")}
            className={`border-b-2 px-4 py-3 font-body text-sm transition-colors ${
              activeSection === "stats" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Statistik Pengunjung
          </button>
        </div>
      </div>

      <main className="px-4 py-8 sm:px-8">
        {/* === PORTFOLIO SECTION === */}
        {activeSection === "portfolio" && (
          <>
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="font-display text-2xl text-foreground">Portfolio Categories</h2>
                <p className="text-xs text-muted-foreground font-body mt-0.5">Kelola kategori foto yang muncul di halaman utama (Wedding, Event, dll).</p>
              </div>
              <button
                onClick={() => setShowPortfolioCategoryForm(!showPortfolioCategoryForm)}
                className="flex items-center gap-2 border border-primary bg-primary px-4 py-2 font-body text-xs uppercase tracking-wider text-primary-foreground transition-all duration-300 hover:bg-transparent hover:text-primary sm:text-sm"
              >
                <Plus className="h-4 w-4" /> Tambah Kategori
              </button>
            </div>

            {showPortfolioCategoryForm && (
              <form onSubmit={handleAddPortfolioCategory} className="mb-8 border border-border bg-card p-4 sm:p-6">
                <h3 className="mb-4 font-display text-lg text-foreground">Tambah Kategori Portfolio Baru</h3>
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block font-body text-xs uppercase tracking-wider text-muted-foreground">Nama Kategori</label>
                    <input required value={portfolioCatName} onChange={(e) => setPortfolioCatName(e.target.value)} placeholder="Contoh: Pernikahan, Studio, Produk" className="w-full border border-border bg-transparent px-4 py-3 font-body text-foreground outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="mb-2 block font-body text-xs uppercase tracking-wider text-muted-foreground">Deskripsi</label>
                    <textarea value={portfolioCatDesc} onChange={(e) => setPortfolioCatDesc(e.target.value)} rows={3} placeholder="Jelaskan kategori ini..." className="w-full border border-border bg-transparent px-4 py-3 font-body text-foreground outline-none focus:border-primary" />
                  </div>
                </div>
                <div className="mt-6 flex gap-3">
                  <button type="submit" className="border border-primary bg-primary px-6 py-2 font-body text-sm uppercase tracking-wider text-primary-foreground transition-all hover:bg-transparent hover:text-primary">Simpan</button>
                  <button type="button" onClick={() => setShowPortfolioCategoryForm(false)} className="border border-border px-6 py-2 font-body text-sm text-muted-foreground transition-colors hover:border-foreground hover:text-foreground">Batal</button>
                </div>
              </form>
            )}

            {loading ? (
              <p className="font-body text-muted-foreground">Memuat...</p>
            ) : portfolioCategories.length === 0 ? (
              <div className="flex flex-col items-center justify-center border border-dashed border-border py-16">
                <Image className="mb-4 h-12 w-12 text-muted-foreground/40" />
                <p className="font-body text-muted-foreground">Belum ada kategori portfolio. Klik "Tambah Kategori" untuk mulai.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {portfolioCategories.map((cat) => {
                  const catPhotos = portfolioPhotos.filter((p) => p.category_id === cat.id);
                  const isExpanded = expandedPortfolioCat === cat.id;

                  return (
                    <div key={cat.id} className="border border-border bg-card overflow-hidden">
                      {/* Category header */}
                      <div
                        className="flex cursor-pointer items-center justify-between p-4 sm:p-5"
                        onClick={() => setExpandedPortfolioCat(isExpanded ? null : cat.id)}
                      >
                        <div>
                          <h3 className="font-display text-lg text-foreground">{cat.name}</h3>
                          {cat.description && <p className="mt-1 font-body text-xs text-muted-foreground line-clamp-1">{cat.description}</p>}
                          <p className="mt-1 font-body text-xs text-primary">{catPhotos.length} foto</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingCategory(cat);
                              setEditCatName(cat.name);
                              setEditCatDesc(cat.description || "");
                            }}
                            className="flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:text-primary"
                            title="Edit Kategori"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeletePortfolioCategory(cat.id); }}
                            className="flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:text-destructive"
                            title="Hapus Kategori"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          {isExpanded ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                        </div>
                      </div>

                      {/* Edit Form */}
                      {editingCategory?.id === cat.id && (
                        <form onSubmit={handleEditPortfolioCategory} className="border-t border-border bg-muted/20 p-4 sm:p-5">
                          <h4 className="mb-3 font-display text-sm">Edit Kategori</h4>
                          <div className="space-y-3">
                            <input required value={editCatName} onChange={(e) => setEditCatName(e.target.value)} placeholder="Nama Kategori" className="w-full border border-border bg-transparent px-3 py-2 font-body text-sm text-foreground outline-none focus:border-primary" />
                            <textarea value={editCatDesc} onChange={(e) => setEditCatDesc(e.target.value)} rows={2} placeholder="Deskripsi (Opsional)" className="w-full border border-border bg-transparent px-3 py-2 font-body text-sm text-foreground outline-none focus:border-primary" />
                            <div className="flex gap-2">
                              <button type="submit" className="bg-primary px-4 py-1.5 font-body text-xs text-primary-foreground">Simpan</button>
                              <button type="button" onClick={() => setEditingCategory(null)} className="border border-border px-4 py-1.5 font-body text-xs text-muted-foreground hover:text-foreground">Batal</button>
                            </div>
                          </div>
                        </form>
                      )}

                      {/* Expanded content */}
                      {isExpanded && (
                        <div className="border-t border-border p-4 sm:p-5">
                          {/* Bulk upload photos */}
                          <div className="mb-6">
                            <label className="mb-2 block font-body text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Upload Foto Portfolio </label>
                            <div className="flex flex-col gap-4">
                              <div className="flex flex-wrap gap-3 sm:items-end">
                                <label className="flex cursor-pointer items-center gap-2 border border-dashed border-border px-6 py-4 transition-colors hover:border-primary bg-muted/30">
                                  <Plus className="h-5 w-5 text-primary" />
                                  <span className="font-body text-sm text-foreground">Pilih foto</span>
                                  <input type="file" multiple accept="image/*" onChange={handlePortfolioFilesChange} className="hidden" />
                                </label>
                                
                                {portfolioFiles.length > 0 && (
                                  <button
                                    type="button"
                                    disabled={uploadingPortfolio}
                                    onClick={() => handleAddPortfolioPhotos(cat.id)}
                                    className="flex items-center gap-2 border border-primary bg-primary px-8 py-4 font-body text-xs uppercase tracking-widest text-primary-foreground transition-all hover:bg-transparent hover:text-primary disabled:opacity-50"
                                  >
                                    {uploadingPortfolio ? <Loader2 className="h-5 w-5 animate-spin" /> : "Mulai Upload"}
                                  </button>
                                )}
                              </div>
                              
                              {/* Previews */}
                              {portfolioPreviews.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {portfolioPreviews.map((p, idx) => (
                                    <div key={idx} className="relative h-16 w-16 overflow-hidden border border-border group">
                                      <img src={p} alt="" className="h-full w-full object-cover" />
                                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <X className="h-4 w-4 text-white cursor-pointer" onClick={() => {
                                          const newFiles = [...portfolioFiles];
                                          const newPreviews = [...portfolioPreviews];
                                          newFiles.splice(idx, 1);
                                          newPreviews.splice(idx, 1);
                                          setPortfolioFiles(newFiles);
                                          setPortfolioPreviews(newPreviews);
                                        }} />
                                      </div>
                                    </div>
                                  ))}
                                  <button 
                                    onClick={() => { setPortfolioFiles([]); setPortfolioPreviews([]); }}
                                    className="h-16 px-4 font-body text-[10px] uppercase text-muted-foreground hover:text-destructive border border-dashed border-border"
                                  >
                                    Bersihkan
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Photos grid */}
                          {catPhotos.length === 0 ? (
                            <p className="font-body text-sm text-muted-foreground">Belum ada foto di kategori ini.</p>
                          ) : (
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                              {catPhotos.map((photo) => (
                                <div key={photo.id} className="group relative overflow-hidden border border-border bg-muted/10 flex items-center justify-center p-1">
                                  <img src={photo.image_url} alt="" className="max-h-[200px] w-full object-contain" />
                                  <button
                                    onClick={() => handleDeletePortfolioPhoto(photo)}
                                    className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-background/80 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive shadow-sm"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* === SERVICES SECTION === */}
        {activeSection === "services" && (
          <>
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="font-display text-2xl text-foreground">Layanan Jasa Lainnya</h2>
                <p className="text-xs text-muted-foreground font-body mt-0.5">Kelola foto untuk layanan tambahan seperti Cetak Foto, ID Card, dll.</p>
              </div>
              <button
                onClick={() => setShowCategoryForm(!showCategoryForm)}
                className="flex items-center gap-2 border border-primary bg-primary px-4 py-2 font-body text-xs uppercase tracking-wider text-primary-foreground transition-all duration-300 hover:bg-transparent hover:text-primary sm:text-sm"
              >
                <Plus className="h-4 w-4" /> Tambah Kategori
              </button>
            </div>

            {showCategoryForm && (
              <form onSubmit={handleAddCategory} className="mb-8 border border-border bg-card p-4 sm:p-6">
                <h3 className="mb-4 font-display text-lg text-foreground">Tambah Kategori Baru</h3>
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block font-body text-xs uppercase tracking-wider text-muted-foreground">Nama Kategori</label>
                    <input required value={catName} onChange={(e) => setCatName(e.target.value)} placeholder="Contoh: Foto Studio Sekolah" className="w-full border border-border bg-transparent px-4 py-3 font-body text-foreground outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="mb-2 block font-body text-xs uppercase tracking-wider text-muted-foreground">Deskripsi</label>
                    <textarea required value={catDesc} onChange={(e) => setCatDesc(e.target.value)} rows={3} placeholder="Jelaskan layanan ini..." className="w-full border border-border bg-transparent px-4 py-3 font-body text-foreground outline-none focus:border-primary" />
                  </div>
                </div>
                <div className="mt-6 flex gap-3">
                  <button type="submit" className="border border-primary bg-primary px-6 py-2 font-body text-sm uppercase tracking-wider text-primary-foreground transition-all hover:bg-transparent hover:text-primary">Simpan</button>
                  <button type="button" onClick={() => setShowCategoryForm(false)} className="border border-border px-6 py-2 font-body text-sm text-muted-foreground transition-colors hover:border-foreground hover:text-foreground">Batal</button>
                </div>
              </form>
            )}

            {serviceCategories.length === 0 ? (
              <div className="flex flex-col items-center justify-center border border-dashed border-border py-16">
                <Image className="mb-4 h-12 w-12 text-muted-foreground/40" />
                <p className="font-body text-muted-foreground">Belum ada kategori. Klik "Tambah Kategori" untuk mulai.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {serviceCategories.map((cat) => {
                  const catPhotos = servicePhotos.filter((p) => p.category_id === cat.id);
                  const isExpanded = expandedCat === cat.id;

                  return (
                    <div key={cat.id} className="border border-border bg-card overflow-hidden">
                      {/* Category header */}
                      <div
                        className="flex cursor-pointer items-center justify-between p-4 sm:p-5"
                        onClick={() => setExpandedCat(isExpanded ? null : cat.id)}
                      >
                        <div>
                          <h3 className="font-display text-lg text-foreground">{cat.name}</h3>
                          <p className="mt-1 font-body text-xs text-muted-foreground line-clamp-1">{cat.description}</p>
                          <p className="mt-1 font-body text-xs text-primary">{catPhotos.length} foto</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat.id); }}
                            className="flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:text-destructive"
                            title="Hapus Kategori"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          {isExpanded ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                        </div>
                      </div>

                      {/* Expanded content */}
                      {isExpanded && (
                        <div className="border-t border-border p-4 sm:p-5">
                          {/* Bulk upload photos */}
                          <div className="mb-6">
                            <label className="mb-2 block font-body text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Upload Foto Baru </label>
                            <div className="flex flex-col gap-4">
                              <div className="flex flex-wrap gap-3 sm:items-end">
                                <label className="flex cursor-pointer items-center gap-2 border border-dashed border-border px-6 py-4 transition-colors hover:border-primary bg-muted/30">
                                  <Plus className="h-5 w-5 text-primary" />
                                  <span className="font-body text-sm text-foreground">Pilih foto</span>
                                  <input type="file" multiple accept="image/*" onChange={handleServiceFilesChange} className="hidden" />
                                </label>
                                
                                {serviceFiles.length > 0 && (
                                  <button
                                    type="button"
                                    disabled={uploadingService}
                                    onClick={() => handleAddServicePhotos(cat.id)}
                                    className="flex items-center gap-2 border border-primary bg-primary px-8 py-4 font-body text-xs uppercase tracking-widest text-primary-foreground transition-all hover:bg-transparent hover:text-primary disabled:opacity-50"
                                  >
                                    {uploadingService ? <Loader2 className="h-5 w-5 animate-spin" /> : "Mulai Upload"}
                                  </button>
                                )}
                              </div>
                              
                              {/* Previews */}
                              {servicePreviews.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {servicePreviews.map((p, idx) => (
                                    <div key={idx} className="relative h-16 w-16 overflow-hidden border border-border group">
                                      <img src={p} alt="" className="h-full w-full object-cover" />
                                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <X className="h-4 w-4 text-white cursor-pointer" onClick={() => {
                                          const newFiles = [...serviceFiles];
                                          const newPreviews = [...servicePreviews];
                                          newFiles.splice(idx, 1);
                                          newPreviews.splice(idx, 1);
                                          setServiceFiles(newFiles);
                                          setServicePreviews(newPreviews);
                                        }} />
                                      </div>
                                    </div>
                                  ))}
                                  <button 
                                    onClick={() => { setServiceFiles([]); setServicePreviews([]); }}
                                    className="h-16 px-4 font-body text-[10px] uppercase text-muted-foreground hover:text-destructive border border-dashed border-border"
                                  >
                                    Bersihkan
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Photos grid */}
                          {catPhotos.length === 0 ? (
                            <p className="font-body text-sm text-muted-foreground">Belum ada foto di kategori ini.</p>
                          ) : (
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                              {catPhotos.map((photo) => (
                                <div key={photo.id} className="group relative overflow-hidden border border-border bg-muted/10 flex items-center justify-center p-1">
                                  <img src={photo.image_url} alt="" className="max-h-[200px] w-full object-contain" />
                                  <button
                                    onClick={() => handleDeleteServicePhoto(photo)}
                                    className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-background/80 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive shadow-sm"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
        {activeSection === "announcements" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-2xl text-foreground">Pengumuman Running Text</h2>
                <p className="text-xs text-muted-foreground font-body mt-0.5">Teks ini akan berjalan di bawah navbar website.</p>
              </div>
            </div>

            {/* Add new */}
            <div className="border border-border bg-card p-4">
              <h3 className="font-display text-lg text-foreground mb-3">Tambah Pengumuman Baru</h3>
              <div className="flex gap-2">
                <input
                  value={newAnnouncementText}
                  onChange={(e) => setNewAnnouncementText(e.target.value)}
                  placeholder="Tulis teks pengumuman..."
                  className="flex-1 border border-border bg-transparent px-3 py-2 font-body text-sm text-foreground outline-none focus:border-primary"
                  onKeyDown={(e) => e.key === "Enter" && handleCreateAnnouncement()}
                />
                <button
                  onClick={handleCreateAnnouncement}
                  disabled={!newAnnouncementText.trim()}
                  className="flex items-center gap-2 border border-primary bg-primary px-4 py-2 font-body text-xs uppercase tracking-wider text-primary-foreground transition-all hover:bg-transparent hover:text-primary disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                  Tambah
                </button>
              </div>
            </div>

            {/* List */}
            <div className="space-y-2">
              {announcements.length === 0 ? (
                <p className="font-body text-sm text-muted-foreground py-6 text-center border border-dashed border-border">Belum ada pengumuman.</p>
              ) : (
                announcements.map((ann) => (
                  <div key={ann.id} className="border border-border bg-card p-4">
                    {editingAnnouncement?.id === ann.id ? (
                      <div className="flex gap-2">
                        <input
                          value={editAnnouncementText}
                          onChange={(e) => setEditAnnouncementText(e.target.value)}
                          className="flex-1 border border-primary bg-transparent px-3 py-2 font-body text-sm text-foreground outline-none"
                          autoFocus
                        />
                        <button onClick={handleUpdateAnnouncement} className="border border-primary bg-primary px-3 py-1 font-body text-xs text-primary-foreground hover:bg-transparent hover:text-primary">Simpan</button>
                        <button onClick={() => setEditingAnnouncement(null)} className="border border-border px-3 py-1 font-body text-xs text-muted-foreground hover:text-foreground">Batal</button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <p className={`font-body text-sm ${ann.is_active ? "text-foreground" : "text-muted-foreground line-through"}`}>
                            {ann.text}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Active toggle */}
                          <div className="mr-1.5 flex items-center">
                            <button
                              onClick={() => handleToggleAnnouncement(ann)}
                              title={ann.is_active ? "Nonaktifkan" : "Aktifkan"}
                              className={`h-5 w-10 min-w-[40px] rounded-full transition-all duration-300 focus:outline-none ${ann.is_active ? "bg-primary" : "bg-muted-foreground/30"} relative border-none`}
                            >
                              <span className={`absolute top-[3px] h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-all duration-300 ${ann.is_active ? "left-[23px]" : "left-[3px]"}`} />
                            </button>
                          </div>
                          {/* Edit */}
                          <button
                            onClick={() => { setEditingAnnouncement(ann); setEditAnnouncementText(ann.text); }}
                            className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                            title="Edit"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteAnnouncement(ann.id)}
                            className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeSection === "stats" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-2xl text-foreground">Statistik Pengunjung</h2>
                <p className="text-xs text-muted-foreground font-body mt-0.5">Pantau jumlah kunjungan ke website Anda.</p>
              </div>
              <button 
                onClick={fetchStats}
                disabled={fetchingStats}
                className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
              >
                {fetchingStats ? <Loader2 className="h-4 w-4 animate-spin" /> : <TrendingUp className="h-4 w-4" />}
                Refresh
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-blue-500/10 p-3 text-blue-500">
                    <Users className="h-6 w-6" />
                  </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Pengunjung</p>
                  <p className="text-2xl font-bold text-foreground">
                    {visitorStats?.total || 0} <span className="text-sm font-normal text-muted-foreground">/ {visitorStats?.uniqueTotal || 0}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-green-500/10 p-3 text-green-500">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pengunjung Hari Ini</p>
                  <p className="text-2xl font-bold text-foreground">
                    {visitorStats?.today || 0} <span className="text-sm font-normal text-muted-foreground">/ {visitorStats?.uniqueToday || 0}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-purple-500/10 p-3 text-purple-500">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rata-rata Pengunjung</p>
                  <p className="text-2xl font-bold text-foreground">
                    {visitorStats ? Math.round(visitorStats.last7Days.reduce((acc: any, curr: any) => acc + curr.uniques, 0) / 7) : 0}
                  </p>
                </div>
              </div>
            </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h3 className="mb-6 font-display text-lg text-foreground">Tren Kunjungan (7 Hari Terakhir)</h3>
              <div className="h-[300px] w-full">
                {visitorStats && visitorStats.last7Days ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={visitorStats.last7Days}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#9ca3af', fontSize: 12 }} 
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#9ca3af', fontSize: 12 }} 
                      />
                      <Tooltip 
                        cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                        contentStyle={{ 
                          backgroundColor: '#1f2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#f3f4f6',
                          fontFamily: 'inherit'
                        }}
                      />
                      <Bar dataKey="hits" fill="#4b5563" radius={[4, 4, 0, 0]} name="Total Hits" />
                      <Bar dataKey="uniques" fill="#d4af37" radius={[4, 4, 0, 0]} name="Unique Visitors" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <Globe className="h-5 w-5 text-primary" />
                  <h3 className="font-display text-lg text-foreground">Top Negara</h3>
                </div>
                <div className="space-y-4">
                  {visitorStats?.topCountries && visitorStats.topCountries.length > 0 ? (
                    visitorStats.topCountries.map((loc, i) => (
                      <div key={i} className="flex items-center justify-between border-b border-border/50 pb-2 last:border-0 last:pb-0">
                        <span className="text-sm text-foreground font-body">{loc.name}</span>
                        <span className="text-sm font-semibold text-primary">{loc.count}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">Belum ada data lokasi.</p>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <MapPin className="h-5 w-5 text-primary" />
                  <h3 className="font-display text-lg text-foreground">Top Kota</h3>
                </div>
                <div className="space-y-4">
                  {visitorStats?.topCities && visitorStats.topCities.length > 0 ? (
                    visitorStats.topCities.map((loc, i) => (
                      <div key={i} className="flex items-center justify-between border-b border-border/50 pb-2 last:border-0 last:pb-0">
                        <span className="text-sm text-foreground font-body">{loc.name}</span>
                        <span className="text-sm font-semibold text-primary">{loc.count}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">Belum ada data lokasi.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <AlertDialog open={confirmDialog.isOpen} onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, isOpen: open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>{confirmDialog.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDialog.onConfirm} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminDashboard;
