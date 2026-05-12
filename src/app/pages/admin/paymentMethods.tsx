import { useEffect, useState } from 'react';
import { Layout } from '../../components/Layout';
import { Loader } from '../../components/Loader';
import { Modal, StatusBadge, ActionButtons, PageHeader, DataTable, rowBg, FormField, StyledInput, FormError, ModalActions } from '../../components/shared';
import { styles } from '../../../app/constants/styles';
import config from '../../../config/global.json';
import { apiRequest } from '../../../utils/api';
import { useDebounce } from '../../hooks/useDebounce';
import { Plus, Trash2, CheckSquare, Square } from 'lucide-react';

interface PaymentMethod { id: string; payment_method: string; is_active: boolean; created_at: string; }

const emptyForm = { payment_method: '', is_active: true };

export function PaymentMethods() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const fetchPaymentMethods = async (search = '') => {
    try {
      const url = search ? `${config.api.host}${config.api.paymentMethod}?search=${encodeURIComponent(search)}` : `${config.api.host}${config.api.paymentMethod}`;
      const res = await apiRequest(url);
      const data = await res.json();
      setPaymentMethods(data.results || []);
    } catch { console.error('Failed to fetch payment methods'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPaymentMethods(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingMethod ? `${config.api.host}${config.api.paymentMethod}${editingMethod.id}/` : `${config.api.host}${config.api.paymentMethod}`;
    try {
      await apiRequest(url, { method: editingMethod ? 'PUT' : 'POST', body: JSON.stringify(formData) });
      closeModal(); fetchPaymentMethods(searchQuery);
    } catch { console.error('Failed to save'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this payment method?')) return;
    try { await apiRequest(`${config.api.host}${config.api.paymentMethod}${id}/`, { method: 'DELETE' }); fetchPaymentMethods(searchQuery); }
    catch { console.error('Delete failed'); }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedIds.size} items?`)) return;
    try {
      await Promise.all(Array.from(selectedIds).map(id => apiRequest(`${config.api.host}${config.api.paymentMethod}${id}/`, { method: 'DELETE' })));
      setSelectedIds(new Set()); fetchPaymentMethods(searchQuery);
    } catch { console.error('Bulk delete failed'); }
  };

  const toggleSelect = (id: string) => setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleSelectAll = () => setSelectedIds(prev => prev.size === paymentMethods.length ? new Set() : new Set(paymentMethods.map(m => m.id)));

  const handleEdit = (method: PaymentMethod) => { setEditingMethod(method); setFormData({ payment_method: method.payment_method, is_active: method.is_active }); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditingMethod(null); setFormData(emptyForm); };

  const debouncedSearch = useDebounce((q) => { setSearchQuery(q); fetchPaymentMethods(q); });

  if (loading) return <Layout pageTitle="Payment Methods"><div className="flex items-center justify-center py-16"><Loader size={120} /></div></Layout>;

  const allSelected = selectedIds.size === paymentMethods.length && paymentMethods.length > 0;
  const columns = [{ key: 'method', label: 'Payment Method' }, { key: 'status', label: 'Status' }, { key: 'created', label: 'Created' }, { key: 'actions', label: 'Actions' }];

  const selectAllBtn = (
    <button onClick={toggleSelectAll}>
      {allSelected ? <CheckSquare className="w-4 h-4" style={{ color: 'var(--primary)' }} /> : <Square className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />}
    </button>
  );

  return (
    <Layout pageTitle="Payment Methods" onSearch={debouncedSearch} searchPlaceholder="Search payment methods...">
      <div className="rounded-2xl border p-6" style={styles.card}>
        <PageHeader
          title="Payment Methods"
          subtitle={`${paymentMethods.length} total methods`}
          actions={
            <>
              {selectedIds.size > 0 && (
                <button onClick={handleBulkDelete} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-0.5" style={styles.btnDanger}>
                  <Trash2 className="w-4 h-4" /> Delete ({selectedIds.size})
                </button>
              )}
              <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5 flex-1 sm:flex-initial justify-center" style={styles.btnPrimary}>
                <Plus className="w-4 h-4" /> Add Method
              </button>
            </>
          }
        />

        {/* Mobile */}
        <div className="block sm:hidden space-y-2">
          {paymentMethods.map(method => (
            <div key={method.id} className="p-4 rounded-xl border" style={{ borderColor: 'var(--border)', background: 'var(--muted)' }}>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleSelect(method.id)}>
                    {selectedIds.has(method.id) ? <CheckSquare className="w-5 h-5" style={{ color: 'var(--primary)' }} /> : <Square className="w-5 h-5" style={{ color: 'var(--muted-foreground)' }} />}
                  </button>
                  <p className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>{method.payment_method}</p>
                </div>
                <ActionButtons onEdit={() => handleEdit(method)} onDelete={() => handleDelete(method.id)} />
              </div>
              <div className="flex items-center gap-2 mt-2 ml-7">
                <StatusBadge active={method.is_active} />
                <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{new Date(method.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop */}
        <div className="hidden sm:block">
          <DataTable
            columns={columns}
            prefixHeader={selectAllBtn}
            emptyMessage="No payment methods found"
            rows={paymentMethods.map((method, i) => (
              <tr key={method.id} style={rowBg(i)}>
                <td className="px-5 py-3.5">
                  <button onClick={() => toggleSelect(method.id)}>
                    {selectedIds.has(method.id) ? <CheckSquare className="w-4 h-4" style={{ color: 'var(--primary)' }} /> : <Square className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />}
                  </button>
                </td>
                <td className={`${styles.td} font-semibold`} style={{ color: 'var(--foreground)' }}>{method.payment_method}</td>
                <td className={styles.td}><StatusBadge active={method.is_active} /></td>
                <td className={styles.td} style={{ color: 'var(--muted-foreground)' }}>{new Date(method.created_at).toLocaleDateString()}</td>
                <td className={styles.td}><ActionButtons onEdit={() => handleEdit(method)} onDelete={() => handleDelete(method.id)} /></td>
              </tr>
            ))}
          />
        </div>
      </div>

      {showModal && (
        <Modal title={editingMethod ? 'Edit Method' : 'Add Payment Method'} onClose={closeModal}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Payment Method">
              <StyledInput type="text" value={formData.payment_method} onChange={e => setFormData({ ...formData, payment_method: e.target.value })} placeholder="Card, Cash, UPI, etc." required />
            </FormField>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} className="rounded" />
              <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Active</span>
            </label>
            <ModalActions onCancel={closeModal} submitLabel={editingMethod ? 'Update' : 'Create'} />
          </form>
        </Modal>
      )}
    </Layout>
  );
}
