import { useEffect, useState } from 'react';
import { Layout } from '../../components/Layout';
import { Loader } from '../../components/Loader';
import { Modal, ActionButtons, PageHeader, DataTable, rowBg, FormField, StyledInput, ModalActions } from '../../components/shared';
import { styles } from '../../../app/constants/styles';
import config from '../../../config/global.json';
import { apiRequest } from '../../../utils/api';
import { Plus, Shield } from 'lucide-react';

interface Permission { id: number; name: string; }
interface Role { id: number; name: string; permissions: Permission[]; }

const emptyForm = { name: '', permissions: [] as number[] };

export function Roles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState(emptyForm);

  const fetchRoles = async () => {
    try { const res = await apiRequest(`${config.api.host}${config.api.role}`); const data = await res.json(); setRoles(data.results || []); }
    catch { console.error('Failed to fetch roles'); }
    finally { setLoading(false); }
  };

  const fetchPermissions = async () => {
    try {
      let all: Permission[] = [];
      let url: string | null = `${config.api.host}${config.api.permission}`;
      while (url) { const res = await apiRequest(url); const data = await res.json(); all = [...all, ...(data.results || [])]; url = data.next; }
      setPermissions(all);
    } catch { console.error('Failed to fetch permissions'); }
  };

  useEffect(() => { fetchRoles(); fetchPermissions(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingRole ? `${config.api.host}${config.api.role}${editingRole.id}/` : `${config.api.host}${config.api.role}`;
    try { await apiRequest(url, { method: editingRole ? 'PATCH' : 'POST', body: JSON.stringify(formData) }); closeModal(); fetchRoles(); }
    catch { console.error('Failed to save role'); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this role?')) return;
    try { await apiRequest(`${config.api.host}${config.api.role}${id}/`, { method: 'DELETE' }); fetchRoles(); }
    catch { console.error('Delete failed'); }
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    const ids = Array.isArray(role.permissions) ? role.permissions.map(p => typeof p === 'number' ? p : p.id).filter(Boolean) : [];
    setFormData({ name: role.name, permissions: ids });
    setShowModal(true);
  };

  const togglePermission = (id: number) => setFormData(prev => ({
    ...prev,
    permissions: prev.permissions.includes(id) ? prev.permissions.filter(p => p !== id) : [...prev.permissions, id],
  }));

  const closeModal = () => { setShowModal(false); setEditingRole(null); setFormData(emptyForm); };

  if (loading) return <Layout pageTitle="Roles"><div className="flex items-center justify-center py-16"><Loader size={120} /></div></Layout>;

  const columns = [{ key: 'name', label: 'Role Name' }, { key: 'perms', label: 'Permissions' }, { key: 'actions', label: 'Actions' }];

  return (
    <Layout pageTitle="Roles">
      <div className="rounded-2xl border p-6" style={styles.card}>
        <PageHeader
          title="Role Management"
          subtitle={`${roles.length} roles defined`}
          actions={
            <button onClick={() => { closeModal(); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5" style={styles.btnPrimary}>
              <Plus className="w-4 h-4" /> Add Role
            </button>
          }
        />

        <DataTable
          columns={columns}
          emptyMessage="No roles found"
          rows={roles.map((role, i) => (
            <tr key={role.id} style={rowBg(i)}>
              <td className={`${styles.td} font-semibold`} style={{ color: 'var(--foreground)' }}>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--accent)' }}>
                    <Shield className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />
                  </div>
                  {role.name}
                </div>
              </td>
              <td className={styles.td}>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide" style={{ background: 'var(--accent)', color: 'var(--accent-foreground)' }}>
                  {Array.isArray(role.permissions) && role.permissions.length > 0 ? `${role.permissions.length} assigned` : 'None'}
                </span>
              </td>
              <td className={styles.td}><ActionButtons onEdit={() => handleEdit(role)} onDelete={() => handleDelete(role.id)} /></td>
            </tr>
          ))}
        />
      </div>

      {showModal && (
        <Modal title={editingRole ? 'Edit Role' : 'Add Role'} onClose={closeModal}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Role Name">
              <StyledInput type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
            </FormField>
            <FormField label={`Permissions (${formData.permissions.length} selected)`}>
              <div className="max-h-48 overflow-y-auto rounded-xl border p-3 space-y-1.5" style={{ borderColor: 'var(--border)', background: 'var(--muted)' }}>
                {permissions.map(perm => (
                  <label key={perm.id} className="flex items-center gap-2.5 cursor-pointer py-0.5">
                    <input type="checkbox" checked={formData.permissions.includes(perm.id)} onChange={() => togglePermission(perm.id)} className="rounded" />
                    <span className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>{perm.name}</span>
                  </label>
                ))}
              </div>
            </FormField>
            <ModalActions onCancel={closeModal} submitLabel={editingRole ? 'Update' : 'Create'} />
          </form>
        </Modal>
      )}
    </Layout>
  );
}
