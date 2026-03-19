import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LogIn, Eye, EyeOff } from "lucide-react";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("Email atau password salah.");
      setLoading(false);
      return;
    }

    // Check admin role
    const { data: roles, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError || !roles) {
      console.error("Role check failed:", roleError, "Roles data:", roles);
      setError("Anda tidak memiliki akses admin.");
      await supabase.auth.signOut();
      setLoading(false);
      return;
    }

    navigate("/admin");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-semibold text-foreground">
            wArna<span className="text-primary"> Studio</span>
          </h1>
          <p className="mt-2 font-body text-sm text-muted-foreground">Admin Login</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div>
            <label className="mb-2 block font-body text-xs uppercase tracking-wider text-muted-foreground">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-border bg-transparent px-4 py-3 font-body text-foreground outline-none transition-colors focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-2 block font-body text-xs uppercase tracking-wider text-muted-foreground">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-border bg-transparent px-4 py-3 pr-12 font-body text-foreground outline-none transition-colors focus:border-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-primary"
                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 border border-primary bg-primary px-8 py-3 font-body text-sm uppercase tracking-widest text-primary-foreground transition-all duration-300 hover:bg-transparent hover:text-primary disabled:opacity-50"
          >
            <LogIn className="h-4 w-4" />
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/" className="font-body text-sm text-muted-foreground transition-colors hover:text-primary">
            ← Kembali ke website
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
