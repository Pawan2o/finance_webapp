import { FormEvent, useEffect, useState } from 'react';
import { Edit, Lock, Save, X } from 'lucide-react';
import { Layout } from '../../components/Layout';
import { Loader } from '../../components/Loader';
import config from '../../../config/global.json';
import { apiRequest, apiUrl } from '../../../utils/api';

interface AdminData {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  is_active: boolean;
  is_superuser: boolean;
  date_joined: string;
  last_login: string | null;
  contact_no: string | null;
  date_of_birth: string | null;
  groups: number[];
}

const card = { background: 'var(--card)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-md)' };
const btnPrimary: React.CSSProperties = { background: 'linear-gradient(135deg, var(--primary), #3B6AEA)', boxShadow: '0 4px 14px rgba(30,58,138,0.35)', color: '#fff' };
const inputStyle = (disabled: boolean): React.CSSProperties => ({
  background: disabled ? 'var(--muted)' : 'var(--input-background)',
  borderColor: 'var(--input)',
  color: disabled ? 'var(--muted-foreground)' : 'var(--foreground)',
  cursor: disabled ? 'not-allowed' : 'text',
});

export function Profile() {
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({ username: '', email: '', first_name: '', last_name: '', password: '', confirmPassword: '' });

  const getUserIdFromToken = (token: string): string | null => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.user_id || payload.sub || payload.id || null;
    } catch {
      return null;
    }
  };

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        await new Promise((r) => setTimeout(r, 100));
        const retryToken = localStorage.getItem('token');
        if (!retryToken) {
          setError('No authentication token found');
          setLoading(false);
          return;
        }
      }
      const userId = getUserIdFromToken(localStorage.getItem('token')!);
      if (!userId) {
        setError('Invalid token');
        setLoading(false);
        return;
      }
      const res = await apiRequest(apiUrl(`/api/v1/user/${userId}/`));
      if (!res.ok) {
        throw new Error(`API Error ${res.status}`);
      }
      const data = await res.json();
      setAdminData(data);
      setFormData({ username: data.username || '', email: data.email || '', first_name: data.first_name || '', last_name: data.last_name || '', password: '', confirmPassword: '' });
    } catch (err) {
      setError(`Failed to load profile: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!adminData?.id) {
      setError('User ID not found');
      return;
    }
    try {
      const body: any = { username: formData.username, email: formData.email, first_name: formData.first_name, last_name: formData.last_name };
      if (formData.password) {
        body.password = formData.password;
      }
      const res = await apiRequest(apiUrl(`/api/v1/user/${adminData.id}/`), { method: 'PUT', body: JSON.stringify(body) });
      if (!res.ok) {
        throw new Error(`Update failed: ${res.status}`);
      }
      const updated = await res.json();
      setAdminData(updated);
      setIsEditing(false);
      setSuccess('Profile updated successfully');
      setFormData((prev) => ({ ...prev, password: '', confirmPassword: '' }));
    } catch (err) {
      setError(`Failed to update: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleCancel = () => {
    if (adminData) {
      setFormData({ username: adminData.username, email: adminData.email, first_name: adminData.first_name, last_name: adminData.last_name, password: '', confirmPassword: '' });
    }
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return <Layout pageTitle="Profile"><div className="flex items-center justify-center py-16"><Loader size={120} /></div></Layout>;
  }

  const initials = `${adminData?.first_name?.[0] || ''}${adminData?.last_name?.[0] || ''}`.toUpperCase() || 'A';

  const Field = ({ id, label, type = 'text', value, onChange, placeholder }: { id: string; label: string; type?: string; value: string; onChange: (v: string) => void; placeholder?: string }) => (
    <div>
      <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>{label}</label>
      <input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} disabled={!isEditing} placeholder={placeholder} className="w-full rounded-xl border px-3 py-2.5 text-sm font-medium outline-none transition-colors" style={inputStyle(!isEditing)} />
    </div>
  );

  return (
    <Layout pageTitle="Profile">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl border p-6 md:p-8" style={card}>
          <div className="mb-8 flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl text-xl font-black text-white" style={{ background: 'linear-gradient(140deg, #0D1E5C 0%, #2448AC 55%, #3B6AEA 100%)', boxShadow: '0 8px 24px rgba(30,58,138,0.40)' }}>
                {initials}
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--foreground)' }}>{adminData?.first_name} {adminData?.last_name}</h1>
                <p className="mt-0.5 text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>{adminData?.email}</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide" style={{ background: 'var(--accent)', color: 'var(--accent-foreground)' }}>Super Admin</span>
                  <span className="rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide" style={{ background: 'rgba(16,185,129,0.12)', color: 'var(--success)', border: '1px solid rgba(16,185,129,0.25)' }}>Active</span>
                </div>
              </div>
            </div>

            {!isEditing && (
              <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all hover:-translate-y-0.5" style={btnPrimary}>
                <Edit className="h-4 w-4" /> Edit Profile
              </button>
            )}
          </div>

          {error && <div className="mb-5 rounded-xl border p-3 text-xs font-semibold" style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.2)', color: 'var(--destructive)' }}>{error}</div>}
          {success && <div className="mb-5 rounded-xl border p-3 text-xs font-semibold" style={{ background: 'rgba(16,185,129,0.08)', borderColor: 'rgba(16,185,129,0.25)', color: 'var(--success)' }}>{success}</div>}

          <form onSubmit={handleUpdate} className="space-y-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field id="username" label="Username" value={formData.username} onChange={(v) => setFormData((p) => ({ ...p, username: v }))} />
              <Field id="email" label="Email" type="email" value={formData.email} onChange={(v) => setFormData((p) => ({ ...p, email: v }))} />
              <Field id="first_name" label="First Name" value={formData.first_name} onChange={(v) => setFormData((p) => ({ ...p, first_name: v }))} />
              <Field id="last_name" label="Last Name" value={formData.last_name} onChange={(v) => setFormData((p) => ({ ...p, last_name: v }))} />
            </div>

            {adminData && (
              <div className="grid grid-cols-1 gap-4 border-t pt-2 md:grid-cols-2" style={{ borderColor: 'var(--border)' }}>
                <div>
                  <p className="mb-1 text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>Date Joined</p>
                  <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{new Date(adminData.date_joined).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="mb-1 text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>Last Login</p>
                  <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{adminData.last_login ? new Date(adminData.last_login).toLocaleString() : 'N/A'}</p>
                </div>
              </div>
            )}

            {isEditing && (
              <div className="border-t pt-4" style={{ borderColor: 'var(--border)' }}>
                <div className="mb-4 flex items-center gap-2">
                  <Lock className="h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />
                  <p className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>Change Password (Optional)</p>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>New Password</label>
                    <input type="password" value={formData.password} onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))} placeholder="Leave blank to keep current" className="w-full rounded-xl border px-3 py-2.5 text-sm font-medium outline-none" style={inputStyle(false)} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>Confirm Password</label>
                    <input type="password" value={formData.confirmPassword} onChange={(e) => setFormData((p) => ({ ...p, confirmPassword: e.target.value }))} placeholder="Confirm new password" className="w-full rounded-xl border px-3 py-2.5 text-sm font-medium outline-none" style={inputStyle(false)} />
                  </div>
                </div>
              </div>
            )}

            {isEditing && (
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5" style={btnPrimary}>
                  <Save className="h-4 w-4" /> Save Changes
                </button>
                <button type="button" onClick={handleCancel} className="flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-bold transition-colors" style={{ borderColor: 'var(--border)', color: 'var(--foreground)', background: 'var(--muted)' }}>
                  <X className="h-4 w-4" /> Cancel
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </Layout>
  );
}
