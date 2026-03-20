import React, { useState, useEffect } from 'react';
import { COUNTRIES, PRODUCTS, ORDER_STATUSES, CREATED_BY_OPTIONS } from '../../utils/constants';

const INITIAL = {
  firstName: '', lastName: '', emailId: '', phoneNumber: '',
  streetAddress: '', city: '', stateProvince: '', postalCode: '',
  country: '', product: '', quantity: 1, unitPrice: '',
  status: 'Pending', createdBy: '',
};

const REQUIRED = [
  'firstName','lastName','emailId','phoneNumber','streetAddress',
  'city','stateProvince','postalCode','country','product',
  'quantity','unitPrice','status','createdBy'
];

// ✅ MUST be outside OrderForm — defining a component inside another
// causes React to unmount/remount it on every render, losing focus after 1 char
function F({ label, name, required, children, full, errors }) {
  return (
    <div className="form-group" style={full ? { gridColumn: '1/-1' } : {}}>
      <label className="form-label">
        {label}{required && <span className="required">*</span>}
      </label>
      {children}
      {errors[name] && <div className="error-msg">{errors[name]}</div>}
    </div>
  );
}

export default function OrderForm({ order, onClose, onSave }) {
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (order) {
      setForm({
        firstName: order.firstName || '',
        lastName: order.lastName || '',
        emailId: order.emailId || '',
        phoneNumber: order.phoneNumber || '',
        streetAddress: order.streetAddress || '',
        city: order.city || '',
        stateProvince: order.stateProvince || '',
        postalCode: order.postalCode || '',
        country: order.country || '',
        product: order.product || '',
        quantity: order.quantity || 1,
        unitPrice: order.unitPrice || '',
        status: order.status || 'Pending',
        createdBy: order.createdBy || '',
      });
    }
  }, [order]);

  const totalAmount = (Number(form.quantity) * Number(form.unitPrice)) || 0;

  const set = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const errs = {};
    REQUIRED.forEach(f => {
      if (!form[f] && form[f] !== 0) errs[f] = 'Please fill the field';
    });
    if (Number(form.quantity) < 1) errs.quantity = 'Minimum quantity is 1';
    return errs;
  };

  const handleSubmit = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    onSave({ ...form, totalAmount, quantity: Number(form.quantity), unitPrice: Number(form.unitPrice) });
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 720 }}>
        <div className="modal-header">
          <div className="modal-title">{order ? 'Edit Order' : 'Create Order'}</div>
          <button className="btn btn-icon btn-ghost" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {/* Customer Info */}
          <div className="form-section">
            <div className="form-section-title">Customer Information</div>
            <div className="form-grid-2">
              <F label="First Name" name="firstName" required errors={errors}>
                <input className={`form-input${errors.firstName?' error':''}`} value={form.firstName} onChange={e=>set('firstName',e.target.value)} placeholder="John" />
              </F>
              <F label="Last Name" name="lastName" required errors={errors}>
                <input className={`form-input${errors.lastName?' error':''}`} value={form.lastName} onChange={e=>set('lastName',e.target.value)} placeholder="Doe" />
              </F>
              <F label="Email ID" name="emailId" required errors={errors}>
                <input className={`form-input${errors.emailId?' error':''}`} value={form.emailId} onChange={e=>set('emailId',e.target.value)} placeholder="john@example.com" />
              </F>
              <F label="Phone Number" name="phoneNumber" required errors={errors}>
                <input className={`form-input${errors.phoneNumber?' error':''}`} value={form.phoneNumber} onChange={e=>set('phoneNumber',e.target.value)} placeholder="+1 555 000 0000" />
              </F>
              <F label="Street Address" name="streetAddress" required full errors={errors}>
                <input className={`form-input${errors.streetAddress?' error':''}`} value={form.streetAddress} onChange={e=>set('streetAddress',e.target.value)} placeholder="123 Main St" />
              </F>
              <F label="City" name="city" required errors={errors}>
                <input className={`form-input${errors.city?' error':''}`} value={form.city} onChange={e=>set('city',e.target.value)} placeholder="New York" />
              </F>
              <F label="State / Province" name="stateProvince" required errors={errors}>
                <input className={`form-input${errors.stateProvince?' error':''}`} value={form.stateProvince} onChange={e=>set('stateProvince',e.target.value)} placeholder="NY" />
              </F>
              <F label="Postal Code" name="postalCode" required errors={errors}>
                <input className={`form-input${errors.postalCode?' error':''}`} value={form.postalCode} onChange={e=>set('postalCode',e.target.value)} placeholder="10001" />
              </F>
              <F label="Country" name="country" required errors={errors}>
                <select className={`form-select${errors.country?' error':''}`} value={form.country} onChange={e=>set('country',e.target.value)}>
                  <option value="">Select country</option>
                  {COUNTRIES.map(c=><option key={c}>{c}</option>)}
                </select>
              </F>
            </div>
          </div>

          {/* Order Info */}
          <div className="form-section">
            <div className="form-section-title">Order Information</div>
            <div className="form-grid-2">
              <F label="Choose Product" name="product" required full errors={errors}>
                <select className={`form-select${errors.product?' error':''}`} value={form.product} onChange={e=>set('product',e.target.value)}>
                  <option value="">Select product</option>
                  {PRODUCTS.map(p=><option key={p}>{p}</option>)}
                </select>
              </F>
              <F label="Quantity" name="quantity" required errors={errors}>
                <div className="number-input-wrap">
                  <button type="button" className="stepper-btn left" onClick={()=>set('quantity',Math.max(1,Number(form.quantity)-1))}>−</button>
                  <input
                    type="number" className={`form-input${errors.quantity?' error':''}`}
                    value={form.quantity} min={1}
                    onChange={e=>set('quantity',Math.max(1,Number(e.target.value)))}
                    style={{textAlign:'center'}}
                  />
                  <button type="button" className="stepper-btn right" onClick={()=>set('quantity',Number(form.quantity)+1)}>+</button>
                </div>
              </F>
              <F label="Unit Price" name="unitPrice" required errors={errors}>
                <div className="currency-wrap">
                  <span className="prefix">$</span>
                  <input type="number" className={`form-input${errors.unitPrice?' error':''}`} value={form.unitPrice} onChange={e=>set('unitPrice',e.target.value)} placeholder="0.00" min={0} step="0.01" style={{paddingLeft:24}} />
                </div>
              </F>
              <F label="Total Amount" name="totalAmount" errors={errors}>
                <div className="readonly-field">$ {totalAmount.toFixed(2)}</div>
              </F>
              <F label="Status" name="status" required errors={errors}>
                <select className={`form-select${errors.status?' error':''}`} value={form.status} onChange={e=>set('status',e.target.value)}>
                  {ORDER_STATUSES.map(s=><option key={s}>{s}</option>)}
                </select>
              </F>
              <F label="Created By" name="createdBy" required errors={errors}>
                <select className={`form-select${errors.createdBy?' error':''}`} value={form.createdBy} onChange={e=>set('createdBy',e.target.value)}>
                  <option value="">Select person</option>
                  {CREATED_BY_OPTIONS.map(c=><option key={c}>{c}</option>)}
                </select>
              </F>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            {order ? 'Save Changes' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
}
