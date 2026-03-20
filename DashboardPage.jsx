import React, { useState, useEffect } from 'react';
import { ordersAPI, dashboardAPI } from '../utils/api';
import { useToast } from '../context/ToastContext';
import DashboardConfig from '../components/Dashboard/DashboardConfig';
import {
  KPIWidget, BarChartWidget, LineChartWidget, AreaChartWidget,
  ScatterWidget, PieChartWidget, TableWidget, DateFilterWidget
} from '../components/Widgets/WidgetRenderers';

const COLS = 12;
const ROW_HEIGHT = 60;

// Responsive column grid based on viewport width
function getEffectiveCols() {
  const w = window.innerWidth;
  if (w >= 1024) return 12;
  if (w >= 768) return 8;
  return 4;
}

export default function DashboardPage() {
  const [mode, setMode] = useState('view'); // 'view' | 'config'
  const [widgets, setWidgets] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [effectiveCols, setEffectiveCols] = useState(getEffectiveCols());
  const { addToast } = useToast();

  // Responsive listener
  useEffect(() => {
    const update = () => setEffectiveCols(getEffectiveCols());
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (dateRange.start) params.startDate = dateRange.start;
      if (dateRange.end) params.endDate = dateRange.end;
      const [dashRes, ordersRes] = await Promise.all([
        dashboardAPI.get(),
        ordersAPI.getAll(params),
      ]);
      setWidgets(dashRes.data.data.widgets || []);
      setOrders(ordersRes.data.data || []);
    } catch {
      addToast('Failed to load dashboard data', 'error');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [dateRange]);

  const handleSaveConfig = async (newWidgets) => {
    try {
      await dashboardAPI.save({ widgets: newWidgets });
      setWidgets(newWidgets);
      setMode('view');
      addToast('Dashboard configuration saved!');
    } catch {
      addToast('Failed to save configuration', 'error');
    }
  };

  // Responsive layout: reflow widgets for current column count
  const getResponsivePosition = (widget) => {
    if (effectiveCols === 12) return widget.position;
    // Simple reflow: place widgets in order by their Y then X position
    return widget.position;
  };

  const getResponsiveWidth = (widget) => {
    const w = Math.min(widget.size.width, effectiveCols);
    return w;
  };

  // Re-compute layout for responsive
  const computeLayout = () => {
    if (effectiveCols === 12) return widgets;
    // Reflow into effectiveCols grid
    const sorted = [...widgets].sort((a, b) => a.position.y - b.position.y || a.position.x - b.position.x);
    let curX = 0, curY = 0, rowH = 0;
    return sorted.map(w => {
      const rw = Math.min(w.size.width, effectiveCols);
      if (curX + rw > effectiveCols) { curX = 0; curY += rowH; rowH = 0; }
      const pos = { x: curX, y: curY };
      curX += rw;
      rowH = Math.max(rowH, w.size.height);
      return { ...w, _rpos: pos, _rwidth: rw };
    });
  };

  const laidOut = computeLayout();
  const maxRow = laidOut.reduce((max, w) => Math.max(max, (w._rpos || w.position).y + w.size.height), 0);
  const canvasRows = Math.max(maxRow, 6);

  const renderWidget = (widget) => {
    switch (widget.type) {
      case 'kpi': return <KPIWidget widget={widget} orders={orders} />;
      case 'bar-chart': return <BarChartWidget widget={widget} orders={orders} />;
      case 'line-chart': return <LineChartWidget widget={widget} orders={orders} />;
      case 'area-chart': return <AreaChartWidget widget={widget} orders={orders} />;
      case 'scatter-plot': return <ScatterWidget widget={widget} orders={orders} />;
      case 'pie-chart': return <PieChartWidget widget={widget} orders={orders} />;
      case 'table': return <TableWidget widget={widget} orders={orders} />;
      case 'date-filter': return <DateFilterWidget dateRange={dateRange} onDateChange={setDateRange} />;
      default: return null;
    }
  };

  if (mode === 'config') {
    return (
      <DashboardConfig
        orders={orders}
        initialWidgets={widgets}
        onSave={handleSaveConfig}
        onCancel={() => setMode('view')}
      />
    );
  }

  return (
    <div style={{ padding: '28px', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 800 }}>Dashboard</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
            {effectiveCols === 12 ? 'Desktop' : effectiveCols === 8 ? 'Tablet' : 'Mobile'} · {effectiveCols}-column grid
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setMode('config')}>
          ⚙ Configure Dashboard
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '80px' }}>Loading dashboard...</div>
      ) : widgets.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎛️</div>
          <div className="empty-title">No widgets configured</div>
          <div className="empty-desc">
            Click <strong style={{ color: 'var(--accent)' }}>Configure Dashboard</strong> to start building your personalized dashboard.
          </div>
          <button className="btn btn-primary" style={{ marginTop: '8px' }} onClick={() => setMode('config')}>
            Configure Dashboard
          </button>
        </div>
      ) : (
        <div style={{
          position: 'relative',
          width: '100%',
          height: `${canvasRows * ROW_HEIGHT}px`,
        }}>
          {laidOut.map(widget => {
            const pos = widget._rpos || widget.position;
            const rw = widget._rwidth || Math.min(widget.size.width, effectiveCols);
            const colPct = 100 / effectiveCols;
            return (
              <div
                key={widget.id}
                style={{
                  position: 'absolute',
                  left: `${pos.x * colPct}%`,
                  top: `${pos.y * ROW_HEIGHT}px`,
                  width: `${rw * colPct}%`,
                  height: `${widget.size.height * ROW_HEIGHT}px`,
                  padding: '4px',
                  boxSizing: 'border-box',
                }}
              >
                <div style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  height: '100%',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                }}>
                  <div style={{
                    padding: '8px 14px',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexShrink: 0,
                  }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700 }}>
                      {widget.title}
                    </span>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', background: 'var(--bg-secondary)', padding: '2px 7px', borderRadius: '10px' }}>
                      {widget.type.replace('-', ' ')}
                    </span>
                  </div>
                  <div style={{ flex: 1, padding: '10px', overflow: 'hidden' }}>
                    {renderWidget(widget)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
