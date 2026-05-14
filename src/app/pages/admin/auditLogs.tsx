import { useCallback, useEffect, useState } from 'react';
import { Activity, Calendar, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Eye, Filter, Trash2, User } from 'lucide-react';
import { Layout } from '../../components/Layout';
import config from '../../../config/global.json';
import { apiUrl } from '../../../utils/api';

interface AuditLog {
  id: number;
  user_name: string;
  action: string;
  action_display: string;
  module: string;
  object_id: string;
  changes?: { old?: any; new?: any };
  changes_summary?: { changed_fields?: string[]; field_count?: number; action?: string };
  timestamp?: string;
  formatted_timestamp: string;
}

interface ApiResponse { count: number; next: string | null; previous: string | null; results: AuditLog[]; }

const card = { background: 'var(--card)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-md)' };
const btnPrimary: React.CSSProperties = { background: 'linear-gradient(135deg, var(--primary), #3B6AEA)', boxShadow: '0 4px 14px rgba(30,58,138,0.35)', color: '#fff' };
const selectStyle = { background: 'var(--input-background)', borderColor: 'var(--input)', color: 'var(--foreground)' };
const thCls = 'px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest';
const tdCls = 'px-5 py-3.5 text-sm';

const actionStyle = (action: string): React.CSSProperties => {
  if (action === 'CREATE') return { background: 'rgba(16,185,129,0.12)', color: '#10B981', border: '1px solid rgba(16,185,129,0.25)' };
  if (action === 'UPDATE') return { background: 'var(--accent)', color: 'var(--accent-foreground)', border: '1px solid rgba(66,104,224,0.2)' };
  if (action === 'DELETE') return { background: 'rgba(239,68,68,0.10)', color: 'var(--destructive)', border: '1px solid rgba(239,68,68,0.2)' };
  return { background: 'var(--muted)', color: 'var(--muted-foreground)' };
};

const actions = ['CREATE', 'UPDATE', 'DELETE'];
const modules = ['Category', 'Transaction', 'PaymentMethod', 'Type', 'Budget', 'SavingsGoals', 'RecurringTransaction'];

