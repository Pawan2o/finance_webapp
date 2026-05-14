import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Loader } from '../components/Loader';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import config from '../../config/global.json';
import { apiUrl } from '../../utils/api';

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
      const tokenRes = await fetch(apiUrl(config.api.token), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!tokenRes.ok) {
        const errorData = await tokenRes.json().catch(() => ({}));
        setError(errorData.detail || 'Invalid username or password');
        return;
      }

      const tokenData = await tokenRes.json();
      const userRes = await fetch(apiUrl(config.api.isSuperUser), {
        method: 'GET',
        headers: { Authorization: `Bearer ${tokenData.access}` },
      });

      if (!userRes.ok) {
        setError('Failed to verify user');
        return;
      }

      const userData = await userRes.json();

      if (userData.user_type === 'superuser') {
        localStorage.setItem('token', tokenData.access);
        localStorage.setItem('refresh', tokenData.refresh);
        navigate('/dashboard');
      } else {
        setError('Access Denied. Only Admin can login.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--background)' }}>
      <div className="fixed left-0 top-0 h-full w-full overflow-hidden pointer-events-none">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #2D55CC, transparent 70%)' }} />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #3B6AEA, transparent 70%)' }} />
      </div>

      <div
        className="relative z-10 w-full max-w-[400px] rounded-3xl border p-8"
        style={{ background: 'var(--card)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-xl, 0 20px 60px rgba(15,23,42,0.12))' }}
      >
        <div className="mb-8 flex items-center justify-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-2xl text-lg font-bold text-white"
            style={{ background: 'linear-gradient(140deg, #0D1E5C 0%, #2448AC 60%, #3B6AEA 100%)', boxShadow: 'var(--shadow-brand)' }}
          >
            P
          </div>
          <span className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--foreground)' }}>
            PaisaTrack
          </span>
        </div>

        <h2 className="mb-1 text-center text-xl font-extrabold tracking-tight" style={{ color: 'var(--foreground)' }}>
          Welcome back
        </h2>
        <p className="mb-7 text-center text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
          Sign in to your admin account
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div
              className="rounded-xl border px-4 py-3 text-center text-sm font-semibold"
              style={{ color: 'var(--destructive)', background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.2)' }}
            >
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="username" className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>
              Username
            </Label>
            <Input
              id="username"
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="h-12 rounded-xl font-medium"
              style={{ background: 'var(--input-background)', borderColor: 'var(--input)' }}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="h-12 rounded-xl pr-12 font-medium"
                style={{ background: 'var(--input-background)', borderColor: 'var(--input)' }}
              />
              <button
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((current) => !current)}
                className="absolute inset-y-0 right-0 flex w-12 items-center justify-center"
                style={{ color: 'var(--muted-foreground)' }}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, var(--primary), #3B6AEA)', boxShadow: 'var(--shadow-brand)' }}
          >
            {loading ? (
              <>
                <Loader size={20} />
                <span>Signing in...</span>
              </>
            ) : (
              'Sign In'
            )}
          </Button>

          <p className="mt-4 text-center text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>
            Secure Admin Access
          </p>
        </form>
      </div>
    </div>
  );
}
