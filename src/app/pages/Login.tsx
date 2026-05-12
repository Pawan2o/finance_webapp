// Login page component - handles admin authentication
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Loader } from '../components/Loader';
import config from '../../config/global.json';

export function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--background)' }}>
      {/* Background glow orbs */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #2D55CC, transparent 70%)' }} />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #3B6AEA, transparent 70%)' }} />
      </div>

      <div className="w-full max-w-[400px] rounded-3xl p-8 border relative z-10" style={{ background: 'var(--card)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-xl, 0 20px 60px rgba(15,23,42,0.12))' }}>

        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold text-lg"
            style={{ background: 'linear-gradient(140deg, #0D1E5C 0%, #2448AC 60%, #3B6AEA 100%)', boxShadow: 'var(--shadow-brand)' }}
          >
            P
          </div>
          <span className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--foreground)' }}>PaisaTrack</span>
        </div>

        <h2 className="text-center text-xl font-extrabold tracking-tight mb-1" style={{ color: 'var(--foreground)' }}>Welcome back</h2>
        <p className="text-center text-sm font-medium mb-7" style={{ color: 'var(--muted-foreground)' }}>Sign in to your admin account</p>

        <form onSubmit={handleLogin} className="space-y-4">

          {error && (
            <div className="text-sm text-center font-semibold px-4 py-3 rounded-xl border" style={{ color: 'var(--destructive)', background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.2)' }}>
              {error}
            </div>
          )}

          {/* Username */}
          <div className="space-y-1.5">
            <Label htmlFor="username" className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="rounded-xl h-12 font-medium"
              style={{ background: 'var(--input-background)', borderColor: 'var(--input)' }}
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="rounded-xl h-12 font-medium"
              style={{ background: 'var(--input-background)', borderColor: 'var(--input)' }}
            />
          </div>

          {/* Login Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl text-white font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            style={{ background: 'linear-gradient(135deg, var(--primary), #3B6AEA)', boxShadow: 'var(--shadow-brand)' }}
          >
            {loading ? (<><Loader size={20} /><span>Signing in...</span></>) : 'Sign In'}
          </Button>

          <p className="text-center text-xs font-semibold mt-4" style={{ color: 'var(--muted-foreground)' }}>🔒 Secure Admin Access</p>
        </form>
      </div>
    </div>
  );
}