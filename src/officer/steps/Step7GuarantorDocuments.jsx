import React, { useRef, useState } from "react";
import { MdAttachFile, MdClose, MdEdit, MdCheck, MdCancel } from "react-icons/md";

const Step7GuarantorDocuments = ({
  guarantorDocuments,
  handleAddGuarantorDocuments,
  removeGuarantorDocument,
  renameGuarantorDocument,  // new prop: (index, newName) => void
  formatSize,
  onBack,
  onNext,
}) => {
  const fileInputRef = useRef(null);

  // Local state for editing
  const [editingIndex, setEditingIndex] = useState(null);
  const [editName, setEditName] = useState("");

  const startEditing = (index) => {
    setEditingIndex(index);
    setEditName(guarantorDocuments[index].name);
  };

  const saveEdit = () => {
    if (editingIndex !== null && editName.trim()) {
      renameGuarantorDocument(editingIndex, editName.trim());
    }
    cancelEdit();
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditName("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveEdit();
    } else if (e.key === "Escape") {
      cancelEdit();
    }
  };

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
        Guarantor Documents
      </h3>

      <div style={{ marginBottom: "20px" }}>
        <p
          style={{
            fontSize: "14px",
            color: "#64748b",
            margin: "0 0 12px 0",
          }}
        >
          Upload additional documents for the guarantor (e.g., proof of address,
          additional ID). You can add multiple files.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleAddGuarantorDocuments}
          style={{ display: "none" }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current.click()}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 20px",
            background: "#eef2ff",
            border: "1px dashed #6366f1",
            borderRadius: "8px",
            color: "#4338ca",
            fontSize: "14px",
            fontWeight: "500",
            cursor: "pointer",
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#e0e7ff")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#eef2ff")}
        >
          <MdAttachFile size={18} /> Add Guarantor Document
        </button>
      </div>

      {guarantorDocuments.length > 0 && (
        <div style={{ marginTop: "16px" }}>
          <h4
            style={{
              fontSize: "14px",
              fontWeight: "600",
              color: "#334155",
              marginBottom: "8px",
            }}
          >
            Uploaded Files ({guarantorDocuments.length})
          </h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {guarantorDocuments.map((doc, index) => (
              <li
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  background: "#f8fafc",
                  borderRadius: "6px",
                  marginBottom: "6px",
                  border: "1px solid #e2e8f0",
                  gap: "8px",
                }}
              >
                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "8px" }}>
                  {editingIndex === index ? (
                    // Edit mode
                    <>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onBlur={saveEdit}
                        autoFocus
                        style={{
                          flex: 1,
                          padding: "4px 8px",
                          border: "1px solid #6366f1",
                          borderRadius: "4px",
                          fontSize: "14px",
                          outline: "none",
                        }}
                      />
                      <button
                        type="button"
                        onClick={saveEdit}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#22c55e",
                          cursor: "pointer",
                          padding: "4px",
                        }}
                      >
                        <MdCheck size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#ef4444",
                          cursor: "pointer",
                          padding: "4px",
                        }}
                      >
                        <MdCancel size={18} />
                      </button>
                    </>
                  ) : (
                    // View mode
                    <>
                      <span style={{ fontSize: "14px", color: "#1e293b" }}>
                        {doc.name}{" "}
                        <span style={{ color: "#94a3b8", fontSize: "12px" }}>
                          ({formatSize(doc.size)})
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => startEditing(index)}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#64748b",
                          cursor: "pointer",
                          padding: "4px",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <MdEdit size={16} />
                      </button>
                    </>
                  )}
                </div>
                {editingIndex !== index && (
                  <button
                    type="button"
                    onClick={() => removeGuarantorDocument(index)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#ef4444",
                      cursor: "pointer",
                      padding: "4px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <MdClose size={18} />
                  </button>
                )}
              </li>
            ))}
          </ul>
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
          type="button"
          onClick={onNext}
          style={{
            padding: "10px 24px",
            background: "#3b82f6",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            color: "#fff",
            fontWeight: "500",
          }}
        >
          Next
        </button>
      </div>
    </>
  );
};

export default Step7GuarantorDocuments;