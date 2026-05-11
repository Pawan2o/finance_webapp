// Login page component - handles admin authentication
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Eye, EyeOff, IndianRupee } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Loader } from '../components/Loader';
import config from '../../config/global.json';

export function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // STEP 1: Login and get JWT token
      const tokenRes = await fetch(`${config.api.host}${config.api.token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
      });

      if (!tokenRes.ok) {
        const errorData = await tokenRes.json().catch(() => ({}));
        setError(errorData.detail || "Invalid username or password");
        return;
      }

      const tokenData = await tokenRes.json();

      // STEP 2: Check user type
      const userRes = await fetch(`${config.api.host}${config.api.isSuperUser}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${tokenData.access}`
        }
      });

      if (!userRes.ok) {
        setError("Failed to verify user");
        return;
      }

      const userData = await userRes.json();

      // STEP 3: Allow only admin
      if (userData.user_type === "superuser") {
        localStorage.setItem("token", tokenData.access);
        localStorage.setItem("refresh", tokenData.refresh);
        navigate("/dashboard");
      } else {
        setError("Access Denied. Only Admin can login.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Login failed. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-80px] top-[10%] h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(45,85,204,0.32),_transparent_68%)] blur-3xl" />
        <div className="absolute right-[-40px] top-0 h-80 w-80 rounded-full bg-[radial-gradient(circle,_rgba(124,58,237,0.20),_transparent_68%)] blur-3xl" />
        <div className="absolute bottom-[-60px] left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_rgba(36,72,172,0.16),_transparent_70%)] blur-3xl" />
      </div>

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-[32px] border border-white/70 bg-white/88 shadow-[0_30px_90px_rgba(15,23,42,0.16)] backdrop-blur-xl lg:grid-cols-[1.1fr_0.9fr]">
        <div className="hidden bg-[linear-gradient(180deg,#08152D_0%,#0E2143_44%,#17356B_100%)] p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/12 bg-white/8 px-4 py-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#1E3A8A_0%,#2D55CC_100%)] shadow-[0_12px_26px_rgba(30,58,138,0.35)]">
                <IndianRupee className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-blue-200/65">Premium Finance Admin</p>
                <p className="text-lg font-semibold">PaisaTrack Console</p>
              </div>
            </div>

            <div className="max-w-md">
              <h1 className="text-4xl font-semibold leading-tight text-white">
                Run your finance operations from a workspace that feels sharp, calm, and trusted.
              </h1>
              <p className="mt-4 text-base leading-7 text-blue-100/72">
                Review users, permissions, categories, reports, and activity from one polished control center built for clarity.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-3xl border border-white/12 bg-white/8 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-200/60">Security</p>
              <p className="mt-3 text-2xl font-semibold">Admin-only</p>
              <p className="mt-2 text-sm text-blue-100/68">Role-aware access, curated workflows, and audit-friendly controls.</p>
            </div>
            <div className="rounded-3xl border border-white/12 bg-white/8 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-200/60">Visibility</p>
              <p className="mt-3 text-2xl font-semibold">Full context</p>
              <p className="mt-2 text-sm text-blue-100/68">See trends, transactions, and system actions without switching tools.</p>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 lg:p-10">
          <div className="mx-auto w-full max-w-[390px]">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#1E3A8A_0%,#2D55CC_100%)] shadow-[0_12px_26px_rgba(30,58,138,0.28)]">
                <IndianRupee className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-600">Premium Finance Admin</p>
                <span className="text-xl font-semibold text-slate-950">PaisaTrack</span>
              </div>
            </div>

            <div className="mb-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-600">Secure Access</p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-950">
                Sign in to continue
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-700">
                Use your administrator credentials to access the finance control workspace.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-slate-700">Username</Label>

                <Input
                  id="username"
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="h-12 rounded-2xl border-slate-200 bg-white/90 px-4"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="h-12 rounded-2xl border-slate-200 bg-white/90 px-4 pr-12"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-700 transition-colors hover:text-slate-900"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border-0 bg-[linear-gradient(135deg,#1E3A8A_0%,#2D55CC_100%)] py-2.5 text-white shadow-[0_18px_35px_rgba(30,58,138,0.28)] hover:opacity-95 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader size={20} />
                    <span>Logging in...</span>
                  </>
                ) : (
                  'Login'
                )}
              </Button>

              <p className="mt-4 text-center text-xs font-medium uppercase tracking-[0.18em] text-slate-600">
                Secure Admin Access
              </p>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
