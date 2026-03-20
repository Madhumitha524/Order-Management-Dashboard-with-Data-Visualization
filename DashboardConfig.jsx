import React, { useState, useEffect, useRef } from 'react';
import { WIDGET_TYPES } from '../../utils/constants';
import WidgetSettingsPanel from './WidgetSettingsPanel';
import ConfirmDialog from '../ConfirmDialog';
import {
  KPIWidget, BarChartWidget, LineChartWidget, AreaChartWidget,
  ScatterWidget, PieChartWidget, TableWidget, DateFilterWidget
} from '../Widgets/WidgetRenderers';

const COLS = 12;
const ROW_HEIGHT = 60;
const COL_WIDTH_PCT = 100 / COLS;

let idCounter = Date.now();
const genId = () => `w_${idCounter++}`;

export default function DashboardConfig({ orders, initialWidgets, onSave, onCancel }) {
  const [widgets, setWidgets] = useState(initialWidgets || []);
  const [dragWidget, setDragWidget] = useState(null); // widget being dragged from palette
  const [dragExisting, setDragExisting] = useState(null); // widget being repositioned
  const [dropPreview, setDropPreview] = useState(null);
  const [settingsWidget, setSettingsWidget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const canvasRef = useRef();

  // Compute canvas height based on widgets
  const maxRow = widgets.reduce((max, w) => Math.max(max, w.position.y + w.size.height), 10);
  const canvasRows = Math.max(maxRow + 2, 10);

  const getCanvasBounds = () => canvasRef.current?.getBoundingClientRect();

  const posFromEvent = (e) => {
    const bounds = getCanvasBounds();
    if (!bounds) return { x: 0, y: 0 };
    const relX = e.clientX - bounds.left;
    const relY = e.clientY - bounds.top;
    const colW = bounds.width / COLS;
    return {
      x: Math.max(0, Math.min(COLS - 1, Math.floor(relX / colW))),
      y: Math.max(0, Math.floor(relY / ROW_HEIGHT)),
    };
  };

  // Drop from palette
  const handleCanvasDragOver = (e) => {
    e.preventDefault();
    const pos = posFromEvent(e);
    if (dragWidget) {
      setDropPreview({ x: pos.x, y: pos.y, width: dragWidget.defaultWidth, height: dragWidget.defaultHeight });
    } else if (dragExisting) {
      setDropPreview({ x: pos.x, y: pos.y, width: dragExisting.size.width, height: dragExisting.size.height });
    }
  };

  const handleCanvasDrop = (e) => {
    e.preventDefault();
    const pos = posFromEvent(e);
    if (dragWidget) {
      const newWidget = {
        id: genId(),
        type: dragWidget.id,
        title: 'Untitled',
        description: '',
        position: { x: Math.min(pos.x, COLS - dragWidget.defaultWidth), y: pos.y },
        size: { width: dragWidget.defaultWidth, height: dragWidget.defaultHeight },
        config: {},
      };
      setWidgets(prev => [...prev, newWidget]);
      setDragWidget(null);
    } else if (dragExisting) {
      setWidgets(prev => prev.map(w =>
        w.id === dragExisting.id
          ? { ...w, position: { x: Math.min(pos.x, COLS - w.size.width), y: pos.y } }
          : w
      ));
      setDragExisting(null);
    }
    setDropPreview(null);
  };

  const handleCanvasDragLeave = () => setDropPreview(null);

  const openSettings = (widget) => setSettingsWidget(widget);

  const handleSettingsSave = (updated) => {
    setWidgets(prev => prev.map(w => w.id === updated.id ? updated : w));
    setSettingsWidget(null);
  };

  const handleDelete = () => {
    setWidgets(prev => prev.filter(w => w.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const renderWidget = (widget) => {
    const filteredOrders = orders;
    switch (widget.type) {
      case 'kpi': return <KPIWidget widget={widget} orders={filteredOrders} />;
      case 'bar-chart': return <BarChartWidget widget={widget} orders={filteredOrders} />;
      case 'line-chart': return <LineChartWidget widget={widget} orders={filteredOrders} />;
      case 'area-chart': return <AreaChartWidget widget={widget} orders={filteredOrders} />;
      case 'scatter-plot': return <ScatterWidget widget={widget} orders={filteredOrders} />;
      case 'pie-chart': return <PieChartWidget widget={widget} orders={filteredOrders} />;
      case 'table': return <TableWidget widget={widget} orders={filteredOrders} />;
      case 'date-filter': return <DateFilterWidget dateRange={dateRange} onDateChange={setDateRange} />;
      default: return null;
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Left Palette */}
      <aside style={{
        width: '220px', background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)', flexShrink: 0,
        display: 'flex', flexDirection: 'column', overflowY: 'auto',
      }}>
        <div style={{ padding: '16px 14px 8px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, marginBottom: '4px' }}>Widgets</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Drag onto canvas</div>
        </div>
        <div style={{ padding: '10px 10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {WIDGET_TYPES.map(wt => (
            <div
              key={wt.id}
              draggable
              onDragStart={() => setDragWidget(wt)}
              onDragEnd={() => { setDragWidget(null); setDropPreview(null); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 12px', borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)', background: 'var(--bg-card)',
                cursor: 'grab', fontSize: '13px', color: 'var(--text-secondary)',
                transition: 'all 0.15s', userSelect: 'none',
              }}
              onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              <span style={{ fontSize: '18px' }}>{wt.icon}</span>
              <span>{wt.label}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Toolbar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px', borderBottom: '1px solid var(--border)',
          background: 'var(--bg-secondary)',
        }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '16px' }}>
            Dashboard Configuration
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
            <button className="btn btn-primary" onClick={() => onSave(widgets)}>
              💾 Save Configuration
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', background: 'var(--bg-primary)' }}>
          <div
            ref={canvasRef}
            onDragOver={handleCanvasDragOver}
            onDrop={handleCanvasDrop}
            onDragLeave={handleCanvasDragLeave}
            style={{
              position: 'relative',
              width: '100%',
              height: `${canvasRows * ROW_HEIGHT}px`,
              background: 'var(--bg-secondary)',
              border: '1px dashed var(--border-light)',
              borderRadius: 'var(--radius)',
              backgroundImage: `
                linear-gradient(to right, var(--border) 1px, transparent 1px),
                linear-gradient(to bottom, var(--border) 1px, transparent 1px)
              `,
              backgroundSize: `${COL_WIDTH_PCT}% ${ROW_HEIGHT}px`,
            }}
          >
            {/* Drop preview */}
            {dropPreview && (
              <div style={{
                position: 'absolute',
                left: `${(dropPreview.x / COLS) * 100}%`,
                top: `${dropPreview.y * ROW_HEIGHT}px`,
                width: `${(dropPreview.width / COLS) * 100}%`,
                height: `${dropPreview.height * ROW_HEIGHT}px`,
                background: 'rgba(84, 189, 149, 0.15)',
                border: '2px dashed var(--accent)',
                borderRadius: 'var(--radius-sm)',
                zIndex: 0,
                pointerEvents: 'none',
              }} />
            )}

            {/* Widgets */}
            {widgets.map(widget => (
              <CanvasWidget
                key={widget.id}
                widget={widget}
                onSettings={() => openSettings(widget)}
                onDelete={() => setDeleteTarget(widget)}
                onDragStart={() => setDragExisting(widget)}
                onDragEnd={() => { setDragExisting(null); setDropPreview(null); }}
              >
                {renderWidget(widget)}
              </CanvasWidget>
            ))}

            {widgets.length === 0 && !dropPreview && (
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexDirection: 'column', gap: '10px',
              }}>
                <div style={{ fontSize: '36px', opacity: 0.3 }}>⊞</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                  Drag widgets from the panel to get started
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {settingsWidget && (
        <WidgetSettingsPanel
          widget={settingsWidget}
          onClose={() => setSettingsWidget(null)}
          onSave={handleSettingsSave}
        />
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <ConfirmDialog
          title="Remove Widget"
          message={`Remove "${deleteTarget.title}" from the dashboard?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

function CanvasWidget({ widget, onSettings, onDelete, onDragStart, onDragEnd, children }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'absolute',
        left: `${(widget.position.x / COLS) * 100}%`,
        top: `${widget.position.y * ROW_HEIGHT}px`,
        width: `${(widget.size.width / COLS) * 100}%`,
        height: `${widget.size.height * ROW_HEIGHT}px`,
        background: 'var(--bg-card)',
        border: `1px solid ${hovered ? 'var(--accent)' : 'var(--border)'}`,
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
        cursor: 'grab',
        transition: 'border-color 0.2s',
        zIndex: hovered ? 10 : 1,
        boxSizing: 'border-box',
      }}
    >
      {/* Widget header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '6px 10px',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
      }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {widget.title}
        </span>
        {hovered && (
          <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
            <button
              className="btn btn-icon"
              style={{ width: '26px', height: '26px', padding: 0, background: 'var(--bg-hover)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '14px', cursor: 'pointer', borderRadius: '4px' }}
              onClick={e => { e.stopPropagation(); onSettings(); }}
              title="Settings"
            >⚙</button>
            <button
              className="btn btn-icon"
              style={{ width: '26px', height: '26px', padding: 0, background: 'var(--danger-dim)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--danger)', fontSize: '14px', cursor: 'pointer', borderRadius: '4px' }}
              onClick={e => { e.stopPropagation(); onDelete(); }}
              title="Delete"
            >✕</button>
          </div>
        )}
      </div>
      {/* Widget content */}
      <div style={{ padding: '10px', height: `calc(100% - 38px)`, overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  );
}
