import { useState, useEffect, FormEvent } from 'react';
import { Layout } from '../../components/Layout';
import { Loader } from '../../components/Loader';
import { Edit, Save, X, Lock } from 'lucide-react';
import config from '../../../config/global.json';
import { apiRequest } from '../../../utils/api';

interface AdminData {
  id: string; username: string; email: string;
  first_name: string; last_name: string;
  is_staff: boolean; is_active: boolean; is_superuser: boolean;
  date_joined: string; last_login: string | null;
  contact_no: string | null; date_of_birth: string | null; groups: number[];
}

const card       = { background: 'var(--card)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-md)' };
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
    try { const p = JSON.parse(atob(token.split('.')[1])); return p.user_id || p.sub || p.id || null; }
    catch { return null; }
  };

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        // Retry once after a short delay in case token is being set
        await new Promise(r => setTimeout(r, 100));
        const retryToken = localStorage.getItem('token');
        if (!retryToken) { setError('No authentication token found'); setLoading(false); return; }
      }
      const userId = getUserIdFromToken(localStorage.getItem('token')!);
      if (!userId) { setError('Invalid token'); setLoading(false); return; }
      const res = await apiRequest(`${config.api.host}/api/v1/user/${userId}/`);
      if (!res.ok) throw new Error(`API Error ${res.status}`);
      const data = await res.json();
      setAdminData(data);
      setFormData({ username: data.username || '', email: data.email || '', first_name: data.first_name || '', last_name: data.last_name || '', password: '', confirmPassword: '' });
    } catch (err) { setError(`Failed to load profile: ${err instanceof Error ? err.message : 'Unknown error'}`); }
    finally { setLoading(false); }
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault(); setError(''); setSuccess('');
    if (formData.password && formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return; }
    if (!adminData?.id) { setError('User ID not found'); return; }
    try {
      const body: any = { username: formData.username, email: formData.email, first_name: formData.first_name, last_name: formData.last_name };
      if (formData.password) body.password = formData.password;
      const res = await apiRequest(`${config.api.host}/api/v1/user/${adminData.id}/`, {
        method: 'PUT', body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error(`Update failed: ${res.status}`);
      const updated = await res.json();
      setAdminData(updated); setIsEditing(false); setSuccess('Profile updated successfully');
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
    } catch (err) { setError(`Failed to update: ${err instanceof Error ? err.message : 'Unknown error'}`); }
  };

  const handleCancel = () => {
    if (adminData) setFormData({ username: adminData.username, email: adminData.email, first_name: adminData.first_name, last_name: adminData.last_name, password: '', confirmPassword: '' });
    setIsEditing(false); setError(''); setSuccess('');
  };

  useEffect(() => { fetchProfile(); }, []);

  if (loading) return <Layout pageTitle="Profile"><div className="flex items-center justify-center py-16"><Loader size={120} /></div></Layout>;

  const initials = `${adminData?.first_name?.[0] || ''}${adminData?.last_name?.[0] || ''}`.toUpperCase() || 'A';

  const Field = ({ id, label, type = 'text', value, onChange, placeholder }: { id: string; label: string; type?: string; value: string; onChange: (v: string) => void; placeholder?: string }) => (
    <div>
      <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5" style={{ color: 'var(--muted-foreground)' }}>{label}</label>
      <input id={id} type={type} value={value} onChange={e => onChange(e.target.value)} disabled={!isEditing} placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-xl border text-sm font-medium outline-none transition-colors"
        style={inputStyle(!isEditing)} />
    </div>
  );

  return (
    <Layout pageTitle="Profile">
      <div className="max-w-2xl mx-auto">
        <div className="rounded-2xl border p-6 md:p-8" style={card}>

          {/* Profile header */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-black flex-shrink-0"
                style={{ background: 'linear-gradient(140deg, #0D1E5C 0%, #2448AC 55%, #3B6AEA 100%)', boxShadow: '0 8px 24px rgba(30,58,138,0.40)' }}>
                {initials}
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--foreground)' }}>
                  {adminData?.first_name} {adminData?.last_name}
                </h1>
                <p className="text-sm font-medium mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{adminData?.email}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide"
                    style={{ background: 'var(--accent)', color: 'var(--accent-foreground)' }}>
                    Super Admin
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide"
                    style={{ background: 'rgba(16,185,129,0.12)', color: 'var(--success)', border: '1px solid rgba(16,185,129,0.25)' }}>
                    Active
                  </span>
                </div>
              </div>
            </div>

            {!isEditing && (
              <button onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5" style={btnPrimary}>
                <Edit className="w-4 h-4" /> Edit Profile
              </button>
            )}
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-5 p-3 rounded-xl text-xs font-semibold border" style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.2)', color: 'var(--destructive)' }}>{error}</div>
          )}
          {success && (
            <div className="mb-5 p-3 rounded-xl text-xs font-semibold border" style={{ background: 'rgba(16,185,129,0.08)', borderColor: 'rgba(16,185,129,0.25)', color: 'var(--success)' }}>{success}</div>
          )}

          {/* Form */}
          <form onSubmit={handleUpdate} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field id="username" label="Username" value={formData.username} onChange={v => setFormData(p => ({ ...p, username: v }))} />
              <Field id="email" label="Email" type="email" value={formData.email} onChange={v => setFormData(p => ({ ...p, email: v }))} />
              <Field id="first_name" label="First Name" value={formData.first_name} onChange={v => setFormData(p => ({ ...p, first_name: v }))} />
              <Field id="last_name" label="Last Name" value={formData.last_name} onChange={v => setFormData(p => ({ ...p, last_name: v }))} />
            </div>

            {/* Account info (read-only) */}
            {adminData && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: 'var(--muted-foreground)' }}>Date Joined</p>
                  <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{new Date(adminData.date_joined).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: 'var(--muted-foreground)' }}>Last Login</p>
                  <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{adminData.last_login ? new Date(adminData.last_login).toLocaleString() : 'N/A'}</p>
                </div>
              </div>
            )}

            {/* Password section */}
            {isEditing && (
              <div className="pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <Lock className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
                  <p className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>Change Password (Optional)</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5" style={{ color: 'var(--muted-foreground)' }}>New Password</label>
                    <input type="password" value={formData.password} onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
                      placeholder="Leave blank to keep current"
                      className="w-full px-3 py-2.5 rounded-xl border text-sm font-medium outline-none" style={inputStyle(false)} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Confirm Password</label>
                    <input type="password" value={formData.confirmPassword} onChange={e => setFormData(p => ({ ...p, confirmPassword: e.target.value }))}
                      placeholder="Confirm new password"
                      className="w-full px-3 py-2.5 rounded-xl border text-sm font-medium outline-none" style={inputStyle(false)} />
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons */}
            {isEditing && (
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-0.5" style={btnPrimary}>
                  <Save className="w-4 h-4" /> Save Changes
                </button>
                <button type="button" onClick={handleCancel} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border transition-colors"
                  style={{ borderColor: 'var(--border)', color: 'var(--foreground)', background: 'var(--muted)' }}>
                  <X className="w-4 h-4" /> Cancel
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </Layout>
  );
}
