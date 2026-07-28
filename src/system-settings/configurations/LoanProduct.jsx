// src/components/LoanProduct.js
import React, { useState, useEffect } from 'react';
import LoanProductForm from './LoanProductForm';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL
  ? `${process.env.REACT_APP_API_URL}/api/configuration`
  : 'http://localhost:5002/api/configuration';

// ---------- Fallback fee list (used if API fails) ----------
const FALLBACK_FEES = [
  { id: 1, fee_name: 'Processing Fee', fee_type: 'Processing Fee', fee_trend: 'Standard' },
  { id: 2, fee_name: 'Setup Fee', fee_type: 'Setup', fee_trend: 'Tiered' },
  { id: 3, fee_name: 'Late Payment Fee', fee_type: 'Penalty', fee_trend: 'Increasing' },
  { id: 4, fee_name: 'Insurance Fee', fee_type: 'Insurance', fee_trend: 'Standard' },
  { id: 5, fee_name: 'Documentation Fee', fee_type: 'Documentation', fee_trend: 'Custom' },
  { id: 6, fee_name: 'Service Fee', fee_type: 'Service', fee_trend: 'Standard' },
  { id: 7, fee_name: 'Registration Fee', fee_type: 'Registration', fee_trend: 'Fixed' },
  { id: 8, fee_name: 'Penalty Fee', fee_type: 'Penalty', fee_trend: 'Tiered' },
];

