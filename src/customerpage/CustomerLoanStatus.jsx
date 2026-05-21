import React, { useEffect, useState } from "react";
import {
  Spinner,
  Alert,
} from "react-bootstrap";
import {
  CheckCircleFill,
  ClockFill,
  HourglassSplit,
  CheckLg,
  XCircleFill,
  FileText,
  ArrowRepeat
} from "react-bootstrap-icons";

// STEPS, extractUserId, normalizeStatus remain unchanged
const STEPS = [
  {
    name: "No Loan",
    icon: ClockFill,
    description: "You have not applied for any loan yet",
    color: "secondary",
    details: "Start by applying for a loan."
  },
  {
    name: "Pending",
    icon: HourglassSplit,
    description: "Application submitted and awaiting review",
    color: "warning",
    details: "Your application is being processed."
  },
  {
    name: "Approved",
    icon: CheckLg,
    description: "Loan approved",
    color: "info",
    details: "Your loan has been approved."
  },
  {
    name: "Rejected",
    icon: XCircleFill,
    description: "Loan rejected",
    color: "danger",
    details: "Your loan was not approved."
  }
];

const extractUserId = (user) => {
  if (!user) return null;
  const idFields = ["id", "userId", "user_id", "ID", "uid", "_id"];
  for (const field of idFields) {
    if (user[field]) return user[field];
  }
  if (user.user?.id) return user.user.id;
  if (user.user?.userId) return user.user.userId;
  if (user.profile?.id) return user.profile.id;
  return null;
};

const normalizeStatus = (status) => {
  if (!status) return "No Loan";
  const s = status.toLowerCase();
  if (s === "pending") return "Pending";
  if (s === "approved") return "Approved";
  if (s === "rejected") return "Rejected";
  return "No Loan";
};

// Professional styles (updated for single status view)
const styles = {
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '1.5rem',
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
  },
  card: {
    background: '#ffffff',
    borderRadius: '24px',
    boxShadow: '0 20px 35px -12px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.02)',
    overflow: 'hidden'
  },
  header: {
    padding: '1.5rem 2rem',
    borderBottom: '1px solid #f0f2f5',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#1a2c3e',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  badge: (variant) => ({
    padding: '0.4rem 1rem',
    borderRadius: '40px',
    fontSize: '0.8rem',
    fontWeight: '500',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: variant === 'warning' ? '#fef3c7' : variant === 'info' ? '#e0f2fe' : variant === 'danger' ? '#fee2e2' : '#f3f4f6',
    color: variant === 'warning' ? '#b45309' : variant === 'info' ? '#0369a1' : variant === 'danger' ? '#b91c1c' : '#4b5563',
    border: '1px solid',
    borderColor: variant === 'warning' ? '#fde68a' : variant === 'info' ? '#bae6fd' : variant === 'danger' ? '#fecaca' : '#e5e7eb'
  }),
  statusCard: {
    margin: '2rem',
    padding: '2rem',
    borderRadius: '20px',
    textAlign: 'center',
    background: '#ffffff',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    border: '1px solid #f0f2f5'
  },
  iconWrapper: (variant) => ({
    width: '80px',
    height: '80px',
    margin: '0 auto 1.5rem auto',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: variant === 'warning' ? '#fef3c7' : variant === 'info' ? '#e0f2fe' : variant === 'danger' ? '#fee2e2' : '#f3f4f6',
    color: variant === 'warning' ? '#f59e0b' : variant === 'info' ? '#0ea5e9' : variant === 'danger' ? '#ef4444' : '#6b7280'
  }),
  statusName: {
    fontSize: '1.75rem',
    fontWeight: '700',
    marginBottom: '0.5rem',
    color: '#1f2937'
  },
  statusDescription: {
    fontSize: '1rem',
    color: '#4b5563',
    marginBottom: '1rem'
  },
  detailsText: {
    fontSize: '0.9rem',
    color: '#6b7280',
    padding: '1rem',
    background: '#f8fafc',
    borderRadius: '12px',
    marginTop: '1rem'
  },
  actionButton: (variant) => ({
    background: variant === 'warning' ? '#f59e0b' : variant === 'info' ? '#0ea5e9' : variant === 'danger' ? '#ef4444' : '#3b82f6',
    color: 'white',
    border: 'none',
    padding: '0.7rem 1.8rem',
    borderRadius: '40px',
    fontWeight: '500',
    fontSize: '0.9rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
    transition: 'transform 0.1s ease, background 0.2s',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    marginTop: '1rem'
  }),
  emptyState: {
    textAlign: 'center',
    padding: '3rem 2rem',
    background: '#ffffff'
  }
};

const CustomerLoanStatus = ({ user, onStatusChange, showDetails = true, onApplyLoan }) => {
  const [currentStatus, setCurrentStatus] = useState("No Loan");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setError("User data is missing. Please log in again.");
      setIsLoading(false);
      return;
    }

    const userId = extractUserId(user);
    if (!userId) {
      setError("User ID not found.");
      setIsLoading(false);
      return;
    }

    const fetchStatus = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
        const response = await fetch(`${apiUrl}/api/loan-status/${userId}`);
        if (!response.ok) throw new Error(`HTTP error! ${response.status}`);
        const data = await response.json();
        const newStatus = normalizeStatus(data.status);
        setCurrentStatus((prev) => {
          if (onStatusChange && newStatus !== prev) onStatusChange(newStatus);
          return newStatus;
        });
      } catch (err) {
        console.error(err);
        setError("Failed to load loan status");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();
  }, [user, onStatusChange]);

  if (isLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.emptyState}>
            <Spinner animation="border" variant="info" />
            <p style={{ marginTop: '1rem', color: '#4b5563' }}>Loading loan status...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.emptyState}>
            <Alert variant="danger" style={{ width: '100%' }}>
              <p>{error}</p>
              <button
                style={styles.actionButton('info')}
                onClick={() => window.location.reload()}
              >
                <ArrowRepeat size={16} /> Retry
              </button>
            </Alert>
          </div>
        </div>
      </div>
    );
  }

  if (currentStatus === "No Loan") {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.emptyState}>
            <ClockFill size={48} style={{ color: '#9ca3af', marginBottom: '1rem' }} />
            <h3 style={{ color: '#1f2937', marginBottom: '0.5rem' }}>No Loan Application</h3>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>You have not applied for a loan yet.</p>
            <button style={styles.actionButton('info')} onClick={onApplyLoan}>
              <FileText size={16} /> Apply for Loan
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Find the current step data
  const currentStep = STEPS.find(step => step.name === currentStatus);
  const getVariant = () => {
    if (currentStatus === "Pending") return "warning";
    if (currentStatus === "Approved") return "info";
    if (currentStatus === "Rejected") return "danger";
    return "secondary";
  };
  const variant = getVariant();
  const Icon = currentStep.icon;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.title}>
            <FileText size={22} /> Loan Status
          </div>
          <div style={styles.badge(variant)}>
            {React.createElement(Icon, { size: 14 })}
            {currentStatus}
          </div>
        </div>

        <div style={styles.statusCard}>
          <div style={styles.iconWrapper(variant)}>
            {React.createElement(Icon, { size: 40 })}
          </div>
          <div style={styles.statusName}>{currentStatus}</div>
          <div style={styles.statusDescription}>{currentStep.description}</div>
          
          {showDetails && (
            <div style={styles.detailsText}>
              {currentStep.details}
            </div>
          )}

          {currentStatus === "Rejected" && (
            <button style={styles.actionButton(variant)} onClick={onApplyLoan}>
              <ArrowRepeat size={16} /> Apply Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerLoanStatus;