import React from "react";
import { Modal, Button, Form } from "react-bootstrap";

const FeeModal = ({
  show,
  onClose,
  onSubmit,
  editingFee,
  formData,
  handleFormChange,
  viewMode,
  ledgers = [],
}) => {
  const isEditing = !!editingFee;

  return (
    <Modal show={show} onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {viewMode
            ? "View Fee"
            : isEditing
            ? "Edit Fee"
            : "Add New Fee"}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={onSubmit}>
        <Modal.Body>
          <div className="row g-3">
            {/* Fee Name */}
            <div className="col-md-6">
              <Form.Label>Fee Name</Form.Label>
              <Form.Control
                type="text"
                name="feeName"
                value={formData.feeName}
                onChange={handleFormChange}
                disabled={viewMode}
                required
              />
            </div>

            {/* Fee Type */}
            <div className="col-md-6">
              <Form.Label>Fee Type</Form.Label>
              <Form.Select
                name="feeType"
                value={formData.feeType}
                onChange={handleFormChange}
                disabled={viewMode}
              >
                <option value="Processing Fee">Processing Fee</option>
                <option value="Insurance Fee">Insurance Fee</option>
                <option value="Registration Fee">Registration Fee</option>
                <option value="Other">Other</option>
              </Form.Select>
            </div>

            {/* Fee Trend */}
            <div className="col-md-6">
              <Form.Label>Fee Trend</Form.Label>
              <Form.Select
                name="feeTrend"
                value={formData.feeTrend}
                onChange={handleFormChange}
                disabled={viewMode}
              >
                <option value="Standard">Standard</option>
                <option value="Tiered">Tiered</option>
                <option value="Custom">Custom</option>
              </Form.Select>
            </div>

            {/* Payment Mode */}
            <div className="col-md-6">
              <Form.Label>Payment Mode</Form.Label>
              <Form.Select
                name="paymentMode"
                value={formData.paymentMode}
                onChange={handleFormChange}
                disabled={viewMode}
              >
                <option value="Upfront">Upfront</option>
              </Form.Select>
            </div>

            {/* Status */}
            <div className="col-md-6">
              <Form.Label>Status</Form.Label>
              <Form.Select
                name="status"
                value={formData.status}
                onChange={handleFormChange}
                disabled={viewMode}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </Form.Select>
            </div>

            {/* Fee Amount Details (grouped) */}
            <div className="col-12">
              <div className="p-3 bg-light rounded-3 border">
                <h6 className="fw-bold text-secondary mb-3">
                  <i className="bi bi-calculator me-2"></i>
                  Fee Amount Details
                </h6>
                <div className="row g-3">
                  <div className="col-md-6">
                    <Form.Label>Fee Calculation</Form.Label>
                    <div className="d-flex gap-4">
                      <Form.Check
                        inline
                        label="Percentage (%)"
                        type="radio"
                        name="feeValueType"
                        value="percentage"
                        checked={formData.feeValueType === "percentage"}
                        onChange={handleFormChange}
                        disabled={viewMode}
                      />
                      <Form.Check
                        inline
                        label="Fixed (GHS)"
                        type="radio"
                        name="feeValueType"
                        value="fixed"
                        checked={formData.feeValueType === "fixed"}
                        onChange={handleFormChange}
                        disabled={viewMode}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <Form.Label>
                      {formData.feeValueType === "percentage"
                        ? "Percentage (%)"
                        : "Amount (GHS)"}
                    </Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      name="feeAmount"
                      value={formData.feeAmount}
                      onChange={handleFormChange}
                      disabled={viewMode}
                      required
                      placeholder={
                        formData.feeValueType === "percentage"
                          ? "e.g., 5"
                          : "e.g., 150.00"
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Allow Edit at Disbursement – Yes/No */}
            <div className="col-md-6">
              <Form.Label>Allow Edit at Disbursement</Form.Label>
              <div className="d-flex gap-4">
                <Form.Check
                  inline
                  label="Yes"
                  type="radio"
                  name="allowEditAtDisbursement"
                  value="true"
                  checked={formData.allowEditAtDisbursement === true}
                  onChange={handleFormChange}
                  disabled={viewMode}
                />
                <Form.Check
                  inline
                  label="No"
                  type="radio"
                  name="allowEditAtDisbursement"
                  value="false"
                  checked={formData.allowEditAtDisbursement === false}
                  onChange={handleFormChange}
                  disabled={viewMode}
                />
              </div>
            </div>

            {/* Alert Management on Edit – Yes/No */}
            <div className="col-md-6">
              <Form.Label>Alert Management on Edit</Form.Label>
              <div className="d-flex gap-4">
                <Form.Check
                  inline
                  label="Yes"
                  type="radio"
                  name="alertManagementOnEdit"
                  value="true"
                  checked={formData.alertManagementOnEdit === true}
                  onChange={handleFormChange}
                  disabled={viewMode}
                />
                <Form.Check
                  inline
                  label="No"
                  type="radio"
                  name="alertManagementOnEdit"
                  value="false"
                  checked={formData.alertManagementOnEdit === false}
                  onChange={handleFormChange}
                  disabled={viewMode}
                />
              </div>
            </div>

            {/* --- LINK GENERAL LEDGERS – optional now --- */}
            <div className="col-12">
              <div className="p-3 bg-light rounded-3 border">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold text-secondary mb-0">
                    <i className="bi bi-link-45deg me-2"></i>
                    LINK GENERAL LEDGERS
                  </h6>
                </div>
                <div className="row g-3">
                  <div className="col-md-12">
                    <Form.Label>Loan Fees Income Ledger</Form.Label>
                    <Form.Select
                      name="generalLedgerId"
                      value={formData.generalLedgerId}
                      onChange={handleFormChange}
                      disabled={viewMode}
                      // removed 'required' – now optional
                    >
                      <option value="">Select Ledger (optional)</option>
                      {ledgers.map((ledger) => (
                        <option key={ledger.id} value={ledger.id}>
                          {ledger.name}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Text className="text-muted">
                      Select the income account to which this fee will be posted (optional).
                    </Form.Text>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            {viewMode ? "Close" : isEditing ? "Update Fee" : "Add Fee"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default FeeModal;