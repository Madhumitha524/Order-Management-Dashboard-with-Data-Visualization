import React, { useMemo } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Filler, Title, Tooltip, Legend
} from 'chart.js';
import { Bar, Line, Pie, Scatter } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Filler, Title, Tooltip, Legend);

const PIE_COLORS = ['#54bd95','#3b82f6','#f59e0b','#ef4444','#8b5cf6','#ec4899','#14b8a6','#f97316'];

function getOrderValue(order, field) {
  const map = {
    'Product': order.product,
    'Quantity': order.quantity,
    'Unit price': order.unitPrice,
    'Total amount': order.totalAmount,
    'Status': order.status,
    'Created by': order.createdBy,
    'Duration': (() => {
      const d = new Date(order.orderDate);
      return d.getMonth() + 1;
    })(),
  };
  return map[field];
}

function aggregateForChart(orders, xField, yField) {
  const grouped = {};
  orders.forEach(order => {
    const xVal = String(getOrderValue(order, xField) ?? 'Unknown');
    const yVal = Number(getOrderValue(order, yField) ?? 0);
    if (!grouped[xVal]) grouped[xVal] = { sum: 0, count: 0 };
    grouped[xVal].sum += isNaN(yVal) ? 1 : yVal;
    grouped[xVal].count += 1;
  });
  return { labels: Object.keys(grouped), values: Object.values(grouped).map(v => v.sum) };
}

function aggregateForPie(orders, field) {
  const grouped = {};
  orders.forEach(order => {
    const val = String(getOrderValue(order, field) ?? 'Unknown');
    grouped[val] = (grouped[val] || 0) + 1;
  });
  return { labels: Object.keys(grouped), values: Object.values(grouped) };
}

// KPI Widget
export function KPIWidget({ widget, orders }) {
  const cfg = widget.config || {};
  const value = useMemo(() => {
    if (!orders || !cfg.metric) return 0;
    const fieldMap = {
      'Total amount': 'totalAmount', 'Unit price': 'unitPrice', 'Quantity': 'quantity',
      'Customer ID': '_id', 'Customer name': 'firstName', 'Email id': 'emailId',
      'Address': 'streetAddress', 'Order date': 'orderDate', 'Product': 'product',
      'Created by': 'createdBy', 'Status': 'status',
    };
    const f = fieldMap[cfg.metric];
    if (cfg.aggregation === 'Count') return orders.length;
    if (cfg.aggregation === 'Sum') return orders.reduce((s, o) => s + (Number(o[f]) || 0), 0);
    if (cfg.aggregation === 'Average') {
      const nums = orders.map(o => Number(o[f])).filter(v => !isNaN(v));
      return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
    }
    return orders.length;
  }, [orders, cfg]);

  const displayValue = () => {
    const num = Number(value).toFixed(Number(cfg.decimalPrecision ?? 0));
    if (cfg.dataFormat === 'Currency') return `$${Number(num).toLocaleString()}`;
    return Number(num).toLocaleString();
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
      <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
        {cfg.metric || 'Metric'}
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px,4vw,42px)', fontWeight: 800, color: 'var(--accent)', lineHeight: 1 }}>
        {displayValue()}
      </div>
      {cfg.aggregation && (
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', background: 'var(--accent-dim)', padding: '2px 8px', borderRadius: '10px' }}>
          {cfg.aggregation}
        </div>
      )}
      {widget.description && (
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '4px' }}>
          {widget.description}
        </div>
      )}
    </div>
  );
}

// Bar Chart Widget
export function BarChartWidget({ widget, orders }) {
  const cfg = widget.config || {};
  const { labels, values } = useMemo(() => {
    if (!orders || !cfg.xAxis || !cfg.yAxis) return { labels: [], values: [] };
    return aggregateForChart(orders, cfg.xAxis, cfg.yAxis);
  }, [orders, cfg]);

  const data = {
    labels,
    datasets: [{
      label: cfg.yAxis || '',
      data: values,
      backgroundColor: cfg.chartColor || '#54bd95',
      borderRadius: 4,
    }]
  };
  const options = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      datalabels: { display: cfg.showDataLabel },
    },
    scales: {
      x: { ticks: { color: '#8b9ab5', font: { size: 11 } }, grid: { color: '#1f2d45' } },
      y: { ticks: { color: '#8b9ab5', font: { size: 11 } }, grid: { color: '#1f2d45' } },
    }
  };
  if (!labels.length) return <EmptyChartState />;
  return <div style={{ height: '100%', width: '100%' }}><Bar data={data} options={options} /></div>;
}

