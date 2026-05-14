import { useCallback, useEffect, useState } from 'react';
import { Edit, Plus, Trash2, X } from 'lucide-react';
import { Layout } from '../../components/Layout';
import { Loader } from '../../components/Loader';
import config from '../../../config/global.json';
import { apiRequest, apiUrl } from '../../../utils/api';

interface Category { id: string; name: string; }
interface Type { id: string; name: string; created_at: string; updated_at: string; categories: Category[]; }
interface TypesResponse { count: number; next: string | null; previous: string | null; results: Type[]; }

const card = { background: 'var(--card)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-md)' };
const btnPrimary: React.CSSProperties = { background: 'linear-gradient(135deg, var(--primary), #3B6AEA)', boxShadow: '0 4px 14px rgba(30,58,138,0.35)', color: '#fff' };
const inputStyle = { background: 'var(--input-background)', borderColor: 'var(--input)', color: 'var(--foreground)' };
const thCls = 'px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest';
const tdCls = 'px-5 py-3.5 text-sm';

export function Types() {
  const [types, setTypes] = useState<Type[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTypes = async (search = '') => {
    try {
      const url = search ? apiUrl(`${config.api.type}?search=${encodeURIComponent(search)}`) : apiUrl(config.api.type);
      const res = await apiRequest(url);
      const data: TypesResponse = await res.json();
      setTypes(data.results || []);
    } catch {
      setTypes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editId ? apiUrl(`${config.api.type}${editId}/`) : apiUrl(config.api.type);
    try {
      await apiRequest(url, { method: editId ? 'PUT' : 'POST', body: JSON.stringify({ name }) });
      setName('');
      setEditId(null);
      fetchTypes(searchQuery);
    } catch {
      console.error('Failed to save type');
    }
  };

  const handleEdit = (type: Type) => {
    setName(type.name);
    setEditId(type.id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this type?')) {
      return;
    }
    try {
      await apiRequest(apiUrl(`${config.api.type}${id}/`), { method: 'DELETE' });
      fetchTypes(searchQuery);
    } catch {
      console.error('Delete failed');
    }
  };

  const debouncedSearch = useCallback((() => {
    let t: number;
    return (q: string) => {
      setSearchQuery(q);
      clearTimeout(t);
      t = window.setTimeout(() => fetchTypes(q), 300);
    };
  })(), []);

  if (loading) {
    return <Layout pageTitle="Types"><div className="flex items-center justify-center py-16"><Loader size={120} /></div></Layout>;
  }

  return (
    <Layout pageTitle="Types" onSearch={debouncedSearch} searchPlaceholder="Search types...">
      <div className="mb-4 rounded-2xl border p-5" style={card}>
        <p className="mb-3 text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>
          {editId ? 'Edit Type' : 'Add New Type'}
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Type name (e.g. Income, Expense)"
            className="flex-1 rounded-xl border px-3 py-2.5 text-sm font-medium outline-none"
            style={inputStyle}
            required
          />
          <div className="flex gap-2">
            <button type="submit" className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5" style={btnPrimary}>
              <Plus className="h-4 w-4" /> {editId ? 'Update' : 'Create'}
            </button>
            {editId && (
              <button type="button" onClick={() => { setEditId(null); setName(''); }} className="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition-colors" style={{ borderColor: 'var(--border)', color: 'var(--foreground)', background: 'var(--muted)' }}>
                <X className="h-4 w-4" /> Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="rounded-2xl border p-6" style={card}>
        <div className="mb-4">
          <h2 className="text-lg font-extrabold tracking-tight" style={{ color: 'var(--foreground)' }}>Transaction Types</h2>
          <p className="mt-0.5 text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>{types.length} types defined</p>
        </div>

        <div className="block space-y-2 sm:hidden">
          {types.map((type) => (
            <div key={type.id} className="rounded-xl border p-4" style={{ borderColor: 'var(--border)', background: 'var(--muted)' }}>
              <div className="flex items-start justify-between">
                <p className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>{type.name}</p>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(type)} className="rounded-lg p-1.5" style={{ color: 'var(--primary)' }}><Edit className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(type.id)} className="rounded-lg p-1.5" style={{ color: 'var(--destructive)' }}><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              <p className="mt-1.5 text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
                {type.categories.length > 0 ? type.categories.map((c) => c.name).join(', ') : 'No categories'}
              </p>
              <p className="mt-0.5 text-xs" style={{ color: 'var(--muted-foreground)' }}>{new Date(type.created_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>

        <div className="hidden overflow-x-auto rounded-xl border sm:block" style={{ borderColor: 'var(--border)' }}>
          <table className="w-full">
            <thead style={{ background: 'var(--muted)' }}>
              <tr>
                {['Name', 'Categories', 'Created', 'Actions'].map((h) => (
                  <th key={h} className={thCls} style={{ color: 'var(--muted-foreground)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {types.map((type, i) => (
                <tr key={type.id} style={{ borderTop: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--muted)' }}>
                  <td className={`${tdCls} font-semibold`} style={{ color: 'var(--foreground)' }}>{type.name}</td>
                  <td className={tdCls} style={{ color: 'var(--muted-foreground)' }}>
                    {type.categories.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {type.categories.map((c) => (
                          <span key={c.id} className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: 'var(--accent)', color: 'var(--accent-foreground)' }}>{c.name}</span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs italic">None</span>
                    )}
                  </td>
                  <td className={tdCls} style={{ color: 'var(--muted-foreground)' }}>{new Date(type.created_at).toLocaleDateString()}</td>
                  <td className={tdCls}>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleEdit(type)} className="rounded-lg p-1.5 transition-colors" style={{ color: 'var(--primary)' }} onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--accent)')} onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(type.id)} className="rounded-lg p-1.5 transition-colors" style={{ color: 'var(--destructive)' }} onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')} onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
