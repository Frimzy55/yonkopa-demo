// src/pages/CustomerDashboard/CustomerDocumentUpload.jsx
import React from "react";

const DocumentUpload = ({ formData, handleInputChange }) => {
  // ----- Document management -----
  const handleDocChange = (index, field, value) => {
    const currentDocs = formData.documents || [];
    const updatedDocs = currentDocs.map((doc, i) =>
      i === index ? { ...doc, [field]: value } : doc
    );
    handleInputChange({ target: { name: "documents", value: updatedDocs } });
  };

  const handleFileChange = (index, file) => {
    const currentDocs = formData.documents || [];
    const updatedDocs = currentDocs.map((doc, i) =>
      i === index ? { ...doc, file } : doc
    );
    handleInputChange({ target: { name: "documents", value: updatedDocs } });
  };

  const addDocumentRow = () => {
    const currentDocs = formData.documents || [];
    const newDoc = { description: "", file: null };
    handleInputChange({
      target: { name: "documents", value: [...currentDocs, newDoc] },
    });
  };

  const removeDocumentRow = (index) => {
    const currentDocs = formData.documents || [];
    const updatedDocs = currentDocs.filter((_, i) => i !== index);
    handleInputChange({ target: { name: "documents", value: updatedDocs } });
  };

  return (
    <div className="form-step">
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">Document Upload</h5>
        </div>
        <div className="card-body">
          {(!formData.documents || formData.documents.length === 0) ? (
            <div className="text-center text-muted py-3">
              No documents added. Click the button below to add.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered table-hover">
                <thead className="thead-light">
                  <tr>
                    <th>Document Description</th>
                    <th>Select Document</th>
                    <th style={{ width: "100px" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.documents.map((doc, index) => (
                    <tr key={index}>
                      <td>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={doc.description || ""}
                          onChange={(e) =>
                            handleDocChange(index, "description", e.target.value)
                          }
                          placeholder="e.g Passport, Guarantor Letter"
                        />
                      </td>
                      <td>
                        <input
                          type="file"
                          className="form-control-file"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) handleFileChange(index, file);
                          }}
                        />
                        {doc.file && (
                          <span className="ml-2 text-muted small">
                            {doc.file.name}
                          </span>
                        )}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => removeDocumentRow(index)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={addDocumentRow}
          >
            + Add Document
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentUpload;