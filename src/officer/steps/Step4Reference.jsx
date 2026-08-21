import React from "react";

const Step4Reference = ({
  formData,
  onChange,
  isMobile,
  inputStyle,
  focusStyle,
  blurStyle,
  onBack,
  onNext,
}) => {
  // Helper to add a new empty reference
  const addReference = () => {
    const current = formData.references || [];
    const newReference = {
      referenceName: "",
      referenceRelationship: "",
      referenceLocation: "",
      referenceContact: "",
    };
    const updated = [...current, newReference];
    // Update parent state via onChange
    onChange({
      target: {
        name: "references",
        value: updated,
      },
    });
  };

  // Helper to remove a reference by index
  const removeReference = (index) => {
    const current = formData.references || [];
    const updated = current.filter((_, i) => i !== index);
    onChange({
      target: {
        name: "references",
        value: updated,
      },
    });
  };

  // Helper to update a specific field of a reference
  const handleReferenceChange = (index, field, value) => {
    const current = formData.references || [];
    const updated = current.map((ref, i) =>
      i === index ? { ...ref, [field]: value } : ref
    );
    onChange({
      target: {
        name: "references",
        value: updated,
      },
    });
  };

  const references = formData.references || [];

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
        Reference Details
      </h3>

      <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "16px" }}>
        Add one or more references. Each reference should include name, relationship, location, and contact.
      </p>

      {references.map((ref, index) => (
        <div
          key={index}
          style={{
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            padding: "16px",
            marginBottom: "16px",
            position: "relative",
            background: "#fafafa",
          }}
        >
          {/* Remove button */}
          <button
            type="button"
            onClick={() => removeReference(index)}
            style={{
              position: "absolute",
              top: "8px",
              right: "8px",
              background: "transparent",
              border: "none",
              color: "#ef4444",
              cursor: "pointer",
              fontSize: "18px",
              fontWeight: "bold",
              padding: "4px 8px",
            }}
            aria-label="Remove reference"
          >
            ×
          </button>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
              gap: "16px",
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
                Reference Name *
              </label>
              <input
                type="text"
                value={ref.referenceName || ""}
                onChange={(e) =>
                  handleReferenceChange(index, "referenceName", e.target.value)
                }
                required
                style={inputStyle}
                onFocus={focusStyle}
                onBlur={blurStyle}
              />
            </div>
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
                Relationship *
              </label>
              <input
                type="text"
                value={ref.referenceRelationship || ""}
                onChange={(e) =>
                  handleReferenceChange(index, "referenceRelationship", e.target.value)
                }
                required
                style={inputStyle}
                onFocus={focusStyle}
                onBlur={blurStyle}
              />
            </div>
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
                Location
              </label>
              <input
                type="text"
                value={ref.referenceLocation || ""}
                onChange={(e) =>
                  handleReferenceChange(index, "referenceLocation", e.target.value)
                }
                style={inputStyle}
                onFocus={focusStyle}
                onBlur={blurStyle}
              />
            </div>
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
                Contact *
              </label>
              <input
                type="tel"
                value={ref.referenceContact || ""}
                onChange={(e) =>
                  handleReferenceChange(index, "referenceContact", e.target.value)
                }
                required
                style={inputStyle}
                onFocus={focusStyle}
                onBlur={blurStyle}
              />
            </div>
          </div>
        </div>
      ))}

      {/* Add Reference button */}
      <button
        type="button"
        onClick={addReference}
        style={{
          padding: "8px 20px",
          background: "#eef2ff",
          border: "1px dashed #6366f1",
          borderRadius: "8px",
          cursor: "pointer",
          color: "#4338ca",
          fontWeight: "500",
          fontSize: "14px",
          marginBottom: "20px",
        }}
      >
        + Add Reference
      </button>

      {/* Navigation Buttons */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          justifyContent: "flex-end",
          marginTop: "16px",
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

export default Step4Reference;