// Line Chart Widget
export function LineChartWidget({ widget, orders }) {
  const cfg = widget.config || {};
  const { labels, values } = useMemo(() => {
    if (!orders || !cfg.xAxis || !cfg.yAxis) return { labels: [], values: [] };
    return aggregateForChart(orders, cfg.xAxis, cfg.yAxis);
  }, [orders, cfg]);

  const color = cfg.chartColor || '#54bd95';
  const data = {
    labels,
    datasets: [{
      label: cfg.yAxis || '',
      data: values,
      borderColor: color,
      backgroundColor: color + '33',
      pointBackgroundColor: color,
      tension: 0.35,
      fill: false,
      pointRadius: 4,
    }]
  };
  const options = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: '#8b9ab5', font: { size: 11 } }, grid: { color: '#1f2d45' } },
      y: { ticks: { color: '#8b9ab5', font: { size: 11 } }, grid: { color: '#1f2d45' } },
    }
  };
  if (!labels.length) return <EmptyChartState />;
  return <div style={{ height: '100%', width: '100%' }}><Line data={data} options={options} /></div>;
}

// Area Chart Widget
export function AreaChartWidget({ widget, orders }) {
  const cfg = widget.config || {};
  const { labels, values } = useMemo(() => {
    if (!orders || !cfg.xAxis || !cfg.yAxis) return { labels: [], values: [] };
    return aggregateForChart(orders, cfg.xAxis, cfg.yAxis);
  }, [orders, cfg]);

  const color = cfg.chartColor || '#54bd95';
  const data = {
    labels,
    datasets: [{
      label: cfg.yAxis || '',
      data: values,
      borderColor: color,
      backgroundColor: color + '40',
      pointBackgroundColor: color,
      tension: 0.35,
      fill: true,
    }]
  };
  const options = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: '#8b9ab5', font: { size: 11 } }, grid: { color: '#1f2d45' } },
      y: { ticks: { color: '#8b9ab5', font: { size: 11 } }, grid: { color: '#1f2d45' } },
    }
  };
  if (!labels.length) return <EmptyChartState />;
  return <div style={{ height: '100%', width: '100%' }}><Line data={data} options={options} /></div>;
}

// Scatter Plot Widget
export function ScatterWidget({ widget, orders }) {
  const cfg = widget.config || {};
  const points = useMemo(() => {
    if (!orders || !cfg.xAxis || !cfg.yAxis) return [];
    return orders.map(o => ({
      x: Number(getOrderValue(o, cfg.xAxis)) || 0,
      y: Number(getOrderValue(o, cfg.yAxis)) || 0,
    })).filter(p => !isNaN(p.x) && !isNaN(p.y));
  }, [orders, cfg]);

  const color = cfg.chartColor || '#54bd95';
  const data = { datasets: [{ label: `${cfg.xAxis} vs ${cfg.yAxis}`, data: points, backgroundColor: color + 'bb', pointRadius: 5 }] };
  const options = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: '#8b9ab5' }, grid: { color: '#1f2d45' } },
      y: { ticks: { color: '#8b9ab5' }, grid: { color: '#1f2d45' } },
    }
  };
  if (!points.length) return <EmptyChartState />;
  return <div style={{ height: '100%', width: '100%' }}><Scatter data={data} options={options} /></div>;
}

// Pie Chart Widget
export function PieChartWidget({ widget, orders }) {
  const cfg = widget.config || {};
  const { labels, values } = useMemo(() => {
    if (!orders || !cfg.chartData) return { labels: [], values: [] };
    return aggregateForPie(orders, cfg.chartData);
  }, [orders, cfg]);

  const data = {
    labels,
    datasets: [{ data: values, backgroundColor: PIE_COLORS.slice(0, labels.length), borderWidth: 2, borderColor: '#161d2e' }]
  };
  const options = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: cfg.showLegend !== false, position: 'bottom', labels: { color: '#8b9ab5', font: { size: 11 }, padding: 12 } },
    }
  };
  if (!labels.length) return <EmptyChartState />;
  return <div style={{ height: '100%', width: '100%' }}><Pie data={data} options={options} /></div>;
}

