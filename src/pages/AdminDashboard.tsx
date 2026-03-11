import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, Plus, Trash2, Image, Settings } from "lucide-react";
import { toast } from "sonner";

interface PortfolioItem {
  id: string;
  title: string;
  category: string;
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

  const fetchItems = useCallback(async () => {
    const { data } = await supabase
      .from("portfolio_items")
      .select("*")
      .order("display_order", { ascending: true });
    setItems(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    // Check auth
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/admin/login");
        return;
      }
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .single();
      if (!roles) {
        navigate("/admin/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", session.user.id)
        .single();
      setUserName(profile?.full_name || session.user.email || "Admin");

      fetchItems();
    };
    checkAuth();
  }, [navigate, fetchItems]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);

    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("portfolio")
      .upload(fileName, file);

    if (uploadError) {
      toast.error("Gagal upload gambar");
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("portfolio")
      .getPublicUrl(fileName);

    const { error: insertError } = await supabase
      .from("portfolio_items")
      .insert({
        title,
        category,
        image_url: urlData.publicUrl,
        display_order: items.length,
      });

    if (insertError) {
      toast.error("Gagal menambahkan item");
    } else {
      toast.success("Portfolio berhasil ditambahkan!");
      setTitle("");
      setCategory("");
      setFile(null);
      setPreview(null);
      setShowForm(false);
      fetchItems();
    }
    setUploading(false);
  };

  const handleDelete = async (item: PortfolioItem) => {
    if (!confirm("Hapus item ini?")) return;

    // Extract file name from URL
    const urlParts = item.image_url.split("/");
    const fileName = urlParts[urlParts.length - 1];

    await supabase.storage.from("portfolio").remove([fileName]);
    const { error } = await supabase
      .from("portfolio_items")
      .delete()
      .eq("id", item.id);

    if (error) {
      toast.error("Gagal menghapus");
    } else {
      toast.success("Item dihapus");
      fetchItems();
    }
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
              LENS<span className="text-primary">.</span> Admin
            </h1>
            <p className="font-body text-xs text-muted-foreground sm:text-sm">
              Kelola portfolio Anda
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <a
              href="/"
              className="font-body text-xs text-muted-foreground transition-colors hover:text-primary sm:text-sm"
            >
              Lihat Website
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 border border-border px-3 py-2 font-body text-xs text-muted-foreground transition-colors hover:border-destructive hover:text-destructive sm:px-4 sm:text-sm"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      <main className="px-4 py-8 sm:px-8">
        {/* Add Button */}
        <div className="mb-8 flex items-center justify-between">
          <h2 className="font-display text-xl text-foreground sm:text-2xl">Portfolio Items</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 border border-primary bg-primary px-4 py-2 font-body text-xs uppercase tracking-wider text-primary-foreground transition-all duration-300 hover:bg-transparent hover:text-primary sm:text-sm"
          >
            <Plus className="h-4 w-4" />
            Tambah
          </button>
        </div>

        {/* Add Form */}
        {showForm && (
          <form
            onSubmit={handleAdd}
            className="mb-8 border border-border bg-card p-4 sm:p-6"
          >
            <h3 className="mb-4 font-display text-lg text-foreground">Tambah Portfolio Baru</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block font-body text-xs uppercase tracking-wider text-muted-foreground">
                  Judul
                </label>
                <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-border bg-transparent px-4 py-3 font-body text-foreground outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-2 block font-body text-xs uppercase tracking-wider text-muted-foreground">
                  Kategori
                </label>
                <input
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Contoh: Pernikahan, Lanskap, Fashion"
                  className="w-full border border-border bg-transparent px-4 py-3 font-body text-foreground outline-none focus:border-primary"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="mb-2 block font-body text-xs uppercase tracking-wider text-muted-foreground">
                Gambar
              </label>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <label className="flex cursor-pointer items-center gap-2 border border-dashed border-border px-6 py-4 transition-colors hover:border-primary">
                  <Image className="h-5 w-5 text-muted-foreground" />
                  <span className="font-body text-sm text-muted-foreground">
                    {file ? file.name : "Pilih gambar..."}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                {preview && (
                  <img
                    src={preview}
                    alt="Preview"
                    className="h-20 w-20 object-cover"
                  />
                )}
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                type="submit"
                disabled={uploading || !file}
                className="border border-primary bg-primary px-6 py-2 font-body text-sm uppercase tracking-wider text-primary-foreground transition-all hover:bg-transparent hover:text-primary disabled:opacity-50"
              >
                {uploading ? "Mengupload..." : "Simpan"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setFile(null);
                  setPreview(null);
                }}
                className="border border-border px-6 py-2 font-body text-sm text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
              >
                Batal
              </button>
            </div>
          </form>
        )}

        {/* Items Grid */}
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
              <div
                key={item.id}
                className="group relative border border-border bg-card overflow-hidden"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-display text-foreground">{item.title}</p>
                    <p className="font-body text-xs text-muted-foreground">{item.category}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(item)}
                    className="flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:text-destructive"
                    title="Hapus"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
