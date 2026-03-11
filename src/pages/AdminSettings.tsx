import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, Save, UserPlus, Trash2, Shield, ShieldOff, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

interface UserItem {
  id: string;
  email: string;
  full_name: string;
  roles: string[];
  created_at: string;
}

const AdminSettings = () => {
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string; full_name: string } | null>(null);
  const [fullName, setFullName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  const [users, setUsers] = useState<UserItem[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const [showAddUser, setShowAddUser] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [newUserRole, setNewUserRole] = useState<"admin" | "user">("user");
  const [creating, setCreating] = useState(false);

  const navigate = useNavigate();

  const callAdmin = useCallback(async (body: Record<string, unknown>) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("No session");
    const res = await supabase.functions.invoke("admin-users", { body });
    if (res.error) throw new Error(res.error.message);
    if (res.data?.error) throw new Error(res.data.error);
    return res.data;
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const data = await callAdmin({ action: "list_users" });
      setUsers(data);
    } catch {
      toast.error("Gagal memuat daftar user");
    } finally {
      setLoadingUsers(false);
    }
  }, [callAdmin]);

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
      fetchUsers();
    };
    init();
  }, [navigate, fetchUsers]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await callAdmin({ action: "update_profile", full_name: fullName });
      if (newPassword.trim()) {
        await callAdmin({ action: "update_password", new_password: newPassword });
        setNewPassword("");
      }
      setCurrentUser((prev) => prev ? { ...prev, full_name: fullName } : prev);
      toast.success("Profil berhasil diperbarui!");
    } catch (e: any) {
      toast.error(e.message || "Gagal menyimpan");
    }
    setSaving(false);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await callAdmin({
        action: "create_user",
        email: newEmail,
        password: newUserPassword,
        full_name: newUserName,
        role: newUserRole,
      });
      toast.success("User berhasil ditambahkan!");
      setNewEmail("");
      setNewUserPassword("");
      setNewUserName("");
      setNewUserRole("user");
      setShowAddUser(false);
      fetchUsers();
    } catch (e: any) {
      toast.error(e.message || "Gagal menambah user");
    }
    setCreating(false);
  };

  const handleToggleRole = async (userId: string, role: string, hasRole: boolean) => {
    try {
      await callAdmin({
        action: hasRole ? "remove_role" : "add_role",
        user_id: userId,
        role,
      });
      toast.success(hasRole ? "Role dihapus" : "Role ditambahkan");
      fetchUsers();
    } catch (e: any) {
      toast.error(e.message || "Gagal mengubah role");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Hapus user ini? Tindakan ini tidak bisa dibatalkan.")) return;
    try {
      await callAdmin({ action: "delete_user", user_id: userId });
      toast.success("User dihapus");
      fetchUsers();
    } catch (e: any) {
      toast.error(e.message || "Gagal menghapus user");
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

        {/* User Management */}
        <section className="border border-border bg-card p-4 sm:p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-display text-xl text-foreground">Manajemen User</h2>
            <button
              onClick={() => setShowAddUser(!showAddUser)}
              className="flex items-center gap-2 border border-primary bg-primary px-4 py-2 font-body text-xs uppercase tracking-wider text-primary-foreground transition-all hover:bg-transparent hover:text-primary sm:text-sm"
            >
              <UserPlus className="h-4 w-4" />
              Tambah User
            </button>
          </div>

          {/* Add User Form */}
          {showAddUser && (
            <form onSubmit={handleCreateUser} className="mb-6 border border-border bg-background p-4">
              <h3 className="mb-4 font-display text-lg text-foreground">Tambah User Baru</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block font-body text-xs uppercase tracking-wider text-muted-foreground">Nama</label>
                  <input
                    required
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    className="w-full border border-border bg-transparent px-4 py-3 font-body text-foreground outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="mb-2 block font-body text-xs uppercase tracking-wider text-muted-foreground">Email</label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full border border-border bg-transparent px-4 py-3 font-body text-foreground outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="mb-2 block font-body text-xs uppercase tracking-wider text-muted-foreground">Password</label>
                  <input
                    type="password"
                    required
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    className="w-full border border-border bg-transparent px-4 py-3 font-body text-foreground outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="mb-2 block font-body text-xs uppercase tracking-wider text-muted-foreground">Role</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as "admin" | "user")}
                    className="w-full border border-border bg-transparent px-4 py-3 font-body text-foreground outline-none focus:border-primary"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <button
                  type="submit"
                  disabled={creating}
                  className="border border-primary bg-primary px-6 py-2 font-body text-sm uppercase tracking-wider text-primary-foreground transition-all hover:bg-transparent hover:text-primary disabled:opacity-50"
                >
                  {creating ? "Membuat..." : "Buat User"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddUser(false)}
                  className="border border-border px-6 py-2 font-body text-sm text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                >
                  Batal
                </button>
              </div>
            </form>
          )}

          {/* Users List */}
          {loadingUsers ? (
            <p className="font-body text-muted-foreground">Memuat...</p>
          ) : (
            <div className="space-y-3">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="flex flex-col gap-3 border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-foreground">{u.full_name || "(Tanpa nama)"}</p>
                    <p className="font-body text-xs text-muted-foreground">{u.email}</p>
                    <div className="mt-1 flex gap-1">
                      {u.roles.map((r) => (
                        <span
                          key={r}
                          className={`inline-block px-2 py-0.5 font-body text-xs uppercase tracking-wider ${
                            r === "admin"
                              ? "bg-primary/20 text-primary"
                              : "bg-secondary text-secondary-foreground"
                          }`}
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleRole(u.id, "admin", u.roles.includes("admin"))}
                      title={u.roles.includes("admin") ? "Hapus role admin" : "Jadikan admin"}
                      className="flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:text-primary"
                    >
                      {u.roles.includes("admin") ? (
                        <ShieldOff className="h-4 w-4" />
                      ) : (
                        <Shield className="h-4 w-4" />
                      )}
                    </button>
                    {u.id !== currentUser?.id && (
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        title="Hapus user"
                        className="flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default AdminSettings;
