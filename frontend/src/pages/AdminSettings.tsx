import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, Save, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

const AdminSettings = () => {
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string; full_name: string } | null>(null);
  const [fullName, setFullName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
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

      setCurrentUser({
        id: session.user.id,
        email: session.user.email || "",
        full_name: profile?.full_name || "",
      });
      setFullName(profile?.full_name || "");
    };
    init();
  }, [navigate]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      // Perbarui metadata auth & profiles
      if (currentUser) {
        const { error: profileError } = await supabase
          .from("profiles")
          .update({ full_name: fullName })
          .eq("id", currentUser.id);
        if (profileError) throw profileError;
      }

      if (newPassword.trim()) {
        const { error: pwError } = await supabase.auth.updateUser({
          password: newPassword
        });
        if (pwError) throw pwError;
        setNewPassword("");
      }

      setCurrentUser((prev) => prev ? { ...prev, full_name: fullName } : prev);
      toast.success("Profil berhasil diperbarui!");
    } catch (e: any) {
      toast.error(e.message || "Gagal menyimpan profil");
    }
    setSaving(false);
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
            <p className="font-body text-xs text-muted-foreground sm:text-sm">Pengaturan</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="hidden font-body text-sm text-muted-foreground sm:inline">
              Halo, {currentUser?.full_name || currentUser?.email || "Admin"}
            </span>
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

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-8">
        {/* Back button */}
        <button
          onClick={() => navigate("/admin")}
          className="mb-6 flex items-center gap-2 font-body text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Dashboard
        </button>

        {/* Profile Section */}
        <section className="mb-10 border border-border bg-card p-4 sm:p-6">
          <h2 className="mb-6 font-display text-xl text-foreground">Edit Profil</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block font-body text-xs uppercase tracking-wider text-muted-foreground">
                Nama Lengkap
              </label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full border border-border bg-transparent px-4 py-3 font-body text-foreground outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-2 block font-body text-xs uppercase tracking-wider text-muted-foreground">
                Email
              </label>
              <input
                value={currentUser?.email || ""}
                disabled
                className="w-full border border-border bg-muted/30 px-4 py-3 font-body text-muted-foreground outline-none"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="mb-2 block font-body text-xs uppercase tracking-wider text-muted-foreground">
              Password Baru (kosongkan jika tidak ingin mengubah)
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-border bg-transparent px-4 py-3 pr-12 font-body text-foreground outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="mt-6 flex items-center gap-2 border border-primary bg-primary px-6 py-2 font-body text-sm uppercase tracking-wider text-primary-foreground transition-all hover:bg-transparent hover:text-primary disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
        </section>

      </main>
    </div>
  );
};

export default AdminSettings;
