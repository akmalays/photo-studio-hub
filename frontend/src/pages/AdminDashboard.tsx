import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, Plus, Trash2, Image, Settings, ChevronDown, ChevronUp, Bell, Mail, X, Edit, Loader2 } from "lucide-react";
import { toast } from "sonner";

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
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
  const [activeSection, setActiveSection] = useState<"portfolio" | "services">("portfolio");
  
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
  const [lastReadAt, setLastReadAt] = useState<string>(
    localStorage.getItem("admin_last_read_at") || new Date(0).toISOString()
  );

  // Bulk Upload state
  const [serviceFiles, setServiceFiles] = useState<File[]>([]);
  const [servicePreviews, setServicePreviews] = useState<string[]>([]);

  const unreadCount = messages.filter(
    (msg) => new Date(msg.created_at) > new Date(lastReadAt)
  ).length;

  const fetchItems = useCallback(async () => {
    try {
      const [catRes, photoRes] = await Promise.all([
        fetch(`${apiUrl}/api/portfolio/categories`),
        fetch(`${apiUrl}/api/portfolio/photos`),
      ]);
      if (catRes.ok && photoRes.ok) {
        setPortfolioCategories(await catRes.json());
        setPortfolioPhotos(await photoRes.json());
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  const fetchServices = useCallback(async () => {
    try {
      const catRes = await fetch(`${apiUrl}/api/services/categories`);
      if (!catRes.ok) throw new Error("Gagal mengambil kategori");
      const cats = await catRes.json();
      setServiceCategories(cats || []);

      const photoRes = await fetch(`${apiUrl}/api/services/photos`);
      if (!photoRes.ok) throw new Error("Gagal mengambil foto");
      const photos = await photoRes.json();
      setServicePhotos(photos || []);
    } catch (err: any) {
      toast.error(err.message);
    }
  }, [apiUrl]);

  const fetchMessages = useCallback(async () => {
    try {
      setFetchingMessages(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`${apiUrl}/api/contact/messages`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!response.ok) throw new Error("Gagal mengambil pesan");
      const data = await response.json();
      console.log("Fetched messages:", data.length);
      setMessages(data || []);
    } catch (err: any) {
      console.error("Fetch messages error:", err);
    } finally {
      setFetchingMessages(false);
    }
  }, [apiUrl]);

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
    };
    checkAuth();
  }, [navigate, fetchItems, fetchServices, fetchMessages]);

  const handleAddPortfolioCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiUrl}/api/portfolio/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: portfolioCatName, description: portfolioCatDesc, display_order: portfolioCategories.length }),
      });
      if (!response.ok) throw new Error("Gagal menambah kategori");
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
      const response = await fetch(`${apiUrl}/api/portfolio/categories/${editingCategory.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editCatName, description: editCatDesc }),
      });
      if (!response.ok) throw new Error("Gagal mengedit kategori");
      toast.success("Kategori berhasil diedit!");
      setEditingCategory(null);
      fetchItems();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDeletePortfolioCategory = async (id: string) => {
    if (!confirm("Hapus kategori ini beserta semua fotonya?")) return;
    try {
      const response = await fetch(`${apiUrl}/api/portfolio/categories/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Gagal menghapus");
      toast.success("Kategori dihapus");
      fetchItems();
    } catch (err: any) {
      toast.error(err.message);
    }
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
        const response = await fetch(`${apiUrl}/api/portfolio/photos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            category_id: categoryId, image_url: urlData.publicUrl, title: "", display_order: currentOrder++,
          }),
        });
        if (!response.ok) throw new Error("Gagal simpan ke DB");
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

  const handleDeletePortfolioPhoto = async (photo: PortfolioPhoto) => {
    if (!confirm("Hapus foto ini?")) return;
    try {
      const urlParts = photo.image_url.split("/");
      const fileName = urlParts[urlParts.length - 1];
      await supabase.storage.from("portfolio").remove([fileName]);

      const response = await fetch(`${apiUrl}/api/portfolio/photos/${photo.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Gagal hapus dari DB");
      toast.success("Foto dihapus");
      fetchItems();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiUrl}/api/services/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: catName, description: catDesc, display_order: serviceCategories.length,
        }),
      });
      if (!response.ok) throw new Error("Gagal menyimpan kategori");
      
      toast.success("Kategori ditambahkan!");
      setCatName(""); setCatDesc(""); setShowCategoryForm(false);
      fetchServices();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Hapus kategori ini beserta semua fotonya?")) return;
    // Delete photos from storage
    const catPhotos = servicePhotos.filter((p) => p.category_id === id);
    for (const p of catPhotos) {
      const urlParts = p.image_url.split("/");
      const fileName = urlParts[urlParts.length - 1];
      await supabase.storage.from("portfolio").remove([fileName]);
    }
    const { error } = await fetch(`${apiUrl}/api/services/categories/${id}`, { method: "DELETE" }).then(res => res.json());
    if (error) { toast.error("Gagal menghapus"); } else { toast.success("Kategori dihapus"); fetchServices(); }
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
        const response = await fetch(`${apiUrl}/api/services/photos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            category_id: categoryId, image_url: urlData.publicUrl, display_order: currentOrder++,
          }),
        });
        if (!response.ok) throw new Error("Gagal simpan ke DB");
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

  const handleDeleteServicePhoto = async (photo: ServicePhoto) => {
    if (!confirm("Hapus foto ini?")) return;
    const urlParts = photo.image_url.split("/");
    const fileName = urlParts[urlParts.length - 1];
    await supabase.storage.from("portfolio").remove([fileName]);
    const { error } = await fetch(`${apiUrl}/api/services/photos/${photo.id}`, { method: "DELETE" }).then(res => res.json());
    if (error) { toast.error("Gagal menghapus"); } else { toast.success("Foto dihapus"); fetchServices(); }
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
              wArna<span className="text-primary"> Studio</span> Admin
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
                <div className="absolute right-0 top-full z-50 mt-2 w-[300px] border border-border bg-card shadow-xl sm:w-[400px]">
                  <div className="flex items-center justify-between border-b border-border p-4">
                    <h3 className="font-display text-sm font-semibold text-foreground">Pesan Terbaru</h3>
                    <button onClick={() => setShowNotifications(false)} className="text-muted-foreground hover:text-foreground">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    {fetchingMessages && messages.length === 0 ? (
                      <div className="p-8 text-center font-body text-xs text-muted-foreground">Memuat pesan...</div>
                    ) : messages.length === 0 ? (
                      <div className="p-8 text-center font-body text-xs text-muted-foreground">Tidak ada pesan masuk.</div>
                    ) : (
                      <div className="divide-y divide-border">
                        {messages.map((msg) => (
                          <div key={msg.id} className="p-4 hover:bg-muted/50 transition-colors">
                            <div className="mb-1 flex items-center justify-between">
                              <span className="font-display text-xs font-semibold text-foreground uppercase tracking-wider">{msg.name}</span>
                              <span className="text-[10px] text-muted-foreground">
                                {new Date(msg.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'short' })}
                              </span>
                            </div>
                            <div className="mb-2 flex items-center gap-1 text-[10px] text-primary">
                              <Mail className="h-3 w-3" />
                              <span>{msg.email}</span>
                            </div>
                            <p className="font-body text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                              {msg.message}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {messages.length > 0 && (
                    <div className="border-t border-border p-3 text-center">
                      <p className="font-body text-[10px] text-muted-foreground italic">Menampilkan {messages.length} pesan terbaru</p>
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
        </div>
      </div>

      <main className="px-4 py-8 sm:px-8">
        {/* === PORTFOLIO SECTION === */}
        {activeSection === "portfolio" && (
          <>
            <div className="mb-8 flex items-center justify-between">
              <h2 className="font-display text-xl text-foreground sm:text-2xl">Portfolio Categories</h2>
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
              <h2 className="font-display text-xl text-foreground sm:text-2xl">Kategori Jasa Lainnya</h2>
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
      </main>
    </div>
  );
};

export default AdminDashboard;
