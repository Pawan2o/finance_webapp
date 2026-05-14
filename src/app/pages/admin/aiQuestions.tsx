import { useCallback, useEffect, useState } from 'react';
import { CheckSquare, ChevronLeft, ChevronRight, Edit, Plus, Power, Square, Trash2, X } from 'lucide-react';
import { Layout } from '../../components/Layout';
import { Loader } from '../../components/Loader';
import config from '../../../config/global.json';
import { apiRequest } from '../../../utils/api';

interface AIQuestion {
  id: string;
  question: string;
  category: string;
  response_template: string;
  logic_type?: string;
  is_active: boolean;
  is_dynamic: boolean;
  usage_count?: number;
  created_at: string;
  updated_at: string;
}

const card = { background: 'var(--card)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-md)' };
const btnPrimary: React.CSSProperties = { background: 'linear-gradient(135deg, var(--primary), #3B6AEA)', boxShadow: '0 4px 14px rgba(30,58,138,0.35)', color: '#fff' };
const inputStyle = { background: 'var(--input-background)', borderColor: 'var(--input)', color: 'var(--foreground)' };
const thCls = 'px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest';
const tdCls = 'px-5 py-3.5 text-sm';

const categories = ['FINANCIAL', 'BUDGETING', 'INSIGHTS', 'SPENDING', 'ANALYSIS', 'TRENDS', 'BUDGET', 'PATTERNS', 'TIPS'];
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
      setAIQuestions(data.results || []);
      setTotalCount(data.count || 0);
      setTotalPages(Math.ceil((data.count || 0) / pageSize));
      setCurrentPage(page);
    } catch {
      console.error('Failed to fetch AI questions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAIQuestions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    if (formData.is_dynamic && !formData.logic_type) {
      setError('Dynamic questions must have a logic type');
      setSubmitting(false);
      return;
    }
    const url = editingQuestion ? `${config.api.host}${config.api.aiQuestion}${editingQuestion.id}/` : `${config.api.host}${config.api.aiQuestionCreate}`;
    try {
      const res = await apiRequest(url, { method: editingQuestion ? 'PUT' : 'POST', body: JSON.stringify(formData) });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || d.detail || 'Failed to save');
      }
      closeModal();
      setSelectedIds(new Set());
      fetchAIQuestions(searchQuery, currentPage);
    } catch (err: any) {
      setError(err.message || 'Failed to save AI question');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this question?')) return;
    try {
      await apiRequest(`${config.api.host}${config.api.aiQuestion}${id}/`, { method: 'DELETE' });
      fetchAIQuestions(searchQuery, currentPage);
    } catch {
      console.error('Delete failed');
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedIds.size} items?`)) return;
    try {
      await Promise.all(Array.from(selectedIds).map((id) => apiRequest(`${config.api.host}${config.api.aiQuestion}${id}/`, { method: 'DELETE' })));
      setSelectedIds(new Set());
      fetchAIQuestions(searchQuery, currentPage);
    } catch {
      console.error('Bulk delete failed');
    }
  };

  const handleBulkActivate = async (activate: boolean) => {
    try {
      await apiRequest(`${config.api.host}${config.api.aiQuestion}bulk_activate/`, { method: 'POST', body: JSON.stringify({ ids: Array.from(selectedIds), is_active: activate }) });
      setSelectedIds(new Set());
      fetchAIQuestions(searchQuery, currentPage);
    } catch {
      console.error('Bulk activate failed');
    }
  };

  const toggleSelect = (id: string) => setSelectedIds((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const toggleSelectAll = () => setSelectedIds((prev) => (prev.size === aiQuestions.length ? new Set() : new Set(aiQuestions.map((q) => q.id))));

  const handleEdit = (q: AIQuestion) => {
    setEditingQuestion(q);
    setFormData({ question: q.question, category: q.category, response_template: q.response_template, logic_type: q.logic_type || '', is_active: q.is_active, is_dynamic: q.is_dynamic });
    setError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingQuestion(null);
    setFormData({ question: '', category: '', response_template: '', logic_type: '', is_active: true, is_dynamic: true });
    setError('');
  };

  const debouncedSearch = useCallback((() => {
    let t: number;
    return (q: string) => {
      setSearchQuery(q);
      setCurrentPage(1);
      clearTimeout(t);
      t = window.setTimeout(() => fetchAIQuestions(q, 1), 300);
    };
  })(), []);

  if (loading) {
    return <Layout pageTitle="AI Questions"><div className="flex items-center justify-center py-16"><Loader size={120} /></div></Layout>;
  }

  const allSelected = selectedIds.size === aiQuestions.length && aiQuestions.length > 0;

  return (
    <Layout pageTitle="AI Questions" onSearch={debouncedSearch} searchPlaceholder="Search AI questions...">
      <div className="rounded-2xl border p-6" style={card}>
        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-extrabold tracking-tight" style={{ color: 'var(--foreground)' }}>AI Questions</h2>
            <p className="mt-0.5 text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>{totalCount} total questions</p>
          </div>
          <div className="flex w-full flex-wrap gap-2 sm:w-auto">
            {selectedIds.size > 0 && (
              <>
                <button onClick={() => handleBulkActivate(true)} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg, #059669, #10B981)', boxShadow: '0 4px 14px rgba(16,185,129,0.35)' }}>
                  <Power className="h-4 w-4" /> Activate ({selectedIds.size})
                </button>
                <button onClick={() => handleBulkActivate(false)} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg, #D97706, #F59E0B)', boxShadow: '0 4px 14px rgba(245,158,11,0.35)' }}>
                  <Power className="h-4 w-4" /> Deactivate ({selectedIds.size})
                </button>
                <button onClick={handleBulkDelete} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg, #DC2626, #EF4444)', boxShadow: '0 4px 14px rgba(239,68,68,0.35)' }}>
                  <Trash2 className="h-4 w-4" /> Delete ({selectedIds.size})
                </button>
              </>
            )}
            <button onClick={() => { closeModal(); setShowModal(true); }} className="flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all hover:-translate-y-0.5 sm:flex-initial" style={btnPrimary}>
              <Plus className="h-4 w-4" /> Add Question
            </button>
          </div>
        </div>

        <div className="block space-y-2 sm:hidden">
          {aiQuestions.map((q) => (
            <div key={q.id} className="rounded-xl border p-4" style={{ borderColor: 'var(--border)', background: 'var(--muted)' }}>
              <div className="flex items-start justify-between">
                <div className="flex min-w-0 flex-1 items-start gap-2">
                  <button onClick={() => toggleSelect(q.id)} className="mt-0.5 flex-shrink-0">
                    {selectedIds.has(q.id) ? <CheckSquare className="h-4 w-4" style={{ color: 'var(--primary)' }} /> : <Square className="h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />}
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold" style={{ color: 'var(--foreground)' }}>{q.question}</p>
                    <p className="mt-1 line-clamp-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>{q.response_template}</p>
                  </div>
                </div>
                <div className="ml-2 flex gap-1">
                  <button onClick={() => handleEdit(q)} className="rounded-lg p-1.5" style={{ color: 'var(--primary)' }}><Edit className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(q.id)} className="rounded-lg p-1.5" style={{ color: 'var(--destructive)' }}><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              <div className="ml-6 mt-2 flex flex-wrap gap-1.5">
                <span className="rounded-full px-2 py-0.5 text-[10px] font-black uppercase" style={{ background: 'var(--accent)', color: 'var(--accent-foreground)' }}>{q.category}</span>
                {q.logic_type && <span className="rounded-full px-2 py-0.5 text-[10px] font-black uppercase" style={{ background: 'rgba(124,58,237,0.12)', color: '#7C3AED', border: '1px solid rgba(124,58,237,0.2)' }}>{q.logic_type}</span>}
                <span className="rounded-full px-2 py-0.5 text-[10px] font-black uppercase" style={q.is_active ? { background: 'rgba(16,185,129,0.12)', color: 'var(--success)', border: '1px solid rgba(16,185,129,0.25)' } : { background: 'rgba(239,68,68,0.10)', color: 'var(--destructive)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  {q.is_active ? 'Active' : 'Inactive'}
                </span>
                {q.is_dynamic && <span className="rounded-full px-2 py-0.5 text-[10px] font-black uppercase" style={{ background: 'rgba(124,58,237,0.12)', color: '#7C3AED' }}>Dynamic</span>}
              </div>
            </div>
          ))}
        </div>

        <div className="hidden overflow-x-auto rounded-xl border sm:block" style={{ borderColor: 'var(--border)' }}>
          <table className="w-full">
            <thead style={{ background: 'var(--muted)' }}>
              <tr>
                <th className="px-5 py-3 text-left">
                  <button onClick={toggleSelectAll}>
                    {allSelected ? <CheckSquare className="h-4 w-4" style={{ color: 'var(--primary)' }} /> : <Square className="h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />}
                  </button>
                </th>
                {['Question', 'Category', 'Logic Type', 'Template', 'Status', 'Actions'].map((h) => (
                  <th key={h} className={thCls} style={{ color: 'var(--muted-foreground)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {aiQuestions.map((q, i) => (
                <tr key={q.id} style={{ borderTop: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--muted)' }}>
                  <td className="px-5 py-3.5">
                    <button onClick={() => toggleSelect(q.id)}>
                      {selectedIds.has(q.id) ? <CheckSquare className="h-4 w-4" style={{ color: 'var(--primary)' }} /> : <Square className="h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />}
                    </button>
                  </td>
                  <td className={`${tdCls} max-w-xs truncate font-semibold`} style={{ color: 'var(--foreground)' }}>{q.question}</td>
                  <td className={tdCls}><span className="rounded-full px-2.5 py-1 text-[10px] font-black uppercase" style={{ background: 'var(--accent)', color: 'var(--accent-foreground)' }}>{q.category}</span></td>
                  <td className={tdCls}>{q.logic_type ? <span className="rounded-full px-2.5 py-1 text-[10px] font-black uppercase" style={{ background: 'rgba(124,58,237,0.12)', color: '#7C3AED', border: '1px solid rgba(124,58,237,0.2)' }}>{q.logic_type}</span> : <span style={{ color: 'var(--muted-foreground)' }}>—</span>}</td>
                  <td className={`${tdCls} max-w-xs truncate`} style={{ color: 'var(--muted-foreground)' }}>{q.response_template}</td>
                  <td className={tdCls}>
                    <div className="flex flex-col gap-1">
                      <span className="w-fit rounded-full px-2.5 py-1 text-[10px] font-black uppercase" style={q.is_active ? { background: 'rgba(16,185,129,0.12)', color: 'var(--success)', border: '1px solid rgba(16,185,129,0.25)' } : { background: 'rgba(239,68,68,0.10)', color: 'var(--destructive)', border: '1px solid rgba(239,68,68,0.2)' }}>
                        {q.is_active ? 'Active' : 'Inactive'}
                      </span>
                      {q.is_dynamic && <span className="w-fit rounded-full px-2.5 py-1 text-[10px] font-black uppercase" style={{ background: 'rgba(124,58,237,0.12)', color: '#7C3AED' }}>Dynamic</span>}
                    </div>
                  </td>
                  <td className={tdCls}>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleEdit(q)} className="rounded-lg p-1.5 transition-colors" style={{ color: 'var(--primary)' }} onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--accent)')} onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(q.id)} className="rounded-lg p-1.5 transition-colors" style={{ color: 'var(--destructive)' }} onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')} onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="mt-5 flex flex-col items-center justify-between gap-3 border-t pt-4 sm:flex-row" style={{ borderColor: 'var(--border)' }}>
            <p className="text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>{(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, totalCount)} of {totalCount}</p>
            <div className="flex gap-2">
              <button onClick={() => fetchAIQuestions(searchQuery, currentPage - 1)} disabled={currentPage === 1} className="rounded-xl border p-2 transition-colors disabled:opacity-40" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="rounded-xl border px-3 py-1.5 text-xs font-bold" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>{currentPage} / {totalPages}</span>
              <button onClick={() => fetchAIQuestions(searchQuery, currentPage + 1)} disabled={currentPage === totalPages} className="rounded-xl border p-2 transition-colors disabled:opacity-40" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={closeModal}>
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border p-6" style={card} onClick={(e) => e.stopPropagation()}>
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-base font-extrabold" style={{ color: 'var(--foreground)' }}>{editingQuestion ? 'Edit AI Question' : 'Add AI Question'}</h3>
              <button onClick={closeModal} className="rounded-lg p-1.5 transition-colors" style={{ color: 'var(--muted-foreground)' }} onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--muted)')} onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                <X className="h-4 w-4" />
              </button>
            </div>

            {error && <div className="mb-4 rounded-xl border p-3 text-xs font-semibold" style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.2)', color: 'var(--destructive)' }}>{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>Question *</label>
                <input type="text" value={formData.question} onChange={(e) => setFormData((p) => ({ ...p, question: e.target.value }))} placeholder="How much did I spend on food this month?" minLength={10} className="w-full rounded-xl border px-3 py-2.5 text-sm font-medium outline-none" style={inputStyle} required />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>Category *</label>
                  <select value={formData.category} onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))} className="w-full rounded-xl border px-3 py-2.5 text-sm font-medium outline-none" style={inputStyle} required>
                    <option value="">Select category</option>
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>Logic Type {formData.is_dynamic && <span style={{ color: 'var(--destructive)' }}>*</span>}</label>
                  <select value={formData.logic_type} onChange={(e) => setFormData((p) => ({ ...p, logic_type: e.target.value }))} className="w-full rounded-xl border px-3 py-2.5 text-sm font-medium outline-none" style={inputStyle} required={formData.is_dynamic}>
                    <option value="">Select logic type</option>
                    {logicTypes.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>Response Template *</label>
                <textarea value={formData.response_template} onChange={(e) => setFormData((p) => ({ ...p, response_template: e.target.value }))} className="w-full resize-none rounded-xl border px-3 py-2.5 text-sm font-medium outline-none" style={inputStyle} placeholder="You spent ₹{total} in total..." rows={5} minLength={10} required />
                <p className="mt-1 text-[10px] font-medium" style={{ color: 'var(--muted-foreground)' }}>Placeholders: {'{total}'}, {'{category_data}'}, {'{top_category}'}, {'{top_amount}'}, {'{advice}'}</p>
              </div>

              <div className="flex gap-5">
                {[{ id: 'is_active', label: 'Active', checked: formData.is_active, onChange: (v: boolean) => setFormData((p) => ({ ...p, is_active: v })) }, { id: 'is_dynamic', label: 'Dynamic (processes user data)', checked: formData.is_dynamic, onChange: (v: boolean) => setFormData((p) => ({ ...p, is_dynamic: v })) }].map(({ id, label, checked, onChange }) => (
                  <label key={id} className="flex cursor-pointer items-center gap-2">
                    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="rounded" />
                    <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{label}</span>
                  </label>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={submitting} className="flex-1 rounded-xl py-2.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 disabled:opacity-50" style={btnPrimary}>{submitting ? 'Saving…' : editingQuestion ? 'Update' : 'Create'}</button>
                <button type="button" onClick={closeModal} disabled={submitting} className="flex-1 rounded-xl border py-2.5 text-sm font-bold transition-colors disabled:opacity-50" style={{ borderColor: 'var(--border)', color: 'var(--foreground)', background: 'var(--muted)' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
