import { useEffect, useState } from 'react';
import { Layout } from '../../components/Layout';
import { Loader } from '../../components/Loader';
import { Modal, Pagination, ActionButtons, PageHeader, DataTable, rowBg, FormField, StyledInput, StyledSelect, FormError, ModalActions } from '../../components/shared';
import { styles } from '../../../app/constants/styles';
import config from '../../../config/global.json';
import { apiRequest } from '../../../utils/api';
import { useDebounce } from '../../hooks/useDebounce';
import { Plus } from 'lucide-react';

interface Type { id: string; name: string; }
interface Category { id: string; name: string; type: string | Type; material_icon?: string; created_at: string; }
interface CategoriesResponse { count: number; results: Category[]; }

const PAGE_SIZE = 10;
const emptyForm = { name: '', type: '', material_icon: '' };

export function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [types, setTypes] = useState<Type[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState('');

  const fetchCategories = async (search: string, page: number) => {
    try {
      const url = search
        ? `${config.api.host}${config.api.category}?search=${encodeURIComponent(search)}&page=${page}`
        : `${config.api.host}${config.api.category}?page=${page}`;
      const res = await apiRequest(url);
      const data: CategoriesResponse = await res.json();
      setCategories(data.results || []); setTotalCount(data.count || 0);
    } catch { console.error('Failed to fetch categories'); }
    finally { setLoading(false); }
  };

  const fetchTypes = async () => {
    try { const res = await apiRequest(`${config.api.host}${config.api.type}`); const data = await res.json(); setTypes(data.results || []); }
    catch { console.error('Failed to fetch types'); }
  };

  useEffect(() => { setLoading(true); fetchCategories(searchQuery, currentPage); }, [currentPage, searchQuery]);
  useEffect(() => { fetchTypes(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    const url = editingCategory ? `${config.api.host}${config.api.category}${editingCategory.id}/` : `${config.api.host}${config.api.category}`;
    try {
      const res = await apiRequest(url, { method: editingCategory ? 'PUT' : 'POST', body: JSON.stringify(formData) });
      if (!res.ok) { const d = await res.json(); setError(d.non_field_errors?.[0] || d.name?.[0] || 'Failed to save category'); return; }
      closeModal(); fetchCategories(searchQuery, currentPage);
    } catch { setError('Failed to save category'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    try { await apiRequest(`${config.api.host}${config.api.category}${id}/`, { method: 'DELETE' }); fetchCategories(searchQuery, currentPage); }
    catch { console.error('Delete failed'); }
  };

  const getTypeName = (t: string | Type) => typeof t === 'object' ? t.name : types.find(x => x.id === t)?.name || 'N/A';

  const handleEdit = (cat: Category) => {
    setEditingCategory(cat);
    setFormData({ name: cat.name, type: typeof cat.type === 'object' ? cat.type.id : cat.type, material_icon: cat.material_icon || '' });
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditingCategory(null); setError(''); setFormData(emptyForm); };

  const debouncedSearch = useDebounce((q) => { setSearchQuery(q); setCurrentPage(1); }, 500);

  if (loading) return <Layout pageTitle="Categories"><div className="flex items-center justify-center py-16"><Loader size={120} /></div></Layout>;

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const columns = [{ key: 'name', label: 'Name' }, { key: 'type', label: 'Type' }, { key: 'created', label: 'Created' }, { key: 'actions', label: 'Actions' }];

  return (
    <Layout pageTitle="Categories" onSearch={debouncedSearch} searchPlaceholder="Search categories...">
      <div className="rounded-2xl border p-6" style={styles.card}>
        <PageHeader
          title="Category Management"
          subtitle={`${totalCount} total categories`}
          actions={
            <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5 w-full sm:w-auto justify-center" style={styles.btnPrimary}>
              <Plus className="w-4 h-4" /> Add Category
            </button>
          }
        />

        {/* Mobile */}
        <div className="block sm:hidden space-y-2">
          {categories.length > 0 ? categories.map(cat => (
            <div key={cat.id} className="p-4 rounded-xl border" style={{ borderColor: 'var(--border)', background: 'var(--muted)' }}>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  {cat.material_icon && <span className="material-icons text-lg" style={{ color: 'var(--muted-foreground)' }}>{cat.material_icon}</span>}
                  <p className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>{cat.name}</p>
                </div>
                <ActionButtons onEdit={() => handleEdit(cat)} onDelete={() => handleDelete(cat.id)} />
              </div>
              <p className="text-xs mt-1.5 font-medium" style={{ color: 'var(--muted-foreground)' }}>Type: {getTypeName(cat.type)}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{new Date(cat.created_at).toLocaleDateString()}</p>
            </div>
          )) : <p className="text-center py-8 text-sm" style={{ color: 'var(--muted-foreground)' }}>No categories found</p>}
        </div>

        {/* Desktop */}
        <div className="hidden sm:block">
          <DataTable
            columns={columns}
            emptyMessage="No categories found"
            rows={categories.map((cat, i) => (
              <tr key={cat.id} style={rowBg(i)}>
                <td className={`${styles.td} font-semibold`} style={{ color: 'var(--foreground)' }}>
                  <div className="flex items-center gap-2">
                    {cat.material_icon && <span className="material-icons text-base" style={{ color: 'var(--muted-foreground)' }}>{cat.material_icon}</span>}
                    {cat.name}
                  </div>
                </td>
                <td className={styles.td}>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide" style={{ background: 'var(--accent)', color: 'var(--accent-foreground)' }}>
                    {getTypeName(cat.type)}
                  </span>
                </td>
                <td className={styles.td} style={{ color: 'var(--muted-foreground)' }}>{new Date(cat.created_at).toLocaleDateString()}</td>
                <td className={styles.td}><ActionButtons onEdit={() => handleEdit(cat)} onDelete={() => handleDelete(cat.id)} /></td>
              </tr>
            ))}
          />
        </div>

        <Pagination currentPage={currentPage} totalPages={totalPages} totalCount={totalCount} pageSize={PAGE_SIZE} onPageChange={setCurrentPage} />
      </div>

      {showModal && (
        <Modal title={editingCategory ? 'Edit Category' : 'Add Category'} onClose={closeModal}>
          <FormError message={error} />
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Name">
              <StyledInput type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
            </FormField>
            <FormField label="Type">
              <StyledSelect value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} required>
                <option value="">Select Type</option>
                {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </StyledSelect>
            </FormField>
            <FormField label="Material Icon" hint="Enter a Material Icon name">
              <div className="flex items-center gap-2">
                <StyledInput type="text" value={formData.material_icon} onChange={e => setFormData({ ...formData, material_icon: e.target.value })} placeholder="e.g., home, shopping_cart" className="flex-1" style={{width: 'auto'}} />
                {formData.material_icon && (
                  <span className="material-icons text-xl p-2 rounded-xl border" style={{ borderColor: 'var(--border)', background: 'var(--muted)', color: 'var(--foreground)' }}>
                    {formData.material_icon}
                  </span>
                )}
              </div>
            </FormField>
            <ModalActions onCancel={closeModal} submitLabel={editingCategory ? 'Update' : 'Create'} />
          </form>
        </Modal>
      )}
    </Layout>
  );
}
