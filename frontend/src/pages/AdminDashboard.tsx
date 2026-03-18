import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, Plus, Trash2, Image, Settings, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  image_url: string;
  display_order: number;
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

const AdminDashboard = () => {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
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

  const fetchItems = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/api/portfolio`);
      if (!response.ok) throw new Error("Gagal mengambil data portfolio");
      const data = await response.json();
      setItems(data || []);
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
    };
    checkAuth();
  }, [navigate, fetchItems, fetchServices]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { setFile(f); setPreview(URL.createObjectURL(f)); }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);

    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage.from("portfolio").upload(fileName, file);
    if (uploadError) { toast.error("Gagal upload gambar"); setUploading(false); return; }

    const { data: urlData } = supabase.storage.from("portfolio").getPublicUrl(fileName);

    try {
      const response = await fetch(`${apiUrl}/api/portfolio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title, category, image_url: urlData.publicUrl, display_order: items.length,
        }),
      });
      if (!response.ok) throw new Error("Gagal menyimpan ke database");
      
      toast.success("Portfolio berhasil ditambahkan!");
      setTitle(""); setCategory(""); setFile(null); setPreview(null); setShowForm(false);
      fetchItems();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (item: PortfolioItem) => {
    if (!confirm("Hapus item ini?")) return;
    const urlParts = item.image_url.split("/");
    const fileName = urlParts[urlParts.length - 1];
    await supabase.storage.from("portfolio").remove([fileName]);
    const { error } = await fetch(`${apiUrl}/api/portfolio/${item.id}`, { method: "DELETE" }).then(res => res.json());
    if (error) { toast.error("Gagal menghapus"); } else { toast.success("Item dihapus"); fetchItems(); }
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

  const handleServiceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { setServiceFile(f); setServicePreview(URL.createObjectURL(f)); }
  };

  const handleAddServicePhoto = async (categoryId: string) => {
    if (!serviceFile) return;
    setUploadingService(true);

    const ext = serviceFile.name.split(".").pop();
    const fileName = `service_${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage.from("portfolio").upload(fileName, serviceFile);
    if (uploadError) { toast.error("Gagal upload"); setUploadingService(false); return; }

    const { data: urlData } = supabase.storage.from("portfolio").getPublicUrl(fileName);
    const catPhotos = servicePhotos.filter((p) => p.category_id === categoryId);

    try {
      const response = await fetch(`${apiUrl}/api/services/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category_id: categoryId, image_url: urlData.publicUrl, display_order: catPhotos.length,
        }),
      });
      if (!response.ok) throw new Error("Gagal menyimpan foto");

      toast.success("Foto ditambahkan!");
      setServiceFile(null); setServicePreview(null);
      fetchServices();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploadingService(false);
    }
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
              <h2 className="font-display text-xl text-foreground sm:text-2xl">Portfolio Items</h2>
              <button
                onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-2 border border-primary bg-primary px-4 py-2 font-body text-xs uppercase tracking-wider text-primary-foreground transition-all duration-300 hover:bg-transparent hover:text-primary sm:text-sm"
              >
                <Plus className="h-4 w-4" /> Tambah
              </button>
            </div>

            {showForm && (
              <form onSubmit={handleAdd} className="mb-8 border border-border bg-card p-4 sm:p-6">
                <h3 className="mb-4 font-display text-lg text-foreground">Tambah Portfolio Baru</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block font-body text-xs uppercase tracking-wider text-muted-foreground">Judul</label>
                    <input required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border border-border bg-transparent px-4 py-3 font-body text-foreground outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="mb-2 block font-body text-xs uppercase tracking-wider text-muted-foreground">Kategori</label>
                    <input required value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Contoh: Pernikahan, Lanskap, Fashion" className="w-full border border-border bg-transparent px-4 py-3 font-body text-foreground outline-none focus:border-primary" />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="mb-2 block font-body text-xs uppercase tracking-wider text-muted-foreground">Gambar</label>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                    <label className="flex cursor-pointer items-center gap-2 border border-dashed border-border px-6 py-4 transition-colors hover:border-primary">
                      <Image className="h-5 w-5 text-muted-foreground" />
                      <span className="font-body text-sm text-muted-foreground">{file ? file.name : "Pilih gambar..."}</span>
                      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>
                    {preview && <img src={preview} alt="Preview" className="h-20 w-20 object-cover" />}
                  </div>
                </div>
                <div className="mt-6 flex gap-3">
                  <button type="submit" disabled={uploading || !file} className="border border-primary bg-primary px-6 py-2 font-body text-sm uppercase tracking-wider text-primary-foreground transition-all hover:bg-transparent hover:text-primary disabled:opacity-50">
                    {uploading ? "Mengupload..." : "Simpan"}
                  </button>
                  <button type="button" onClick={() => { setShowForm(false); setFile(null); setPreview(null); }} className="border border-border px-6 py-2 font-body text-sm text-muted-foreground transition-colors hover:border-foreground hover:text-foreground">Batal</button>
                </div>
              </form>
            )}

            {loading ? (
              <p className="font-body text-muted-foreground">Memuat...</p>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center border border-dashed border-border py-16">
                <Image className="mb-4 h-12 w-12 text-muted-foreground/40" />
                <p className="font-body text-muted-foreground">Belum ada portfolio. Klik "Tambah" untuk mulai.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                  <div key={item.id} className="group relative border border-border bg-card overflow-hidden">
                    <div className="aspect-[4/3] overflow-hidden">
                      <img src={item.image_url} alt={item.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                    <div className="flex items-center justify-between p-4">
                      <div>
                        <p className="font-display text-foreground">{item.title}</p>
                        <p className="font-body text-xs text-muted-foreground">{item.category}</p>
                      </div>
                      <button onClick={() => handleDelete(item)} className="flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:text-destructive" title="Hapus">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
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
                          {/* Upload photo */}
                          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
                            <label className="flex cursor-pointer items-center gap-2 border border-dashed border-border px-4 py-3 transition-colors hover:border-primary">
                              <Image className="h-4 w-4 text-muted-foreground" />
                              <span className="font-body text-sm text-muted-foreground">{serviceFile ? serviceFile.name : "Pilih foto..."}</span>
                              <input type="file" accept="image/*" onChange={handleServiceFileChange} className="hidden" />
                            </label>
                            {servicePreview && <img src={servicePreview} alt="Preview" className="h-16 w-16 object-cover" />}
                            <button
                              type="button"
                              disabled={!serviceFile || uploadingService}
                              onClick={() => handleAddServicePhoto(cat.id)}
                              className="border border-primary bg-primary px-4 py-2 font-body text-xs uppercase tracking-wider text-primary-foreground transition-all hover:bg-transparent hover:text-primary disabled:opacity-50"
                            >
                              {uploadingService ? "Uploading..." : "Upload Foto"}
                            </button>
                          </div>

                          {/* Photos grid */}
                          {catPhotos.length === 0 ? (
                            <p className="font-body text-sm text-muted-foreground">Belum ada foto di kategori ini.</p>
                          ) : (
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                              {catPhotos.map((photo) => (
                                <div key={photo.id} className="group relative aspect-square overflow-hidden border border-border">
                                  <img src={photo.image_url} alt="" className="h-full w-full object-cover" />
                                  <button
                                    onClick={() => handleDeleteServicePhoto(photo)}
                                    className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-background/80 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
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
