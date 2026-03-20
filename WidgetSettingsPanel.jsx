import React, { useState, useEffect } from 'react';
import {
  KPI_METRICS, NUMERIC_METRICS, AGGREGATIONS, DATA_FORMATS,
  CHART_AXES, PIE_DATA_OPTIONS, TABLE_COLUMNS, SORT_OPTIONS, PAGE_SIZE_OPTIONS
} from '../../utils/constants';

export default function WidgetSettingsPanel({ widget, onClose, onSave }) {
  const [cfg, setCfg] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!widget) return;
    const defaults = getDefaults(widget.type);
    setCfg({ ...defaults, ...widget, ...widget.config,
      title: widget.title || 'Untitled',
      description: widget.description || '',
      width: widget.size?.width ?? defaults.width,
      height: widget.size?.height ?? defaults.height,
    });
  }, [widget]);

  const getDefaults = (type) => {
    switch (type) {
      case 'kpi': return { width: 2, height: 2, metric: '', aggregation: 'Count', dataFormat: 'Number', decimalPrecision: 0 };
      case 'bar-chart': case 'line-chart': case 'area-chart': case 'scatter-plot':
        return { width: 5, height: 5, xAxis: '', yAxis: '', chartColor: '#54bd95', showDataLabel: false };
      case 'pie-chart': return { width: 4, height: 4, chartData: '', showLegend: false };
      case 'table': return { width: 4, height: 4, columns: [], sortBy: '', pagination: '', applyFilter: false, filters: [], fontSize: 14, headerBg: '#54bd95' };
      default: return { width: 4, height: 2 };
    }
  };

  const set = (k, v) => {
    setCfg(p => ({ ...p, [k]: v }));
    if (errors[k]) setErrors(p => ({ ...p, [k]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!cfg.title) errs.title = 'Please fill the field';
    if (!cfg.width || cfg.width < 1) errs.width = 'Min 1';
    if (!cfg.height || cfg.height < 1) errs.height = 'Min 1';
    if (widget.type === 'kpi' && !cfg.metric) errs.metric = 'Please fill the field';
    if (['bar-chart','line-chart','area-chart','scatter-plot'].includes(widget.type)) {
      if (!cfg.xAxis) errs.xAxis = 'Please fill the field';
      if (!cfg.yAxis) errs.yAxis = 'Please fill the field';
    }
    if (widget.type === 'pie-chart' && !cfg.chartData) errs.chartData = 'Please fill the field';
    if (widget.type === 'table' && (!cfg.columns || cfg.columns.length === 0)) errs.columns = 'Select at least one column';
    return errs;
  };

  const handleSave = () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const updated = {
      ...widget,
      title: cfg.title,
      description: cfg.description,
      size: { width: Number(cfg.width), height: Number(cfg.height) },
      config: { ...cfg, title: undefined, description: undefined, width: undefined, height: undefined },
    };
    onSave(updated);
  };

  const isNumeric = NUMERIC_METRICS.includes(cfg.metric);
  const typeLabel = {
    'kpi': 'KPI', 'bar-chart': 'Bar chart', 'line-chart': 'Line chart',
    'area-chart': 'Area chart', 'scatter-plot': 'Scatter plot chart', 'pie-chart': 'Pie chart',
    'table': 'Table', 'date-filter': 'Date Filter',
  }[widget?.type] || '';

  const isChart = ['bar-chart','line-chart','area-chart','scatter-plot'].includes(widget?.type);

  const toggleColumn = (col) => {
    const cols = cfg.columns || [];
    set('columns', cols.includes(col) ? cols.filter(c => c !== col) : [...cols, col]);
  };

  const addFilter = () => {
    const filters = cfg.filters || [];
    set('filters', [...filters, { field: '', operator: 'equals', value: '' }]);
  };

  const updateFilter = (i, k, v) => {
    const filters = [...(cfg.filters || [])];
    filters[i] = { ...filters[i], [k]: v };
    set('filters', filters);
  };

  const removeFilter = (i) => {
    const filters = [...(cfg.filters || [])];
    filters.splice(i, 1);
    set('filters', filters);
  };

  return (
    <div style={{
      position: 'fixed', right: 0, top: 0, bottom: 0,
      width: '360px', background: 'var(--bg-card)',
      borderLeft: '1px solid var(--border-light)',
      boxShadow: '-8px 0 30px rgba(0,0,0,0.4)',
      zIndex: 800, display: 'flex', flexDirection: 'column',
      animation: 'slideInRight 0.25s ease',
    }}>
      <style>{`@keyframes slideInRight{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>
      <div className="modal-header">
        <div className="modal-title">Widget Settings</div>
        <button className="btn btn-icon btn-ghost" onClick={onClose}>✕</button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        {/* Title / Type */}
        <div className="form-section">
          <div className="form-section-title">Widget Info</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Widget Title <span className="required">*</span></label>
              <input className={`form-input${errors.title?' error':''}`} value={cfg.title||''} onChange={e=>set('title',e.target.value)} />
              {errors.title && <div className="error-msg">{errors.title}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Widget Type</label>
              <div className="readonly-field">{typeLabel}</div>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" value={cfg.description||''} onChange={e=>set('description',e.target.value)} rows={2} />
            </div>
          </div>
        </div>

        {/* Size */}
        <div className="form-section">
          <div className="form-section-title">Widget Size</div>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Width (Columns) <span className="required">*</span></label>
              <input type="number" className={`form-input${errors.width?' error':''}`} value={cfg.width||''} min={1} onChange={e=>set('width',Math.max(1,Number(e.target.value)))} />
              {errors.width && <div className="error-msg">{errors.width}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Height (Rows) <span className="required">*</span></label>
              <input type="number" className={`form-input${errors.height?' error':''}`} value={cfg.height||''} min={1} onChange={e=>set('height',Math.max(1,Number(e.target.value)))} />
              {errors.height && <div className="error-msg">{errors.height}</div>}
            </div>
          </div>
        </div>

        {/* KPI Data Settings */}
        {widget.type === 'kpi' && (
          <div className="form-section">
            <div className="form-section-title">Data Setting</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Select Metric <span className="required">*</span></label>
                <select className={`form-select${errors.metric?' error':''}`} value={cfg.metric||''} onChange={e=>set('metric',e.target.value)}>
                  <option value="">Select metric</option>
                  {KPI_METRICS.map(m=><option key={m}>{m}</option>)}
                </select>
                {errors.metric && <div className="error-msg">{errors.metric}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Aggregation <span className="required">*</span></label>
                <select className="form-select" value={cfg.aggregation||'Count'} onChange={e=>set('aggregation',e.target.value)} disabled={!isNumeric && cfg.aggregation !== 'Count'}>
                  {AGGREGATIONS.map(a=><option key={a} disabled={a!=='Count'&&!isNumeric}>{a}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Data Format <span className="required">*</span></label>
                <select className="form-select" value={cfg.dataFormat||'Number'} onChange={e=>set('dataFormat',e.target.value)}>
                  {DATA_FORMATS.map(f=><option key={f}>{f}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Decimal Precision <span className="required">*</span></label>
                <input type="number" className="form-input" value={cfg.decimalPrecision??0} min={0} onChange={e=>set('decimalPrecision',Math.max(0,Number(e.target.value)))} />
              </div>
            </div>
          </div>
        )}

        {/* Chart Data Settings */}
        {isChart && (
          <>
            <div className="form-section">
              <div className="form-section-title">Data Setting</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Choose X-Axis Data <span className="required">*</span></label>
                  <select className={`form-select${errors.xAxis?' error':''}`} value={cfg.xAxis||''} onChange={e=>set('xAxis',e.target.value)}>
                    <option value="">Select X axis</option>
                    {CHART_AXES.map(a=><option key={a}>{a}</option>)}
                  </select>
                  {errors.xAxis && <div className="error-msg">{errors.xAxis}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Choose Y-Axis Data <span className="required">*</span></label>
                  <select className={`form-select${errors.yAxis?' error':''}`} value={cfg.yAxis||''} onChange={e=>set('yAxis',e.target.value)}>
                    <option value="">Select Y axis</option>
                    {CHART_AXES.map(a=><option key={a}>{a}</option>)}
                  </select>
                  {errors.yAxis && <div className="error-msg">{errors.yAxis}</div>}
                </div>
              </div>
            </div>
            <div className="form-section">
              <div className="form-section-title">Styling</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Chart Color</label>
                  <div className="color-picker-wrap">
                    <div className="color-swatch">
                      <input type="color" value={cfg.chartColor||'#54bd95'} onChange={e=>set('chartColor',e.target.value)} />
                    </div>
                    <input className="form-input" value={cfg.chartColor||'#54bd95'} onChange={e=>set('chartColor',e.target.value)} style={{fontFamily:'var(--font-mono)',fontSize:'13px'}} />
                  </div>
                </div>
                <label className="checkbox-wrap">
                  <input type="checkbox" checked={cfg.showDataLabel||false} onChange={e=>set('showDataLabel',e.target.checked)} />
                  <span className="checkbox-label">Show Data Label</span>
                </label>
              </div>
            </div>
          </>
        )}

        {/* Pie chart */}
        {widget.type === 'pie-chart' && (
          <div className="form-section">
            <div className="form-section-title">Data Setting</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Choose Chart Data <span className="required">*</span></label>
                <select className={`form-select${errors.chartData?' error':''}`} value={cfg.chartData||''} onChange={e=>set('chartData',e.target.value)}>
                  <option value="">Select data</option>
                  {PIE_DATA_OPTIONS.map(o=><option key={o}>{o}</option>)}
                </select>
                {errors.chartData && <div className="error-msg">{errors.chartData}</div>}
              </div>
              <label className="checkbox-wrap">
                <input type="checkbox" checked={cfg.showLegend||false} onChange={e=>set('showLegend',e.target.checked)} />
                <span className="checkbox-label">Show Legend</span>
              </label>
            </div>
          </div>
        )}

        {/* Table */}
        {widget.type === 'table' && (
          <>
            <div className="form-section">
              <div className="form-section-title">Data Setting</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Choose Columns <span className="required">*</span></label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: 'var(--bg-secondary)', border: `1px solid ${errors.columns?'var(--danger)':'var(--border)'}`, borderRadius: 'var(--radius-sm)', padding: '10px', maxHeight: '180px', overflowY: 'auto' }}>
                    {TABLE_COLUMNS.map(col => (
                      <label key={col} className="checkbox-wrap">
                        <input type="checkbox" checked={(cfg.columns||[]).includes(col)} onChange={()=>toggleColumn(col)} />
                        <span className="checkbox-label">{col}</span>
                      </label>
                    ))}
                  </div>
                  {errors.columns && <div className="error-msg">{errors.columns}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Sort By</label>
                  <select className="form-select" value={cfg.sortBy||''} onChange={e=>set('sortBy',e.target.value)}>
                    <option value="">None</option>
                    {SORT_OPTIONS.map(s=><option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Pagination</label>
                  <select className="form-select" value={cfg.pagination||''} onChange={e=>set('pagination',e.target.value)}>
                    <option value="">None</option>
                    {PAGE_SIZE_OPTIONS.map(p=><option key={p}>{p}</option>)}
                  </select>
                </div>
                <label className="checkbox-wrap">
                  <input type="checkbox" checked={cfg.applyFilter||false} onChange={e=>set('applyFilter',e.target.checked)} />
                  <span className="checkbox-label">Apply Filter</span>
                </label>
                {cfg.applyFilter && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(cfg.filters||[]).map((f, i) => (
                      <div key={i} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <select className="form-select" style={{ flex: 1 }} value={f.field} onChange={e=>updateFilter(i,'field',e.target.value)}>
                          <option value="">Field</option>
                          {TABLE_COLUMNS.map(c=><option key={c}>{c}</option>)}
                        </select>
                        <select className="form-select" style={{ width: '90px' }} value={f.operator} onChange={e=>updateFilter(i,'operator',e.target.value)}>
                          <option value="equals">Equals</option>
                          <option value="contains">Contains</option>
                          <option value="gt">{'>'}</option>
                          <option value="lt">{'<'}</option>
                        </select>
                        <input className="form-input" style={{ flex: 1 }} value={f.value} onChange={e=>updateFilter(i,'value',e.target.value)} placeholder="Value" />
                        <button className="btn btn-icon btn-danger" onClick={()=>removeFilter(i)}>✕</button>
                      </div>
                    ))}
                    <button className="btn btn-ghost btn-sm" onClick={addFilter}>+ Add Filter</button>
                  </div>
                )}
              </div>
            </div>
            <div className="form-section">
              <div className="form-section-title">Styling</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Font Size (12–18)</label>
                  <input type="number" className="form-input" value={cfg.fontSize||14} min={12} max={18} onChange={e=>set('fontSize',Math.min(18,Math.max(12,Number(e.target.value))))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Header Background</label>
                  <div className="color-picker-wrap">
                    <div className="color-swatch">
                      <input type="color" value={cfg.headerBg||'#54bd95'} onChange={e=>set('headerBg',e.target.value)} />
                    </div>
                    <input className="form-input" value={cfg.headerBg||'#54bd95'} onChange={e=>set('headerBg',e.target.value)} style={{fontFamily:'var(--font-mono)',fontSize:'13px'}} />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      <div className="modal-footer">
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSave}>Apply Settings</button>
      </div>
    </div>
  );
}