const LoanProduct = () => {
  // ---------- State ----------
  const [products, setProducts] = useState([]);
  const [fees, setFees] = useState([]);
  const [feesLoading, setFeesLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ---------- Success Modal State ----------
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successModalMessage, setSuccessModalMessage] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // ---------- Form State (camelCase) ----------
  const [formData, setFormData] = useState({
    productName: '',
    loanType: '',
    assignToLoanTypes: '',
    creditReportCategory: '',
    loanRangeRequired: false,
    minAmount: '',
    maxAmount: '',
    allowMultipleAccounts: false,
    savingsBeforeEligibility: false,
    loanEligibilityAmountRequired: false,
    allowableDisposableIncome: '',
    interestType: '',
    minRate: '',
    defaultRate: '',
    maxRate: '',
    allowMoratorium: false,
    moratoriumDays: '',
    includeMoratoriumPeriod: false,
    loanTermDefault: '',
    durationMonths: '',
    repaymentCycleDefault: '',
    scheduleComputationDefault: '',
    applyTrunchDisbursement: false,
    selectedFees: [],
    chargePenaltyOverdue: false,
    chargePenaltyExpired: false,
    overduePenaltyRate: '',
    overduePenaltyComputeOn: '',
    overduePenaltyMoratorium: false,
    expiredPenaltyRate: '',
    expiredPenaltyComputeOn: '',
    expiredPenaltyMoratorium: false,
  });

  // ---------- Helper: snake_case → camelCase with JSON parse ----------
  const snakeToCamel = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    const result = {};
    for (const key in obj) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      let value = obj[key];
      if (typeof value === 'string' && value.startsWith('[') && value.endsWith(']')) {
        try {
          value = JSON.parse(value);
        } catch (e) {}
      }
      result[camelKey] = value;
    }
    return result;
  };

  const camelToSnake = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    const result = {};
    for (const key in obj) {
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      result[snakeKey] = obj[key];
    }
    return result;
  };

  // ---------- Helper: get fee names from fee IDs ----------
  const getFeeNames = (feeIds) => {
    if (!feeIds || !Array.isArray(feeIds)) return 'None';
    const feeList = fees.length ? fees : FALLBACK_FEES;
    const names = feeIds.map((id) => {
      const fee = feeList.find((f) => f.id === id);
      return fee ? (fee.fee_name || fee.name) : id;
    });
    return names.join(', ') || 'None';
  };

  // ---------- API Calls ----------
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE}/loan-product1`);
      const data = res.data.data.map(snakeToCamel);
      setProducts(data);
    } catch (err) {
      setError('Failed to load products. Please refresh.');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFees = async () => {
    setFeesLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/fees`);
      if (res.data.success && res.data.data.length) {
        setFees(res.data.data);
      } else {
        console.warn('No fees found or API failed, using fallback');
        setFees(FALLBACK_FEES);
      }
    } catch (err) {
      console.error('Error fetching fees:', err);
      setFees(FALLBACK_FEES);
    } finally {
      setFeesLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchFees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- Form Handlers ----------
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    let newValue = value;
    if (type === 'radio') {
      newValue = value === 'true';
    }
    setFormData((prev) => ({ ...prev, [name]: newValue }));
  };

  const resetForm = () => {
    setFormData({
      productName: '',
      loanType: '',
      assignToLoanTypes: '',
      creditReportCategory: '',
      loanRangeRequired: false,
      minAmount: '',
      maxAmount: '',
      allowMultipleAccounts: false,
      savingsBeforeEligibility: false,
      loanEligibilityAmountRequired: false,
      allowableDisposableIncome: '',
      interestType: '',
      minRate: '',
      defaultRate: '',
      maxRate: '',
      allowMoratorium: false,
      moratoriumDays: '',
      includeMoratoriumPeriod: false,
      loanTermDefault: '',
      durationMonths: '',
      repaymentCycleDefault: '',
      scheduleComputationDefault: '',
      applyTrunchDisbursement: false,
      selectedFees: [],
      chargePenaltyOverdue: false,
      chargePenaltyExpired: false,
      overduePenaltyRate: '',
      overduePenaltyComputeOn: '',
      overduePenaltyMoratorium: false,
      expiredPenaltyRate: '',
      expiredPenaltyComputeOn: '',
      expiredPenaltyMoratorium: false,
    });
    setEditingId(null);
    setShowForm(false);
  };

  // ---------- Handle Success Modal Close ----------
  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    resetForm(); // reset form and hide it
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = formData;

    try {
      let response;
      if (editingId) {
        response = await axios.put(`${API_BASE}/loan-products/${editingId}`, payload);
        setSuccessModalMessage('Loan product updated successfully!');
      } else {
        response = await axios.post(`${API_BASE}/loan-products`, payload);
        setSuccessModalMessage('Loan product created successfully!');
      }
      // Refresh product list
      await fetchProducts();
      // Show success modal
      setShowSuccessModal(true);
      // Do NOT reset form here – it will be reset when modal closes
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product. Please check your data.');
      console.error('Submit error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ---------- Edit / Details / Add New ----------
  const handleEdit = (product) => {
    setEditingId(product.id);
    setFormData({
      productName: product.productName || '',
      loanType: product.loanType || '',
      assignToLoanTypes: product.assignToLoanTypes || '',
      creditReportCategory: product.creditReportCategory || '',
      loanRangeRequired: product.loanRangeRequired ?? false,
      minAmount: product.minAmount || '',
      maxAmount: product.maxAmount || '',
      allowMultipleAccounts: product.allowMultipleAccounts ?? false,
      savingsBeforeEligibility: product.savingsBeforeEligibility ?? false,
      loanEligibilityAmountRequired: product.loanEligibilityAmountRequired ?? false,
      allowableDisposableIncome: product.allowableDisposableIncome || '',
      interestType: product.interestType || '',
      minRate: product.minRate || '',
      defaultRate: product.defaultRate || '',
      maxRate: product.maxRate || '',
      allowMoratorium: product.allowMoratorium ?? false,
      moratoriumDays: product.moratoriumDays || '',
      includeMoratoriumPeriod: product.includeMoratoriumPeriod ?? false,
      loanTermDefault: product.loanTermDefault || '',
      durationMonths: product.durationMonths || '',
      repaymentCycleDefault: product.repaymentCycleDefault || '',
      scheduleComputationDefault: product.scheduleComputationDefault || '',
      applyTrunchDisbursement: product.applyTrunchDisbursement ?? false,
      selectedFees: product.selectedFees || [],
      chargePenaltyOverdue: product.chargePenaltyOverdue ?? false,
      chargePenaltyExpired: product.chargePenaltyExpired ?? false,
      overduePenaltyRate: product.overduePenaltyRate || '',
      overduePenaltyComputeOn: product.overduePenaltyComputeOn || '',
      overduePenaltyMoratorium: product.overduePenaltyMoratorium ?? false,
      expiredPenaltyRate: product.expiredPenaltyRate || '',
      expiredPenaltyComputeOn: product.expiredPenaltyComputeOn || '',
      expiredPenaltyMoratorium: product.expiredPenaltyMoratorium ?? false,
    });
    setShowForm(true);
  };

  const handleDetails = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
  };

  const handleAddNew = () => {
    setEditingId(null);
    resetForm();
    setShowForm(true);
  };

  // ---------- Filtering ----------
  const filteredProducts = products.filter((product) => {
    const term = searchTerm.toLowerCase();
    const matchSearch =
      (product.productName?.toLowerCase() || '').includes(term) ||
      (product.productCode?.toLowerCase() || '').includes(term) ||
      (product.loanType?.toLowerCase() || '').includes(term) ||
      (product.interestType?.toLowerCase() || '').includes(term);
    const matchStatus =
      filterStatus === 'all' || product.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // ---------- Helper to compute display values for missing columns ----------
  const getDisplayValue = (product, field) => {
    switch (field) {
      case 'productCode':
        return product.productCode || `LP-${product.id}`;
      case 'productType':
        return product.productType || product.loanType || 'N/A';
      case 'interestRate':
        return product.interestRate ?? product.defaultRate ?? '—';
      case 'loanTerm':
        return product.loanTerm ?? product.durationMonths ?? '—';
      case 'status':
        return product.status || 'Active';
      default:
        return product[field] || '—';
    }
  };

  // ---------- Render ----------
  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>
          <i className="bi bi-puzzle me-2"></i>Loan Product Configuration
        </h4>
        <small className="text-muted">
          Manage loan product settings, interest types, terms, etc.
        </small>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)} />
        </div>
      )}

      {/* Add New Button */}
      {!showForm && (
        <div className="mb-3">
          <button className="btn btn-primary" onClick={handleAddNew} disabled={loading}>
            <i className="bi bi-plus-circle me-1"></i> Add New Loan Product
          </button>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <LoanProductForm
          formData={formData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          onCancel={resetForm}
          isEditing={!!editingId}
          loading={loading}
          fees={fees}
          feesLoading={feesLoading}
        />
      )}

      {/* Search & Filter */}
      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold">Search Products</label>
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by name, code, type or interest"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <label className="form-label fw-semibold">Filter Status</label>
              <select
                className="form-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="col-md-3 d-flex align-items-end">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                }}
              >
                <i className="bi bi-arrow-clockwise me-2"></i>Reset Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card shadow-sm">
        <div className="card-header bg-white">
          <h6 className="mb-0">
            Loan Products List
            {loading && <span className="ms-2 spinner-border spinner-border-sm" />}
          </h6>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Product Name</th>
                  <th>Code</th>
                  <th>Type</th>
                  <th>Interest</th>
                  <th>Rate</th>
                  <th>Term (mo)</th>
                  <th>Status</th>
                  <th>Fees</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="text-center text-muted py-3">
                      {loading ? 'Loading...' : 'No loan products match your criteria.'}
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product, index) => (
                    <tr key={product.id}>
                      <td>{index + 1}</td>
                      <td>{product.productName}</td>
                      <td>{getDisplayValue(product, 'productCode')}</td>
                      <td>{getDisplayValue(product, 'productType')}</td>
                      <td>{product.interestType}</td>
                      <td>{getDisplayValue(product, 'interestRate')}%</td>
                      <td>{getDisplayValue(product, 'loanTerm')}</td>
                      <td>
                        <span
                          className={`badge ${
                            getDisplayValue(product, 'status') === 'Active'
                              ? 'bg-success'
                              : 'bg-secondary'
                          }`}
                        >
                          {getDisplayValue(product, 'status')}
                        </span>
                      </td>
                      <td>{getFeeNames(product.selectedFees)}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary me-1"
                          onClick={() => handleEdit(product)}
                          disabled={loading}
                        >
                          <i className="bi bi-pencil"></i> Edit
                        </button>
                        <button
                          className="btn btn-sm btn-outline-info"
                          onClick={() => handleDetails(product)}
                        >
                          <i className="bi bi-eye"></i> Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {selectedProduct && (
        <div
          className={`modal fade ${showModal ? 'show d-block' : ''}`}
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Loan Product Details</h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-6"><strong>Product Name:</strong></div>
                  <div className="col-6">{selectedProduct.productName}</div>

                  <div className="col-6"><strong>Product Code:</strong></div>
                  <div className="col-6">{getDisplayValue(selectedProduct, 'productCode')}</div>

                  <div className="col-6"><strong>Product Type:</strong></div>
                  <div className="col-6">{getDisplayValue(selectedProduct, 'productType')}</div>

                  <div className="col-6"><strong>Interest Type:</strong></div>
                  <div className="col-6">{selectedProduct.interestType}</div>

                  <div className="col-6"><strong>Interest Rate:</strong></div>
                  <div className="col-6">{getDisplayValue(selectedProduct, 'interestRate')}%</div>

                  <div className="col-6"><strong>Loan Term (months):</strong></div>
                  <div className="col-6">{getDisplayValue(selectedProduct, 'loanTerm')}</div>

                  <div className="col-6"><strong>Repayment Frequency:</strong></div>
                  <div className="col-6">{selectedProduct.repaymentCycleDefault || 'N/A'}</div>

                  <div className="col-6"><strong>Selected Fees:</strong></div>
                  <div className="col-6">{getFeeNames(selectedProduct.selectedFees)}</div>

                  <div className="col-6"><strong>Status:</strong></div>
                  <div className="col-6">
                    <span
                      className={`badge ${
                        getDisplayValue(selectedProduct, 'status') === 'Active'
                          ? 'bg-success'
                          : 'bg-secondary'
                      }`}
                    >
                      {getDisplayValue(selectedProduct, 'status')}
                    </span>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------- SUCCESS MODAL ---------- */}
      <div
        className={`modal fade ${showSuccessModal ? 'show d-block' : ''}`}
        tabIndex="-1"
        role="dialog"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        onClick={(e) => {
          // Prevent closing on backdrop click – only close via OK button
          e.stopPropagation();
        }}
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title text-success">
                <i className="bi bi-check-circle-fill me-2"></i>Success
              </h5>
              {/* No close button – user must click OK */}
            </div>
            <div className="modal-body">
              <p className="mb-0">{successModalMessage}</p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-success"
                onClick={handleSuccessModalClose}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanProduct;