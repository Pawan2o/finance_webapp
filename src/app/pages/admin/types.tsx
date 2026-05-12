import { useEffect, useState, useCallback } from 'react';
import { Layout } from '../../components/Layout';
import { Loader } from '../../components/Loader';
import config from '../../../config/global.json';
import { apiRequest } from '../../../utils/api';
import { Edit, Trash2, Plus, X } from 'lucide-react';

interface Category { id: string; name: string; }
interface Type { id: string; name: string; created_at: string; updated_at: string; categories: Category[]; }
interface TypesResponse { count: number; next: string | null; previous: string | null; results: Type[]; }

const card       = { background: 'var(--card)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-md)' };
const btnPrimary: React.CSSProperties = { background: 'linear-gradient(135deg, var(--primary), #3B6AEA)', boxShadow: '0 4px 14px rgba(30,58,138,0.35)', color: '#fff' };
const inputStyle = { background: 'var(--input-background)', borderColor: 'var(--input)', color: 'var(--foreground)' };
const thCls      = 'px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest';
const tdCls      = 'px-5 py-3.5 text-sm';

export function Types() {
  const [types, setTypes] = useState<Type[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTypes = async (search = '') => {
    try {
      const url = search
        ? `${config.api.host}${config.api.type}?search=${encodeURIComponent(search)}`
        : `${config.api.host}${config.api.type}`;
      const res = await apiRequest(url);
      const data: TypesResponse = await res.json();
      setTypes(data.results || []);
    } catch { setTypes([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTypes(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editId ? `${config.api.host}${config.api.type}${editId}/` : `${config.api.host}${config.api.type}`;
    try {
      await apiRequest(url, { method: editId ? 'PUT' : 'POST', body: JSON.stringify({ name }) });
      setName(''); setEditId(null); fetchTypes(searchQuery);
    } catch { console.error('Failed to save type'); }
  };

  const handleEdit = (type: Type) => { setName(type.name); setEditId(type.id); };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this type?')) return;
    try { await apiRequest(`${config.api.host}${config.api.type}${id}/`, { method: 'DELETE' }); fetchTypes(searchQuery); }
    catch { console.error('Delete failed'); }
  };

  const debouncedSearch = useCallback((() => {
    let t: number;
    return (q: string) => { setSearchQuery(q); clearTimeout(t); t = window.setTimeout(() => fetchTypes(q), 300); };
  })(), []);

  if (loading) return <Layout pageTitle="Types"><div className="flex items-center justify-center py-16"><Loader size={120} /></div></Layout>;

  return (
    <Layout pageTitle="Types" onSearch={debouncedSearch} searchPlaceholder="Search types...">
      {/* Inline create/edit form */}
      <div className="rounded-2xl border p-5 mb-4" style={card}>
        <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: 'var(--muted-foreground)' }}>
          {editId ? 'Edit Type' : 'Add New Type'}
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Type name (e.g. Income, Expense)"
            className="flex-1 px-3 py-2.5 rounded-xl border text-sm font-medium outline-none" style={inputStyle} required />
          <div className="flex gap-2">
            <button type="submit" className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-0.5" style={btnPrimary}>
              <Plus className="w-4 h-4" /> {editId ? 'Update' : 'Create'}
            </button>
            {editId && (
              <button type="button" onClick={() => { setEditId(null); setName(''); }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-colors"
                style={{ borderColor: 'var(--border)', color: 'var(--foreground)', background: 'var(--muted)' }}>
                <X className="w-4 h-4" /> Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="rounded-2xl border p-6" style={card}>
        <div className="mb-4">
          <h2 className="text-lg font-extrabold tracking-tight" style={{ color: 'var(--foreground)' }}>Transaction Types</h2>
          <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{types.length} types defined</p>
        </div>

        {/* Mobile */}
        <div className="block sm:hidden space-y-2">
          {types.map(type => (
            <div key={type.id} className="p-4 rounded-xl border" style={{ borderColor: 'var(--border)', background: 'var(--muted)' }}>
              <div className="flex justify-between items-start">
                <p className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>{type.name}</p>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(type)} className="p-1.5 rounded-lg" style={{ color: 'var(--primary)' }}><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(type.id)} className="p-1.5 rounded-lg" style={{ color: 'var(--destructive)' }}><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <p className="text-xs mt-1.5 font-medium" style={{ color: 'var(--muted-foreground)' }}>
                {type.categories.length > 0 ? type.categories.map(c => c.name).join(', ') : 'No categories'}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{new Date(type.created_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>

        {/* Desktop */}
        <div className="hidden sm:block overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--border)' }}>
          <table className="w-full">
            <thead style={{ background: 'var(--muted)' }}>
              <tr>
                {['Name', 'Categories', 'Created', 'Actions'].map(h => (
                  <th key={h} className={thCls} style={{ color: 'var(--muted-foreground)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {types.map((type, i) => (
                <tr key={type.id} style={{ borderTop: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--muted)' }}>
                  <td className={`${tdCls} font-semibold`} style={{ color: 'var(--foreground)' }}>{type.name}</td>
                  <td className={tdCls} style={{ color: 'var(--muted-foreground)' }}>
                    {type.categories.length > 0
                      ? <div className="flex flex-wrap gap-1">
                          {type.categories.map(c => (
                            <span key={c.id} className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: 'var(--accent)', color: 'var(--accent-foreground)' }}>{c.name}</span>
                          ))}
                        </div>
                      : <span className="text-xs italic">None</span>}
                  </td>
                  <td className={tdCls} style={{ color: 'var(--muted-foreground)' }}>{new Date(type.created_at).toLocaleDateString()}</td>
                  <td className={tdCls}>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleEdit(type)} className="p-1.5 rounded-lg transition-colors" style={{ color: 'var(--primary)' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(type.id)} className="p-1.5 rounded-lg transition-colors" style={{ color: 'var(--destructive)' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                        <Trash2 className="w-4 h-4" />
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
