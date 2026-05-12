import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Layout } from '../../components/Layout';
import { Loader } from '../../components/Loader';
import { Modal, Pagination, StatusBadge, ActionButtons, PageHeader, DataTable, rowBg, FormField, StyledInput, FormError, ModalActions } from '../../components/shared';
import { styles } from '../../../app/constants/styles';
import config from '../../../config/global.json';
import { apiRequest } from '../../../utils/api';
import { useDebounce } from '../../hooks/useDebounce';
import { Plus, Eye, EyeOff, AlertTriangle } from 'lucide-react';

interface User {
  id: string; email: string; first_name: string; last_name: string;
  contact_no: string; date_of_birth: string; groups: number[];
  is_active: boolean; is_superuser: boolean;
}
interface UsersResponse { count: number; next: string | null; previous: string | null; results: User[]; }

const PAGE_SIZE = 10;
const emptyForm = { email: '', password: '', first_name: '', last_name: '', contact_no: '', date_of_birth: '', groups: [1], is_active: true };

export function Users() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [formData, setFormData] = useState(emptyForm);

  const checkAuth = () => { if (!localStorage.getItem('token')) { navigate('/'); return false; } return true; };

  const fetchUsers = async (search: string, page: number) => {
    if (!checkAuth()) return;
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: page.toString() });
      if (search) params.append('search', search);
      const res = await apiRequest(`${config.api.host}${config.api.user}?${params}`);
      const data: UsersResponse = await res.json();
      const filtered = (data.results || []).filter(u => !u.is_superuser);
      setUsers(filtered);
      if (page === 1 && !search) {
        try {
          const all = await apiRequest(`${config.api.host}${config.api.user}?page_size=1000`);
          const allData: UsersResponse = await all.json();
          setTotalCount((allData.results || []).filter(u => !u.is_superuser).length);
        } catch { setTotalCount(filtered.length); }
      } else {
        setTotalCount(Math.max(totalCount, (page - 1) * PAGE_SIZE + filtered.length));
      }
    } catch { setError('Failed to load users'); setUsers([]); setTotalCount(0); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(searchQuery, currentPage); }, [currentPage, searchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (users.some(u => u.email.toLowerCase() === formData.email.toLowerCase() && (!editingUser || u.id !== editingUser.id))) { setError('Email already exists.'); return; }
    if (formData.contact_no.length !== 10) { setError('Contact number must be exactly 10 digits.'); return; }
    try {
      const url = editingUser ? `${config.api.host}${config.api.user}${editingUser.id}/` : `${config.api.host}${config.api.createUser}`;
      const body = editingUser ? { ...formData, ...(formData.password ? {} : { password: undefined }), date_of_birth: formData.date_of_birth || editingUser.date_of_birth } : formData;
      const res = await apiRequest(url, { method: editingUser ? 'PUT' : 'POST', body: JSON.stringify(body) });
      if (!res.ok) { setError(JSON.stringify(await res.json())); return; }
      closeModal(); fetchUsers(searchQuery, currentPage);
    } catch { setError('Failed to save user'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this user?')) return;
    try { await apiRequest(`${config.api.host}${config.api.user}${id}/`, { method: 'DELETE' }); fetchUsers(searchQuery, currentPage); }
    catch { console.error('Delete failed'); }
  };

  const handlePermanentDelete = async () => {
    if (!userToDelete) return;
    try {
      await apiRequest(`${config.api.host}${config.api.user}${userToDelete.id}/permanent-delete/`, { method: 'DELETE' });
      setShowDeleteModal(false); setUserToDelete(null); fetchUsers(searchQuery, currentPage);
    } catch { setError('Failed to permanently delete user'); }
  };

  const closeModal = () => { setShowModal(false); setEditingUser(null); setShowPassword(false); setFormData(emptyForm); };

  const debouncedSearch = useDebounce((q) => { setSearchQuery(q); setCurrentPage(1); });

  if (loading) return <Layout pageTitle="Users"><div className="flex items-center justify-center py-16"><Loader size={120} /></div></Layout>;

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const columns = [
    { key: 'name', label: 'Name' }, { key: 'email', label: 'Email' },
    { key: 'contact', label: 'Contact' }, { key: 'dob', label: 'DOB' },
    { key: 'status', label: 'Status' }, { key: 'actions', label: 'Actions' },
  ];

  return (
    <Layout pageTitle="Users" onSearch={debouncedSearch} searchPlaceholder="Search users...">
      <div className="rounded-2xl border p-6" style={styles.card}>
        <PageHeader
          title="User Management"
          subtitle={`${totalCount} total users`}
          actions={
            <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5" style={styles.btnPrimary}>
              <Plus className="w-4 h-4" /> Add User
            </button>
          }
        />

        <DataTable
          columns={columns}
          emptyMessage="No users found"
          rows={users.map((user, i) => (
            <tr key={user.id} style={rowBg(i)}>
              <td className={`${styles.td} font-semibold`} style={{ color: 'var(--foreground)' }}>
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0"
                    style={{ background: 'linear-gradient(140deg, #0D1E5C, #3B6AEA)' }}>
                    {user.first_name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  {user.first_name} {user.last_name}
                </div>
              </td>
              <td className={styles.td} style={{ color: 'var(--muted-foreground)' }}>{user.email}</td>
              <td className={styles.td} style={{ color: 'var(--muted-foreground)' }}>{user.contact_no}</td>
              <td className={styles.td} style={{ color: 'var(--muted-foreground)' }}>{user.date_of_birth}</td>
              <td className={styles.td}><StatusBadge active={user.is_active} /></td>
              <td className={styles.td}>
                <ActionButtons
                  onDelete={() => handleDelete(user.id)}
                  extra={[{ icon: AlertTriangle, onClick: () => { setUserToDelete(user); setShowDeleteModal(true); }, title: 'Permanent Delete' }]}
                />
              </td>
            </tr>
          ))}
        />

        <Pagination currentPage={currentPage} totalPages={totalPages} totalCount={totalCount} pageSize={PAGE_SIZE} onPageChange={setCurrentPage} />
      </div>

      {/* Permanent Delete Modal */}
      {showDeleteModal && (
        <Modal title="Permanent Delete" onClose={() => { setShowDeleteModal(false); setUserToDelete(null); }}>
          <div className="flex items-center gap-3 mb-4 -mt-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(239,68,68,0.12)' }}>
              <AlertTriangle className="w-5 h-5" style={{ color: 'var(--destructive)' }} />
            </div>
          </div>
          <div className="mb-5 p-3 rounded-xl border" style={{ background: 'rgba(239,68,68,0.06)', borderColor: 'rgba(239,68,68,0.2)' }}>
            <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{userToDelete?.first_name} {userToDelete?.last_name}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{userToDelete?.email}</p>
          </div>
          <p className="text-xs font-semibold mb-5" style={{ color: 'var(--destructive)' }}>⚠️ This cannot be undone. All user data will be permanently removed.</p>
          <div className="flex gap-3">
            <button onClick={handlePermanentDelete} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-0.5" style={styles.btnDanger}>
              Delete Permanently
            </button>
            <button onClick={() => { setShowDeleteModal(false); setUserToDelete(null); }} className="flex-1 py-2.5 rounded-xl text-sm font-bold border transition-colors"
              style={{ borderColor: 'var(--border)', color: 'var(--foreground)', background: 'var(--muted)' }}>
              Cancel
            </button>
          </div>
        </Modal>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <Modal title={editingUser ? 'Edit User' : 'Add User'} onClose={closeModal}>
          <FormError message={error} />
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Email">
              <StyledInput type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
            </FormField>

            <FormField label={editingUser ? 'Password (leave empty to keep)' : 'Password'}>
              <div className="relative">
                <StyledInput type={showPassword ? 'text' : 'password'} value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })} required={!editingUser} className="pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="First Name">
                <StyledInput type="text" value={formData.first_name} onChange={e => setFormData({ ...formData, first_name: e.target.value })} required />
              </FormField>
              <FormField label="Last Name">
                <StyledInput type="text" value={formData.last_name} onChange={e => setFormData({ ...formData, last_name: e.target.value })} required />
              </FormField>
            </div>

            <FormField label="Contact No" error={formData.contact_no && formData.contact_no.length < 10 ? 'Must be 10 digits' : ''}>
              <StyledInput type="tel" value={formData.contact_no}
                onChange={e => { const v = e.target.value.replace(/\D/g, ''); if (v.length <= 10) setFormData({ ...formData, contact_no: v }); }}
                placeholder="1234567890" maxLength={10} required />
            </FormField>

            <FormField label={editingUser ? 'Date of Birth (leave empty to keep)' : 'Date of Birth'}>
              <StyledInput type="date" value={formData.date_of_birth} onChange={e => setFormData({ ...formData, date_of_birth: e.target.value })} required={!editingUser} />
            </FormField>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} className="rounded" />
              <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Active User</span>
            </label>

            <ModalActions onCancel={closeModal} submitLabel={editingUser ? 'Update' : 'Create'} />
          </form>
        </Modal>
      )}
    </Layout>
  );
}