export function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [pageSize, setPageSize] = useState(20);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [excludeAdmin, setExcludeAdmin] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteDays, setDeleteDays] = useState(30);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [logToDelete, setLogToDelete] = useState<number | null>(null);

  const checkAuth = () => {
    if (!localStorage.getItem('token')) {
      window.location.href = '/';
      return false;
    }
    return true;
  };

  const fetchLogs = useCallback(async (page = 1) => {
    if (!checkAuth()) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      let url = apiUrl(`${config.api.auditLog}?page=${page}`);
      if (debouncedSearch) url += `&search=${encodeURIComponent(debouncedSearch)}`;
      if (selectedAction) url += `&action=${selectedAction}`;
      if (selectedModule) url += `&module=${selectedModule}`;
      if (excludeAdmin) url += `&hide_admin=true`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } });
      if (!res.ok) throw new Error('Failed to fetch');
      const data: ApiResponse = await res.json();
      if (data.results.length > 0 && page === 1) setPageSize(data.results.length);
      setLogs(data.results);
      setTotalCount(data.count);
      setHasNext(!!data.next);
      setHasPrevious(!!data.previous);
      setError('');
    } catch {
      setError('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedAction, selectedModule, excludeAdmin]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(t);
  }, [searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedAction, selectedModule, excludeAdmin]);

  useEffect(() => {
    fetchLogs(currentPage);
  }, [fetchLogs, currentPage]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const bulkDelete = async () => {
    if (!checkAuth()) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(apiUrl(`${config.api.auditLog}cleanup/?days=${deleteDays}&dry_run=false`), { method: 'DELETE', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } });
      if (!res.ok) throw new Error('Failed');
      setToast({ message: `Deleted logs older than ${deleteDays} days`, type: 'success' });
      setShowDeleteModal(false);
      fetchLogs(currentPage);
    } catch {
      setToast({ message: 'Failed to delete logs', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const deleteLog = async (id: number) => {
    if (!checkAuth()) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(apiUrl(`${config.api.auditLog}${id}/`), { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed');
      setToast({ message: 'Log deleted', type: 'success' });
      setShowDeleteConfirm(false);
      setLogToDelete(null);
      fetchLogs(currentPage);
    } catch {
      setToast({ message: 'Failed to delete log', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const viewDetails = async (log: AuditLog) => {
    if (!checkAuth()) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(apiUrl(`${config.api.auditLog}${log.id}/`), { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } });
      if (!res.ok) throw new Error('Failed');
      setSelectedLog(await res.json());
      setShowModal(true);
    } catch {
      setToast({ message: 'Failed to load details', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);
  const getPageNumbers = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const delta = 2;
    const range = [];
    const result = [];
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) range.push(i);
    currentPage - delta > 2 ? result.push(1, '...') : result.push(1);
    result.push(...range);
    currentPage + delta < totalPages - 1 ? result.push('...', totalPages) : totalPages > 1 && result.push(totalPages);
    return result.filter((v, i, a) => a.indexOf(v) === i);
  };

  return (
    <Layout pageTitle="Audit Logs" onSearch={setSearchTerm} searchPlaceholder="Search by user, module...">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-extrabold tracking-tight" style={{ color: 'var(--foreground)' }}>Audit Logs</h1>
          <p className="mt-0.5 text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Track all system activities — {totalCount} total</p>
        </div>
        <button onClick={() => setShowDeleteModal(true)} className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5" style={{ background: 'linear-gradient(135deg, #DC2626, #EF4444)', boxShadow: '0 4px 14px rgba(239,68,68,0.35)' }}>
          <Trash2 className="h-4 w-4" /> Delete Old Logs
        </button>
      </div>

      <div className="mb-4 rounded-2xl border p-5" style={card}>
        <div className="mb-3 flex items-center gap-2">
          <Filter className="h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />
          <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>Filters</p>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>Action</label>
            <select value={selectedAction} onChange={(e) => setSelectedAction(e.target.value)} className="h-10 w-full rounded-xl border px-3 text-sm font-medium outline-none" style={selectStyle}>
              <option value="">All Actions</option>
              {actions.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>Module</label>
            <select value={selectedModule} onChange={(e) => setSelectedModule(e.target.value)} className="h-10 w-full rounded-xl border px-3 text-sm font-medium outline-none" style={selectStyle}>
              <option value="">All Modules</option>
              {modules.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="flex items-end pb-1">
            <label className="flex cursor-pointer items-center gap-2.5">
              <input type="checkbox" checked={excludeAdmin} onChange={(e) => setExcludeAdmin(e.target.checked)} className="rounded" />
              <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Hide Admin Logs</span>
            </label>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border" style={card}>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
          </div>
        ) : error ? (
          <div className="py-12 text-center text-sm font-semibold" style={{ color: 'var(--destructive)' }}>{error}</div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center">
            <Activity className="mx-auto mb-3 h-10 w-10" style={{ color: 'var(--muted-foreground)' }} />
            <p className="text-sm font-semibold" style={{ color: 'var(--muted-foreground)' }}>No audit logs found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ background: 'var(--muted)' }}>
                  <tr>
                    {['User', 'Action', 'Module', 'Object ID', 'Timestamp', 'Actions'].map((h) => (
                      <th key={h} className={thCls} style={{ color: 'var(--muted-foreground)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, i) => (
                    <tr key={log.id} style={{ borderTop: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--muted)' }}>
                      <td className={tdCls}>
                        <div className="flex items-center gap-2">
                          <User className="h-3.5 w-3.5 flex-shrink-0" style={{ color: 'var(--muted-foreground)' }} />
                          <span className="font-semibold" style={{ color: 'var(--foreground)' }}>{log.user_name}</span>
                        </div>
                      </td>
                      <td className={tdCls}><span className="rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide" style={actionStyle(log.action)}>{log.action_display || log.action}</span></td>
                      <td className={`${tdCls} font-medium`} style={{ color: 'var(--foreground)' }}>{log.module}</td>
                      <td className={tdCls} style={{ color: 'var(--muted-foreground)' }}>{log.object_id}</td>
                      <td className={tdCls}>
                        <div className="flex items-center gap-1.5" style={{ color: 'var(--muted-foreground)' }}>
                          <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                          <span>{log.formatted_timestamp || (log.timestamp ? new Date(log.timestamp).toLocaleString('en-IN', { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'N/A')}</span>
                        </div>
                      </td>
                      <td className={tdCls}>
                        <div className="flex items-center gap-1">
                          <button onClick={() => viewDetails(log)} className="rounded-lg p-1.5 transition-colors" title="View details" style={{ color: 'var(--primary)' }} onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--accent)')} onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                            <Eye className="h-4 w-4" />
                          </button>
                          <button onClick={() => { setLogToDelete(log.id); setShowDeleteConfirm(true); }} className="rounded-lg p-1.5 transition-colors" title="Delete" style={{ color: 'var(--destructive)' }} onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')} onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
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
              <div className="flex flex-col items-center justify-between gap-3 border-t px-5 py-4 sm:flex-row" style={{ borderColor: 'var(--border)' }}>
                <p className="text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>{logs.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}–{(currentPage - 1) * pageSize + logs.length} of {totalCount}</p>
                <div className="flex items-center gap-1">
                  {[{ icon: ChevronsLeft, action: () => setCurrentPage(1), disabled: currentPage === 1 }, { icon: ChevronLeft, action: () => setCurrentPage((p) => Math.max(p - 1, 1)), disabled: !hasPrevious }].map(({ icon: Icon, action, disabled }, idx) => (
                    <button key={idx} onClick={action} disabled={disabled} className="rounded-xl border p-2 transition-colors disabled:opacity-40" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
                      <Icon className="h-4 w-4" />
                    </button>
                  ))}
                  {getPageNumbers().map((p, idx) => p === '...' ? <span key={`d${idx}`} className="px-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>…</span> : <button key={p} onClick={() => setCurrentPage(Number(p))} className="rounded-xl border px-3 py-1.5 text-xs font-bold transition-colors" style={currentPage === p ? btnPrimary : { borderColor: 'var(--border)', color: 'var(--foreground)', background: 'transparent' }}>{p}</button>)}
                  {[{ icon: ChevronRight, action: () => setCurrentPage((p) => p + 1), disabled: !hasNext }, { icon: ChevronsRight, action: () => setCurrentPage(totalPages), disabled: !hasNext }].map(({ icon: Icon, action, disabled }, idx) => (
                    <button key={idx} onClick={action} disabled={disabled} className="rounded-xl border p-2 transition-colors disabled:opacity-40" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
                      <Icon className="h-4 w-4" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showModal && selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-2xl border" style={card} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b p-5" style={{ borderColor: 'var(--border)' }}>
              <h3 className="text-base font-extrabold" style={{ color: 'var(--foreground)' }}>Audit Log Details</h3>
              <button onClick={() => setShowModal(false)} className="rounded-lg p-1.5 transition-colors" style={{ color: 'var(--muted-foreground)' }} onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--muted)')} onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>✕</button>
            </div>
            <div className="max-h-[calc(85vh-72px)] space-y-4 overflow-y-auto p-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {[{ label: 'User', value: selectedLog.user_name }, { label: 'Module', value: selectedLog.module }, { label: 'Object ID', value: selectedLog.object_id, mono: true }, { label: 'Timestamp', value: selectedLog.formatted_timestamp || (selectedLog.timestamp ? new Date(selectedLog.timestamp).toLocaleString() : 'N/A') }].map(({ label, value, mono }) => (
                  <div key={label}>
                    <p className="mb-1 text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>{label}</p>
                    <p className={`text-sm font-semibold ${mono ? 'font-mono' : ''}`} style={{ color: 'var(--foreground)' }}>{value}</p>
                  </div>
                ))}
                <div>
                  <p className="mb-1 text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>Action</p>
                  <span className="rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide" style={actionStyle(selectedLog.action)}>{selectedLog.action}</span>
                </div>
              </div>
              {selectedLog.changes && (
                <div>
                  <p className="mb-2 text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>Changes</p>
                  <pre className="overflow-x-auto rounded-xl border p-4 text-xs font-mono leading-relaxed" style={{ background: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}>{JSON.stringify(selectedLog.changes, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && logToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => { setShowDeleteConfirm(false); setLogToDelete(null); }}>
          <div className="w-full max-w-sm rounded-2xl border p-6" style={card} onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-2 text-base font-extrabold" style={{ color: 'var(--foreground)' }}>Delete Log</h3>
            <p className="mb-5 text-sm" style={{ color: 'var(--muted-foreground)' }}>Are you sure? This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => deleteLog(logToDelete)} disabled={loading} className="flex-1 rounded-xl py-2.5 text-sm font-bold text-white disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #DC2626, #EF4444)', boxShadow: '0 4px 14px rgba(239,68,68,0.35)' }}>Delete</button>
              <button onClick={() => { setShowDeleteConfirm(false); setLogToDelete(null); }} className="flex-1 rounded-xl border py-2.5 text-sm font-bold" style={{ borderColor: 'var(--border)', color: 'var(--foreground)', background: 'var(--muted)' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)}>
          <div className="w-full max-w-sm rounded-2xl border p-6" style={card} onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-2 text-base font-extrabold" style={{ color: 'var(--foreground)' }}>Delete Old Logs</h3>
            <p className="mb-4 text-sm" style={{ color: 'var(--muted-foreground)' }}>Permanently delete all logs older than the selected period.</p>
            <div className="mb-5">
              <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>Delete logs older than</label>
              <select value={deleteDays} onChange={(e) => setDeleteDays(Number(e.target.value))} className="h-10 w-full rounded-xl border px-3 text-sm font-medium outline-none" style={{ background: 'var(--input-background)', borderColor: 'var(--input)', color: 'var(--foreground)' }}>
                <option value={0}>All logs</option>
                <option value={1}>1 day</option>
                <option value={7}>7 days</option>
                <option value={30}>30 days</option>
                <option value={90}>90 days</option>
                <option value={180}>6 months</option>
                <option value={365}>1 year</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button onClick={bulkDelete} disabled={loading} className="flex-1 rounded-xl py-2.5 text-sm font-bold text-white disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #DC2626, #EF4444)', boxShadow: '0 4px 14px rgba(239,68,68,0.35)' }}>Delete Logs</button>
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 rounded-xl border py-2.5 text-sm font-bold" style={{ borderColor: 'var(--border)', color: 'var(--foreground)', background: 'var(--muted)' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed right-4 top-4 z-50 rounded-xl px-5 py-3 text-sm font-bold text-white shadow-lg transition-all" style={{ background: toast.type === 'success' ? 'linear-gradient(135deg, #059669, #10B981)' : 'linear-gradient(135deg, #DC2626, #EF4444)', boxShadow: toast.type === 'success' ? '0 4px 14px rgba(16,185,129,0.4)' : '0 4px 14px rgba(239,68,68,0.4)' }}>
          {toast.message}
        </div>
      )}
    </Layout>
  );
}
