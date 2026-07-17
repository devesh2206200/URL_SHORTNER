import React, { useState, useEffect } from 'react';
import { Copy, Trash2, BarChart3, ExternalLink, Calendar, ShieldAlert, ChevronUp, Link2, RefreshCw, QrCode, X, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { getUserUrls, deleteUserUrl, getUrlAnalytics, getUrlQR } from '../api/api';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Dashboard({ token, onLogout }) {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [analytics, setAnalytics] = useState({});
  const [analyticsLoading, setAnalyticsLoading] = useState({}); // per-card loading: { [id]: boolean }
  const [copiedId, setCopiedId] = useState(null);
  const [qrModal, setQrModal] = useState(null); // { url, src }

  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => { fetchUrls(); }, []);

  async function fetchUrls() {
    if (!token) { setError('Please log in to view your dashboard.'); setLoading(false); return; }
    setLoading(true); setError('');
    try {
      const data = await getUserUrls(token);
      setUrls(data.data || []);
    } catch (err) {
      if (err.status === 401) {
        onLogout();
        return;
      }
      setError(err.message);
      toast.error(err.message || 'Failed to load URLs.');
    } finally {
      setLoading(false);
    }
  }

  function handleDelete(id) {
    setConfirmDeleteId(id);
  }

  async function executeDelete(id) {
    const toastId = toast.loading('Deleting link...');
    try {
      await deleteUserUrl(id, token);
      setUrls(urls.filter(u => u._id !== id));
      if (expandedId === id) setExpandedId(null);
      toast.success('Link deleted successfully!', { id: toastId });
    } catch (err) {
      if (err.status === 401) {
        toast.dismiss(toastId);
        onLogout();
        return;
      }
      toast.error(err.message || 'Failed to delete.', { id: toastId });
    }
  }

  async function toggleAnalytics(shortUrlId, id) {
    if (expandedId === id) { setExpandedId(null); return; }
    setExpandedId(id);
    
    // Only fetch if we don't have it yet
    if (!analytics[id]) {
      setAnalyticsLoading(prev => ({ ...prev, [id]: true }));
      try {
        const data = await getUrlAnalytics(shortUrlId, token);
        setAnalytics(prev => ({ ...prev, [id]: data.data }));
      } catch (err) {
        if (err.status === 401) {
          onLogout();
          return;
        }
        console.error(err);
        toast.error(err.message || 'Failed to load analytics.');
      } finally {
        setAnalyticsLoading(prev => ({ ...prev, [id]: false }));
      }
    }
  }

  function handleCopy(link, id) {
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success('Link copied to clipboard!');
  }

  async function handleQR(shortUrlId, shortLink) {
    const toastId = toast.loading('Generating QR code...');
    try {
      const data = await getUrlQR(shortUrlId, token);
      setQrModal({ url: shortLink, src: data.data.qrCode });
      toast.dismiss(toastId);
    } catch (err) {
      if (err.status === 401) {
        toast.dismiss(toastId);
        onLogout();
        return;
      }
      toast.error(err.message || 'Failed to generate QR code.', { id: toastId });
    }
  }

  function downloadQR() {
    if (!qrModal) return;
    const a = document.createElement('a');
    a.href = qrModal.src;
    a.download = 'qrcode.png';
    a.click();
  }

  return (
    <div className="dashboard-container">
      {qrModal && (
        <div className="qr-overlay" onClick={() => setQrModal(null)}>
          <div className="qr-modal" onClick={e => e.stopPropagation()}>
            <button className="qr-close" onClick={() => setQrModal(null)}><X size={18} /></button>
            <h3>QR Code</h3>
            <p className="qr-url-label">{qrModal.url}</p>
            <img src={qrModal.src} alt="QR Code" className="qr-image" />
            <button className="btn-qr-download" onClick={downloadQR}><Download size={15} /> Download PNG</button>
          </div>
        </div>
      )}
      {confirmDeleteId && (
        <div className="auth-overlay" onClick={() => setConfirmDeleteId(null)}>
          <div className="auth-modal-card" onClick={e => e.stopPropagation()}>
            <button className="auth-close-btn" onClick={() => setConfirmDeleteId(null)}><X size={20} /></button>
            <div className="auth-header" style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', color: '#111827', fontWeight: 700 }}>Delete Link?</h2>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
                Are you sure you want to delete this link and all its analytics? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <button 
                className="btn-logout" 
                onClick={() => setConfirmDeleteId(null)}
              >
                Cancel
              </button>
              <button 
                className="btn-signup" 
                style={{ backgroundColor: 'hsl(0, 72%, 51%)', padding: '0.5rem 1.5rem' }} 
                onClick={() => {
                  const id = confirmDeleteId;
                  setConfirmDeleteId(null);
                  executeDelete(id);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="dashboard-header flex justify-between items-center">
        <div>
          <h2>Your Dashboard</h2>
          <p className="subtitle">Manage links, custom aliases, and view detailed click metrics.</p>
        </div>
        <button className="btn-secondary" onClick={fetchUrls} title="Refresh"><RefreshCw size={16} /></button>
      </div>

      {error && <div className="dashboard-error">{error}</div>}

      {loading ? (
        <div className="flex justify-center items-center py-20"><div className="spinner"></div></div>
      ) : urls.length === 0 ? (
        <div className="dashboard-empty-card">
          <Link2 size={48} className="empty-icon" />
          <h3>No Links Shortened Yet</h3>
          <p>Go back to the homepage and shorten your first URL!</p>
        </div>
      ) : (
        <div className="urls-list-container">
          {urls.map(url => {
            const isExpanded = expandedId === url._id;
            const isExpired = url.expiresAt && new Date() > new Date(url.expiresAt);
            const shortLink = `${API}/${url.shortUrlId}`;
            const isCardLoading = !!analyticsLoading[url._id];
            
            return (
              <div className={`url-dashboard-card ${isExpired ? 'expired-border' : ''}`} key={url._id}>
                <div className="url-card-row">
                  <div className="url-card-info">
                    <div className="url-original-section">
                      <a href={url.url} target="_blank" rel="noopener noreferrer" className="original-url-link" title={url.url}>
                        {url.url}<ExternalLink size={12} className="inline-icon" />
                      </a>
                    </div>
                    <div className="url-shortened-section">
                      <a href={shortLink} target="_blank" rel="noopener noreferrer" className="short-url-link">{shortLink}</a>
                      {url.customAlias && <span className="badge-alias">custom alias</span>}
                    </div>
                  </div>

                  <div className="url-card-meta">
                    <div className="meta-clicks">
                      <span className="clicks-number">{url.clicks}</span>
                      <span className="clicks-label">clicks</span>
                    </div>
                    <div className="meta-dates">
                      <div className="date-item"><Calendar size={12} /><span>Created: {new Date(url.createdAt).toLocaleDateString()}</span></div>
                      {url.expiresAt && (
                        <div className={`date-item ${isExpired ? 'expired-text' : 'expires-text'}`}>
                          <ShieldAlert size={12} />
                          <span>{isExpired ? 'Expired: ' : 'Expires: '}{new Date(url.expiresAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                    <div className="url-card-actions">
                      <button className={`btn-action btn-copy-action ${copiedId === url._id ? 'copied' : ''}`} onClick={() => handleCopy(shortLink, url._id)}>
                        {copiedId === url._id ? 'Copied!' : <Copy size={16} />}
                      </button>
                      <button className="btn-action btn-analytics-action" onClick={() => toggleAnalytics(url.shortUrlId, url._id)}>
                        {isExpanded ? <ChevronUp size={16} /> : <BarChart3 size={16} />}
                      </button>
                      <button className="btn-action btn-qr-action" onClick={() => handleQR(url.shortUrlId, shortLink)} title="Generate QR Code">
                        <QrCode size={16} />
                      </button>
                      <button className="btn-action btn-delete-action" onClick={() => handleDelete(url._id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="analytics-drawer">
                    {isCardLoading ? (
                      <div className="flex justify-center py-10"><div className="spinner-small"></div></div>
                    ) : !analytics[url._id] ? (
                      <p className="no-data-text">Failed to load analytics.</p>
                    ) : (
                      <AnalyticsPanel data={analytics[url._id]} />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AnalyticsPanel({ data }) {
  const { totalClicks, browsers, os, referrers, timeline } = data.analytics;

  function BarList({ items }) {
    return items && items.length > 0 ? (
      <div className="stats-bars">
        {items.map((item, i) => {
          const percent = Math.round((item.count / totalClicks) * 100);
          return (
            <div key={i} className="bar-row">
              <div className="bar-label-group">
                <span className="bar-name">{item.name}</span>
                <span className="bar-count">{item.count} ({percent}%)</span>
              </div>
              <div className="bar-bg"><div className="bar-fill browser-fill" style={{ width: `${percent}%` }}></div></div>
            </div>
          );
        })}
      </div>
    ) : <p className="no-data-text">No data collected.</p>;
  }

  return (
    <div className="analytics-panel-content">
      <h4 className="panel-title">Click Analytics Breakdown ({totalClicks} Total Clicks)</h4>
      <div className="analytics-section timeline-section">
        <h5>Clicks Over Time (Last 30 Active Days)</h5>
        {timeline && timeline.length > 0 ? <TimelineChart timeline={timeline} /> : <p className="no-data-text">No timeline data yet.</p>}
      </div>
      <div className="analytics-grid">
        <div className="analytics-card"><h5>Top Browsers</h5><BarList items={browsers} /></div>
        <div className="analytics-card"><h5>Operating Systems</h5><BarList items={os} /></div>
        <div className="analytics-card full-width"><h5>Traffic Referrers</h5><BarList items={referrers} /></div>
      </div>
    </div>
  );
}

function TimelineChart({ timeline }) {
  const W = 500, H = 150, PX = 40, PY = 20;
  const max = Math.max(...timeline.map(d => d.clicks), 5);
  const n = timeline.length;

  const pts = timeline.map((d, i) => ({
    x: PX + (i * (W - PX * 2)) / (n > 1 ? n - 1 : 1),
    y: H - PY - (d.clicks * (H - PY * 2)) / max,
    ...d,
  }));

  let pathD = pts.length ? `M ${pts[0].x} ${pts[0].y}` : '';
  for (let i = 1; i < pts.length; i++) {
    const cx = pts[i - 1].x + (pts[i].x - pts[i - 1].x) / 2;
    pathD += ` C ${cx} ${pts[i - 1].y}, ${cx} ${pts[i].y}, ${pts[i].x} ${pts[i].y}`;
  }
  const areaD = pts.length ? `${pathD} L ${pts[n-1].x} ${H-PY} L ${pts[0].x} ${H-PY} Z` : '';

  return (
    <div className="timeline-chart-wrapper">
      <svg viewBox={`0 0 ${W} ${H}`} className="timeline-svg">
        <defs>
          <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 0.5, 1].map((r, i) => {
          const y = PY + r * (H - PY * 2);
          return <g key={i}>
            <line x1={PX} y1={y} x2={W - PX} y2={y} stroke="#374151" strokeDasharray="3,3" />
            <text x={PX - 10} y={y + 4} textAnchor="end" fill="#9ca3af" fontSize="9">{Math.round(max - r * max)}</text>
          </g>;
        })}
        {areaD && <path d={areaD} fill="url(#cg)" />}
        {pathD && <path d={pathD} fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" />}
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4" fill="var(--color-primary)" stroke="#1f2937" strokeWidth="1.5" />
            <title>{`${p.date}: ${p.clicks} clicks`}</title>
            {(i === 0 || i === Math.floor(n / 2) || i === n - 1) && (
              <text x={p.x} y={H - 4} textAnchor="middle" fill="#9ca3af" fontSize="8">
                {new Date(p.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}