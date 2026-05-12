import { useEffect, useState, useCallback } from 'react';
import { Layout } from '../../components/Layout';
import { Loader } from '../../components/Loader';
import config from '../../../config/global.json';
import { apiRequest } from '../../../utils/api';
import { Plus, Edit, Trash2, X, CheckSquare, Square, Power, ChevronLeft, ChevronRight } from 'lucide-react';

interface AIQuestion {
  id: string; question: string; category: string; response_template: string;
  logic_type?: string; is_active: boolean; is_dynamic: boolean;
  usage_count?: number; created_at: string; updated_at: string;
}

const card       = { background: 'var(--card)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-md)' };
const btnPrimary: React.CSSProperties = { background: 'linear-gradient(135deg, var(--primary), #3B6AEA)', boxShadow: '0 4px 14px rgba(30,58,138,0.35)', color: '#fff' };
const inputStyle = { background: 'var(--input-background)', borderColor: 'var(--input)', color: 'var(--foreground)' };
const thCls      = 'px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest';
const tdCls      = 'px-5 py-3.5 text-sm';

const categories = ['FINANCIAL','BUDGETING','INSIGHTS','SPENDING','ANALYSIS','TRENDS','BUDGET','PATTERNS','TIPS'];
const logicTypes = [
  { value: 'spending_summary', label: 'Spending Summary' },
  { value: 'category_analysis', label: 'Category Analysis' },
  { value: 'trend_analysis', label: 'Trend Analysis' },
  { value: 'budget_analysis', label: 'Budget Analysis' },
  { value: 'weekly_summary', label: 'Weekly Summary' },
];