// Table Widget
export function TableWidget({ widget, orders }) {
  const cfg = widget.config || {};
  const [page, setPage] = React.useState(0);
  const cols = cfg.columns || [];
  const fontSize = cfg.fontSize || 14;
  const pageSize = Number(cfg.pagination) || 0;
  const headerBg = cfg.headerBg || '#54bd95';

  const colMap = {
    'Customer ID': o => o.orderId || o._id?.slice(-6),
    'Customer name': o => `${o.firstName} ${o.lastName}`,
    'Email id': o => o.emailId,
    'Phone number': o => o.phoneNumber,
    'Address': o => `${o.streetAddress}, ${o.city}`,
    'Order ID': o => o.orderId,
    'Order date': o => new Date(o.orderDate).toLocaleDateString(),
    'Product': o => o.product,
    'Quantity': o => o.quantity,
    'Unit price': o => `$${Number(o.unitPrice).toFixed(2)}`,
    'Total amount': o => `$${Number(o.totalAmount).toFixed(2)}`,
    'Status': o => o.status,
    'Created by': o => o.createdBy,
  };

  let filtered = [...(orders || [])];

  // Apply filters
  if (cfg.applyFilter && cfg.filters?.length) {
    cfg.filters.forEach(f => {
      if (!f.field || !f.value) return;
      filtered = filtered.filter(o => {
        const val = String(colMap[f.field]?.(o) || '').toLowerCase();
        const fv = f.value.toLowerCase();
        if (f.operator === 'equals') return val === fv;
        if (f.operator === 'contains') return val.includes(fv);
        if (f.operator === 'gt') return Number(val) > Number(fv);
        if (f.operator === 'lt') return Number(val) < Number(fv);
        return true;
      });
    });
  }

  // Sort
  if (cfg.sortBy === 'Order date') {
    filtered.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
  } else if (cfg.sortBy === 'Ascending') {
    filtered.sort((a, b) => Number(a.totalAmount) - Number(b.totalAmount));
  } else if (cfg.sortBy === 'Descending') {
    filtered.sort((a, b) => Number(b.totalAmount) - Number(a.totalAmount));
  }

  const totalPages = pageSize ? Math.ceil(filtered.length / pageSize) : 1;
  const displayed = pageSize ? filtered.slice(page * pageSize, (page + 1) * pageSize) : filtered;

  if (!cols.length) return <EmptyChartState msg="No columns selected" />;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: `${fontSize}px` }}>
          <thead>
            <tr>
              {cols.map(col => (
                <th key={col} style={{
                  padding: '8px 12px', textAlign: 'left', fontSize: '11px',
                  fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                  background: headerBg, color: '#000',
                  position: 'sticky', top: 0,
                }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayed.map((order, i) => (
              <tr key={order._id || i} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                {cols.map(col => (
                  <td key={col} style={{ padding: '7px 12px', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: `${fontSize}px` }}>
                    {colMap[col]?.(order) || '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <EmptyChartState msg="No data" />}
      </div>
      {pageSize > 0 && totalPages > 1 && (
        <div className="pagination" style={{ padding: '8px 12px' }}>
          <button className="page-btn" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>‹</button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} className={`page-btn${page === i ? ' active' : ''}`} onClick={() => setPage(i)}>{i + 1}</button>
          ))}
          <button className="page-btn" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}>›</button>
        </div>
      )}
    </div>
  );
}

// Date Filter Widget
export function DateFilterWidget({ onDateChange, dateRange }) {
  return (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', padding: '8px' }}>
      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        Date Range
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input type="date" className="form-input" style={{ width: '150px', fontSize: '13px' }}
          value={dateRange?.start || ''} onChange={e => onDateChange?.({ ...dateRange, start: e.target.value })} />
        <span style={{ color: 'var(--text-muted)' }}>→</span>
        <input type="date" className="form-input" style={{ width: '150px', fontSize: '13px' }}
          value={dateRange?.end || ''} onChange={e => onDateChange?.({ ...dateRange, end: e.target.value })} />
      </div>
      {(dateRange?.start || dateRange?.end) && (
        <button className="btn btn-ghost btn-sm" onClick={() => onDateChange?.({ start: '', end: '' })}>
          Clear
        </button>
      )}
    </div>
  );
}

function EmptyChartState({ msg = 'Configure widget to show data' }) {
  return (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '13px', flexDirection: 'column', gap: '8px' }}>
      <span style={{ fontSize: '28px', opacity: 0.4 }}>📊</span>
      {msg}
    </div>
  );
}
