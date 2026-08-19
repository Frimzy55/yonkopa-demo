import React, { useState } from "react";

const Step8LoanHistory = ({
  formData,
  onChange,
  isMobile,
  inputStyle,
  textareaStyle,
  focusStyle,
  blurStyle,
  onBack,
}) => {
  // State for modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRowIndex, setEditingRowIndex] = useState(null);
  const [editingRowData, setEditingRowData] = useState(null);

  // Helper to add a new empty loan row
  const addLoanRow = () => {
    const newLoan = {
      date: "",
      institution: "",
      principalAmount: "",
      installmentAmount: "",
      currentBalance: "",
      expiryDate: "",
    };
    const updatedLoans = [...(formData.loans || []), newLoan];
    onChange({
      target: {
        name: "loans",
        value: updatedLoans,
      },
    });
  };

  // Helper to remove a row by index
  const removeLoanRow = (index) => {
    const updatedLoans = (formData.loans || []).filter((_, i) => i !== index);
    onChange({
      target: {
        name: "loans",
        value: updatedLoans,
      },
    });
  };

  // Helper to update a specific field in a specific row (direct, used for table inputs)
  const handleLoanChange = (index, field, value) => {
    const updatedLoans = [...(formData.loans || [])];
    updatedLoans[index] = { ...updatedLoans[index], [field]: value };
    onChange({
      target: {
        name: "loans",
        value: updatedLoans,
      },
    });
  };

  // Modal handlers
  const openModal = (index) => {
    const row = (formData.loans || [])[index];
    if (row) {
      setEditingRowIndex(index);
      setEditingRowData({ ...row });
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRowIndex(null);
    setEditingRowData(null);
  };

  const saveRowChanges = () => {
    if (editingRowIndex !== null && editingRowData) {
      const updatedLoans = [...(formData.loans || [])];
      updatedLoans[editingRowIndex] = { ...editingRowData };
      onChange({
        target: {
          name: "loans",
          value: updatedLoans,
        },
      });
    }
    closeModal();
  };

  const handleModalFieldChange = (field, value) => {
    setEditingRowData((prev) => ({ ...prev, [field]: value }));
  };

  const hasPreviousLoan = formData.hasPreviousLoan === "yes";
  const loans = formData.loans || [];

  return (
    <>
      <h3
        style={{
          fontSize: "18px",
          fontWeight: "600",
          color: "#1e293b",
          marginTop: "0",
          marginBottom: "20px",
          paddingBottom: "8px",
          borderBottom: "2px solid #e2e8f0",
        }}
      >
        Loan History
      </h3>

      <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "20px" }}>
        Please provide details about any previous loans you have taken.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: "16px",
          marginBottom: "20px",
        }}
      >
        <div>
          <label
            style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "500",
              color: "#334155",
              marginBottom: "4px",
            }}
          >
            Have you taken any loan before? <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <select
            name="hasPreviousLoan"
            value={formData.hasPreviousLoan || ""}
            onChange={onChange}
            required
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              fontSize: "14px",
              outline: "none",
              background: "#fff",
              boxSizing: "border-box",
            }}
            onFocus={focusStyle}
            onBlur={blurStyle}
          >
            <option value="">Select</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
      </div>

      {hasPreviousLoan && (
        <div style={{ marginTop: "20px" }}>
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "14px",
                minWidth: "700px",
              }}
            >
              <thead>
                <tr style={{ background: "#f1f5f9" }}>
                  <th style={{ padding: "10px 8px", border: "1px solid #e2e8f0", textAlign: "left" }}>S/N</th>
                  <th style={{ padding: "10px 8px", border: "1px solid #e2e8f0", textAlign: "left" }}>Date</th>
                  <th style={{ padding: "10px 8px", border: "1px solid #e2e8f0", textAlign: "left" }}>Institution</th>
                  <th style={{ padding: "10px 8px", border: "1px solid #e2e8f0", textAlign: "left" }}>Principal Amount</th>
                  <th style={{ padding: "10px 8px", border: "1px solid #e2e8f0", textAlign: "left" }}>Installment Amount</th>
                  <th style={{ padding: "10px 8px", border: "1px solid #e2e8f0", textAlign: "left" }}>Current Balance / Arrears</th>
                  <th style={{ padding: "10px 8px", border: "1px solid #e2e8f0", textAlign: "left" }}>Expiry Date</th>
                  <th style={{ padding: "10px 8px", border: "1px solid #e2e8f0", textAlign: "center" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {loans.map((loan, index) => (
                  <tr key={index}>
                    <td style={{ padding: "8px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                      {index + 1}
                    </td>
                    <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                      <input
                        type="date"
                        value={loan.date || ""}
                        readOnly={isMobile} // prevent keyboard on mobile
                        onClick={isMobile ? () => openModal(index) : undefined}
                        onChange={(e) => handleLoanChange(index, "date", e.target.value)}
                        style={{
                          width: "100%",
                          padding: "6px 8px",
                          border: "1px solid #e2e8f0",
                          borderRadius: "6px",
                          fontSize: "13px",
                          outline: "none",
                          boxSizing: "border-box",
                          background: isMobile ? "#f8fafc" : "#fff",
                          cursor: isMobile ? "pointer" : "default",
                        }}
                        onFocus={focusStyle}
                        onBlur={blurStyle}
                      />
                    </td>
                    <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                      <input
                        type="text"
                        value={loan.institution || ""}
                        readOnly={isMobile}
                        onClick={isMobile ? () => openModal(index) : undefined}
                        onChange={(e) => handleLoanChange(index, "institution", e.target.value)}
                        placeholder="e.g., Bank ABC"
                        style={{
                          width: "100%",
                          padding: "6px 8px",
                          border: "1px solid #e2e8f0",
                          borderRadius: "6px",
                          fontSize: "13px",
                          outline: "none",
                          boxSizing: "border-box",
                          background: isMobile ? "#f8fafc" : "#fff",
                          cursor: isMobile ? "pointer" : "default",
                        }}
                        onFocus={focusStyle}
                        onBlur={blurStyle}
                      />
                    </td>
                    <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                      <input
                        type="text"
                        value={loan.principalAmount || ""}
                        readOnly={isMobile}
                        onClick={isMobile ? () => openModal(index) : undefined}
                        onChange={(e) => handleLoanChange(index, "principalAmount", e.target.value)}
                        placeholder="e.g., 10000"
                        style={{
                          width: "100%",
                          padding: "6px 8px",
                          border: "1px solid #e2e8f0",
                          borderRadius: "6px",
                          fontSize: "13px",
                          outline: "none",
                          boxSizing: "border-box",
                          background: isMobile ? "#f8fafc" : "#fff",
                          cursor: isMobile ? "pointer" : "default",
                        }}
                        onFocus={focusStyle}
                        onBlur={blurStyle}
                      />
                    </td>
                    <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                      <input
                        type="text"
                        value={loan.installmentAmount || ""}
                        readOnly={isMobile}
                        onClick={isMobile ? () => openModal(index) : undefined}
                        onChange={(e) => handleLoanChange(index, "installmentAmount", e.target.value)}
                        placeholder="e.g., 2000"
                        style={{
                          width: "100%",
                          padding: "6px 8px",
                          border: "1px solid #e2e8f0",
                          borderRadius: "6px",
                          fontSize: "13px",
                          outline: "none",
                          boxSizing: "border-box",
                          background: isMobile ? "#f8fafc" : "#fff",
                          cursor: isMobile ? "pointer" : "default",
                        }}
                        onFocus={focusStyle}
                        onBlur={blurStyle}
                      />
                    </td>
                    <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                      <input
                        type="text"
                        value={loan.currentBalance || ""}
                        readOnly={isMobile}
                        onClick={isMobile ? () => openModal(index) : undefined}
                        onChange={(e) => handleLoanChange(index, "currentBalance", e.target.value)}
                        placeholder="e.g., 5000"
                        style={{
                          width: "100%",
                          padding: "6px 8px",
                          border: "1px solid #e2e8f0",
                          borderRadius: "6px",
                          fontSize: "13px",
                          outline: "none",
                          boxSizing: "border-box",
                          background: isMobile ? "#f8fafc" : "#fff",
                          cursor: isMobile ? "pointer" : "default",
                        }}
                        onFocus={focusStyle}
                        onBlur={blurStyle}
                      />
                    </td>
                    <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                      <input
                        type="date"
                        value={loan.expiryDate || ""}
                        readOnly={isMobile}
                        onClick={isMobile ? () => openModal(index) : undefined}
                        onChange={(e) => handleLoanChange(index, "expiryDate", e.target.value)}
                        style={{
                          width: "100%",
                          padding: "6px 8px",
                          border: "1px solid #e2e8f0",
                          borderRadius: "6px",
                          fontSize: "13px",
                          outline: "none",
                          boxSizing: "border-box",
                          background: isMobile ? "#f8fafc" : "#fff",
                          cursor: isMobile ? "pointer" : "default",
                        }}
                        onFocus={focusStyle}
                        onBlur={blurStyle}
                      />
                    </td>
                    <td style={{ padding: "8px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                      <button
                        type="button"
                        onClick={() => removeLoanRow(index)}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#ef4444",
                          cursor: "pointer",
                          fontSize: "20px",
                          fontWeight: "bold",
                          padding: "0 4px",
                        }}
                        aria-label="Remove row"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            onClick={addLoanRow}
            style={{
              marginTop: "16px",
              padding: "8px 20px",
              background: "#e0e7ff",
              border: "1px dashed #6366f1",
              borderRadius: "8px",
              cursor: "pointer",
              color: "#4338ca",
              fontWeight: "500",
              fontSize: "14px",
            }}
          >
            + Add Row
          </button>
        </div>
      )}

      {/* Modal for mobile editing */}
      {isModalOpen && editingRowData && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
            boxSizing: "border-box",
          }}
          onClick={closeModal} // close on backdrop click
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "12px",
              padding: "24px",
              maxWidth: "500px",
              width: "100%",
              maxHeight: "90%",
              overflowY: "auto",
              boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
          >
            <h4
              style={{
                margin: "0 0 16px 0",
                fontSize: "18px",
                fontWeight: "600",
                color: "#1e293b",
              }}
            >
              Edit Loan Details
            </h4>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", marginBottom: "4px" }}>
                  Date
                </label>
                <input
                  type="date"
                  value={editingRowData.date || ""}
                  onChange={(e) => handleModalFieldChange("date", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "16px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", marginBottom: "4px" }}>
                  Institution
                </label>
                <input
                  type="text"
                  value={editingRowData.institution || ""}
                  onChange={(e) => handleModalFieldChange("institution", e.target.value)}
                  placeholder="e.g., Bank ABC"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "16px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", marginBottom: "4px" }}>
                  Principal Amount
                </label>
                <input
                  type="text"
                  value={editingRowData.principalAmount || ""}
                  onChange={(e) => handleModalFieldChange("principalAmount", e.target.value)}
                  placeholder="e.g., 10000"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "16px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", marginBottom: "4px" }}>
                  Installment Amount
                </label>
                <input
                  type="text"
                  value={editingRowData.installmentAmount || ""}
                  onChange={(e) => handleModalFieldChange("installmentAmount", e.target.value)}
                  placeholder="e.g., 2000"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "16px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", marginBottom: "4px" }}>
                  Current Balance / Arrears
                </label>
                <input
                  type="text"
                  value={editingRowData.currentBalance || ""}
                  onChange={(e) => handleModalFieldChange("currentBalance", e.target.value)}
                  placeholder="e.g., 5000"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "16px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", marginBottom: "4px" }}>
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={editingRowData.expiryDate || ""}
                  onChange={(e) => handleModalFieldChange("expiryDate", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "16px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
                marginTop: "24px",
              }}
            >
              <button
                type="button"
                onClick={closeModal}
                style={{
                  padding: "10px 20px",
                  background: "#f1f5f9",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  color: "#334155",
                  fontWeight: "500",
                  fontSize: "14px",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveRowChanges}
                style={{
                  padding: "10px 20px",
                  background: "#6366f1",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  color: "#fff",
                  fontWeight: "500",
                  fontSize: "14px",
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          display: "flex",
          gap: "12px",
          justifyContent: "flex-end",
          marginTop: "32px",
        }}
      >
        <button
          type="button"
          onClick={onBack}
          style={{
            padding: "10px 24px",
            background: "#f1f5f9",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            color: "#334155",
            fontWeight: "500",
          }}
        >
          Back
        </button>
        <button
          type="submit"
          style={{
            padding: "10px 24px",
            background: "#6366f1",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            color: "#fff",
            fontWeight: "500",
          }}
        >
          Submit Application
        </button>
      </div>
    </>
  );
};

export default Step8LoanHistory;