export function AIQuestions() {
  const [aiQuestions, setAIQuestions] = useState<AIQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<AIQuestion | null>(null);
  const [formData, setFormData] = useState({ question: '', category: '', response_template: '', logic_type: '', is_active: true, is_dynamic: true });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  const fetchAIQuestions = async (search = '', page = 1) => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      params.append('page', page.toString());
      params.append('page_size', pageSize.toString());
      const res = await apiRequest(`${config.api.host}${config.api.aiQuestion}?${params}`);
      const data = await res.json();
      setAIQuestions(data.results || []); setTotalCount(data.count || 0);
      setTotalPages(Math.ceil((data.count || 0) / pageSize)); setCurrentPage(page);
    } catch { console.error('Failed to fetch AI questions'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAIQuestions(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setSubmitting(true);
    if (formData.is_dynamic && !formData.logic_type) { setError('Dynamic questions must have a logic type'); setSubmitting(false); return; }
    const url = editingQuestion ? `${config.api.host}${config.api.aiQuestion}${editingQuestion.id}/` : `${config.api.host}${config.api.aiQuestionCreate}`;
    try {
      const res = await apiRequest(url, { method: editingQuestion ? 'PUT' : 'POST', body: JSON.stringify(formData) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || d.detail || 'Failed to save'); }
      closeModal(); setSelectedIds(new Set()); fetchAIQuestions(searchQuery, currentPage);
    } catch (err: any) { setError(err.message || 'Failed to save AI question'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this question?')) return;
    try { await apiRequest(`${config.api.host}${config.api.aiQuestion}${id}/`, { method: 'DELETE' }); fetchAIQuestions(searchQuery, currentPage); }
    catch { console.error('Delete failed'); }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedIds.size} items?`)) return;
    try {
      await Promise.all(Array.from(selectedIds).map(id => apiRequest(`${config.api.host}${config.api.aiQuestion}${id}/`, { method: 'DELETE' })));
      setSelectedIds(new Set()); fetchAIQuestions(searchQuery, currentPage);
    } catch { console.error('Bulk delete failed'); }
  };

  const handleBulkActivate = async (activate: boolean) => {
    try {
      await apiRequest(`${config.api.host}${config.api.aiQuestion}bulk_activate/`, { method: 'POST', body: JSON.stringify({ ids: Array.from(selectedIds), is_active: activate }) });
      setSelectedIds(new Set()); fetchAIQuestions(searchQuery, currentPage);
    } catch { console.error('Bulk activate failed'); }
  };

  const toggleSelect = (id: string) => setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleSelectAll = () => setSelectedIds(prev => prev.size === aiQuestions.length ? new Set() : new Set(aiQuestions.map(q => q.id)));

  const handleEdit = (q: AIQuestion) => {
    setEditingQuestion(q);
    setFormData({ question: q.question, category: q.category, response_template: q.response_template, logic_type: q.logic_type || '', is_active: q.is_active, is_dynamic: q.is_dynamic });
    setError(''); setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditingQuestion(null); setFormData({ question: '', category: '', response_template: '', logic_type: '', is_active: true, is_dynamic: true }); setError(''); };

  const debouncedSearch = useCallback((() => {
    let t: number;
    return (q: string) => { setSearchQuery(q); setCurrentPage(1); clearTimeout(t); t = window.setTimeout(() => fetchAIQuestions(q, 1), 300); };
  })(), []);

  if (loading) return <Layout pageTitle="AI Questions"><div className="flex items-center justify-center py-16"><Loader size={120} /></div></Layout>;

  const allSelected = selectedIds.size === aiQuestions.length && aiQuestions.length > 0;

  return (
    <Layout pageTitle="AI Questions" onSearch={debouncedSearch} searchPlaceholder="Search AI questions...">
      <div className="rounded-2xl border p-6" style={card}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h2 className="text-lg font-extrabold tracking-tight" style={{ color: 'var(--foreground)' }}>AI Questions</h2>
            <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{totalCount} total questions</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto flex-wrap">
            {selectedIds.size > 0 && (
              <>
                <button onClick={() => handleBulkActivate(true)} className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #059669, #10B981)', boxShadow: '0 4px 14px rgba(16,185,129,0.35)' }}>
                  <Power className="w-4 h-4" /> Activate ({selectedIds.size})
                </button>
                <button onClick={() => handleBulkActivate(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #D97706, #F59E0B)', boxShadow: '0 4px 14px rgba(245,158,11,0.35)' }}>
                  <Power className="w-4 h-4" /> Deactivate ({selectedIds.size})
                </button>
                <button onClick={handleBulkDelete} className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #DC2626, #EF4444)', boxShadow: '0 4px 14px rgba(239,68,68,0.35)' }}>
                  <Trash2 className="w-4 h-4" /> Delete ({selectedIds.size})
                </button>
              </>
            )}
            <button onClick={() => { closeModal(); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5 flex-1 sm:flex-initial justify-center" style={btnPrimary}>
              <Plus className="w-4 h-4" /> Add Question
            </button>
          </div>
        </div>

        {/* Mobile cards */}
        <div className="block sm:hidden space-y-2">
          {aiQuestions.map(q => (
            <div key={q.id} className="p-4 rounded-xl border" style={{ borderColor: 'var(--border)', background: 'var(--muted)' }}>
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-2 flex-1">
                  <button onClick={() => toggleSelect(q.id)} className="mt-0.5 flex-shrink-0">
                    {selectedIds.has(q.id) ? <CheckSquare className="w-4 h-4" style={{ color: 'var(--primary)' }} /> : <Square className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate" style={{ color: 'var(--foreground)' }}>{q.question}</p>
                    <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--muted-foreground)' }}>{q.response_template}</p>
                  </div>
                </div>
                <div className="flex gap-1 ml-2">
                  <button onClick={() => handleEdit(q)} className="p-1.5 rounded-lg" style={{ color: 'var(--primary)' }}><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(q.id)} className="p-1.5 rounded-lg" style={{ color: 'var(--destructive)' }}><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2 ml-6">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase" style={{ background: 'var(--accent)', color: 'var(--accent-foreground)' }}>{q.category}</span>
                {q.logic_type && <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase" style={{ background: 'rgba(124,58,237,0.12)', color: '#7C3AED', border: '1px solid rgba(124,58,237,0.2)' }}>{q.logic_type}</span>}
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase"
                  style={q.is_active ? { background: 'rgba(16,185,129,0.12)', color: 'var(--success)', border: '1px solid rgba(16,185,129,0.25)' } : { background: 'rgba(239,68,68,0.10)', color: 'var(--destructive)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  {q.is_active ? 'Active' : 'Inactive'}
                </span>
                {q.is_dynamic && <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase" style={{ background: 'rgba(124,58,237,0.12)', color: '#7C3AED' }}>Dynamic</span>}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden sm:block overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--border)' }}>
          <table className="w-full">
            <thead style={{ background: 'var(--muted)' }}>
              <tr>
                <th className="px-5 py-3 text-left">
                  <button onClick={toggleSelectAll}>
                    {allSelected ? <CheckSquare className="w-4 h-4" style={{ color: 'var(--primary)' }} /> : <Square className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />}
                  </button>
                </th>
                {['Question', 'Category', 'Logic Type', 'Template', 'Status', 'Actions'].map(h => (
                  <th key={h} className={thCls} style={{ color: 'var(--muted-foreground)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {aiQuestions.map((q, i) => (
                <tr key={q.id} style={{ borderTop: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--muted)' }}>
                  <td className="px-5 py-3.5">
                    <button onClick={() => toggleSelect(q.id)}>
                      {selectedIds.has(q.id) ? <CheckSquare className="w-4 h-4" style={{ color: 'var(--primary)' }} /> : <Square className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />}
                    </button>
                  </td>
                  <td className={`${tdCls} font-semibold max-w-xs truncate`} style={{ color: 'var(--foreground)' }}>{q.question}</td>
                  <td className={tdCls}>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase" style={{ background: 'var(--accent)', color: 'var(--accent-foreground)' }}>{q.category}</span>
                  </td>
                  <td className={tdCls}>
                    {q.logic_type
                      ? <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase" style={{ background: 'rgba(124,58,237,0.12)', color: '#7C3AED', border: '1px solid rgba(124,58,237,0.2)' }}>{q.logic_type}</span>
                      : <span style={{ color: 'var(--muted-foreground)' }}>—</span>}
                  </td>
                  <td className={`${tdCls} max-w-xs truncate`} style={{ color: 'var(--muted-foreground)' }}>{q.response_template}</td>
                  <td className={tdCls}>
                    <div className="flex flex-col gap-1">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase w-fit"
                        style={q.is_active ? { background: 'rgba(16,185,129,0.12)', color: 'var(--success)', border: '1px solid rgba(16,185,129,0.25)' } : { background: 'rgba(239,68,68,0.10)', color: 'var(--destructive)', border: '1px solid rgba(239,68,68,0.2)' }}>
                        {q.is_active ? 'Active' : 'Inactive'}
                      </span>
                      {q.is_dynamic && <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase w-fit" style={{ background: 'rgba(124,58,237,0.12)', color: '#7C3AED' }}>Dynamic</span>}
                    </div>
                  </td>
                  <td className={tdCls}>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleEdit(q)} className="p-1.5 rounded-lg transition-colors" style={{ color: 'var(--primary)' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(q.id)} className="p-1.5 rounded-lg transition-colors" style={{ color: 'var(--destructive)' }}
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between mt-5 pt-4 border-t gap-3" style={{ borderColor: 'var(--border)' }}>
            <p className="text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>
              {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, totalCount)} of {totalCount}
            </p>
            <div className="flex gap-2">
              <button onClick={() => fetchAIQuestions(searchQuery, currentPage - 1)} disabled={currentPage === 1}
                className="p-2 rounded-xl border transition-colors disabled:opacity-40" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1.5 rounded-xl text-xs font-bold border" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
                {currentPage} / {totalPages}
              </span>
              <button onClick={() => fetchAIQuestions(searchQuery, currentPage + 1)} disabled={currentPage === totalPages}
                className="p-2 rounded-xl border transition-colors disabled:opacity-40" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={closeModal}>
          <div className="rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border" style={card} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-base font-extrabold" style={{ color: 'var(--foreground)' }}>{editingQuestion ? 'Edit AI Question' : 'Add AI Question'}</h3>
              <button onClick={closeModal} className="p-1.5 rounded-lg transition-colors" style={{ color: 'var(--muted-foreground)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--muted)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && <div className="mb-4 p-3 rounded-xl text-xs font-semibold border" style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.2)', color: 'var(--destructive)' }}>{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { id: 'question', label: 'Question *', type: 'text', value: formData.question, onChange: (v: string) => setFormData(p => ({ ...p, question: v })), placeholder: 'How much did I spend on food this month?', minLength: 10 },
              ].map(({ id, label, type, value, onChange, placeholder, minLength }) => (
                <div key={id}>
                  <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5" style={{ color: 'var(--muted-foreground)' }}>{label}</label>
                  <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} minLength={minLength}
                    className="w-full px-3 py-2.5 rounded-xl border text-sm font-medium outline-none" style={inputStyle} required />
                </div>
              ))}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Category *</label>
                  <select value={formData.category} onChange={e => setFormData(p => ({ ...p, category: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border text-sm font-medium outline-none" style={inputStyle} required>
                    <option value="">Select category</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5" style={{ color: 'var(--muted-foreground)' }}>
                    Logic Type {formData.is_dynamic && <span style={{ color: 'var(--destructive)' }}>*</span>}
                  </label>
                  <select value={formData.logic_type} onChange={e => setFormData(p => ({ ...p, logic_type: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border text-sm font-medium outline-none" style={inputStyle} required={formData.is_dynamic}>
                    <option value="">Select logic type</option>
                    {logicTypes.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Response Template *</label>
                <textarea value={formData.response_template} onChange={e => setFormData(p => ({ ...p, response_template: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border text-sm font-medium outline-none resize-none" style={inputStyle}
                  placeholder="You spent ₹{total} in total..." rows={5} minLength={10} required />
                <p className="text-[10px] mt-1 font-medium" style={{ color: 'var(--muted-foreground)' }}>
                  Placeholders: {'{total}'}, {'{category_data}'}, {'{top_category}'}, {'{top_amount}'}, {'{advice}'}
                </p>
              </div>

              <div className="flex gap-5">
                {[{ id: 'is_active', label: 'Active', checked: formData.is_active, onChange: (v: boolean) => setFormData(p => ({ ...p, is_active: v })) },
                  { id: 'is_dynamic', label: 'Dynamic (processes user data)', checked: formData.is_dynamic, onChange: (v: boolean) => setFormData(p => ({ ...p, is_dynamic: v })) }].map(({ id, label, checked, onChange }) => (
                  <label key={id} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="rounded" />
                    <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{label}</span>
                  </label>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={submitting} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-0.5 disabled:opacity-50" style={btnPrimary}>
                  {submitting ? 'Saving…' : editingQuestion ? 'Update' : 'Create'}
                </button>
                <button type="button" onClick={closeModal} disabled={submitting} className="flex-1 py-2.5 rounded-xl text-sm font-bold border transition-colors disabled:opacity-50"
                  style={{ borderColor: 'var(--border)', color: 'var(--foreground)', background: 'var(--muted)' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
