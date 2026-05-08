import React, { useEffect, useState } from "react";
import {
  Card,
  Badge,
  Spinner,
  Alert,
  ProgressBar,
  Button,
  Nav
} from "react-bootstrap";
import {
  CheckCircleFill,
  ClockFill,
  HourglassSplit,
  CheckLg,
  XCircleFill
} from "react-bootstrap-icons";

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

// Extract user ID safely
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

// Normalize status
const normalizeStatus = (status) => {
  if (!status) return "No Loan";

  const s = status.toLowerCase();

  if (s === "pending") return "Pending";
  if (s === "approved") return "Approved";
  if (s === "rejected") return "Rejected";

  return "No Loan";
};

const CustomerLoanStatus = ({ user, onStatusChange, showDetails = true , onApplyLoan}) => {
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
        const apiUrl =
          process.env.REACT_APP_API_URL || "http://localhost:5000";

        const response = await fetch(
          `${apiUrl}/api/loan-status/${userId}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! ${response.status}`);
        }

        const data = await response.json();

        console.log("API Response:", data);

        const newStatus = normalizeStatus(data.status);

        setCurrentStatus((prev) => {
          if (onStatusChange && newStatus !== prev) {
            onStatusChange(newStatus);
          }
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

  // Loading UI
  if (isLoading) {
    return (
      <Card className="shadow-sm border-0">
        <Card.Body className="text-center py-5">
          <Spinner animation="border" variant="info" />
          <p className="mt-3 text-muted">Loading loan status...</p>
        </Card.Body>
      </Card>
    );
  }

  // Error UI
  if (error) {
    return (
      <Card className="shadow-sm border-0">
        <Card.Body>
          <Alert variant="danger">
            <p>{error}</p>
            <Button variant="info" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </Alert>
        </Card.Body>
      </Card>
    );
  }

  // No Loan UI
  if (currentStatus === "No Loan") {
    return (
      <Card className="shadow-sm border-0 text-center p-4">
        <ClockFill size={40} className="text-secondary mb-3" />
        <h4>No Loan Application</h4>
        <p className="text-muted">
          You have not applied for a loan yet.
        </p>
        <Button variant="info" onClick={onApplyLoan}>Apply for Loan</Button>
      </Card>
    );
  }

  // Active Loan UI
  const currentIndex = STEPS.findIndex(
    (step) => step.name === currentStatus
  );

  const progress =
    (currentIndex / (STEPS.length - 1)) * 100;

  const currentStep = STEPS[currentIndex];
  const CurrentIcon = currentStep.icon;

  const getVariant = () => {
    if (currentStatus === "Pending") return "warning";
    if (currentStatus === "Approved") return "info";
    if (currentStatus === "Rejected") return "danger";
    return "secondary";
  };

  return (
    <Card className="shadow-sm border-0">
      <Card.Body className="p-4">
        {/* Header */}
        <div className="d-flex justify-content-between mb-3">
          <h5>Loan Progress</h5>
          <Badge bg={getVariant()}>
            <CurrentIcon className="me-1" size={14} />
            {currentStatus}
          </Badge>
        </div>

        {/* Progress */}
        <ProgressBar now={progress} variant={getVariant()} className="mb-4" />

        {/* Steps */}
        <Nav className="justify-content-between">
          {STEPS.slice(1).map((step, index) => {
            const realIndex = index + 1;
            const isActive = realIndex === currentIndex;
            const isDone = realIndex < currentIndex;
            const Icon = step.icon;

            return (
              <Nav.Item key={step.name} className="text-center flex-fill">
                <div
                  className={
                    isDone
                      ? "text-info"
                      : isActive
                      ? "text-info"
                      : "text-muted"
                  }
                >
                  <div
                    className={`rounded-circle mx-auto mb-2 d-flex align-items-center justify-content-center ${
                      isDone
                        ? "bg-info"
                        : isActive
                        ? "bg-info"
                        : "bg-light"
                    }`}
                    style={{ width: 40, height: 40 }}
                  >
                    {isDone ? (
                      <CheckCircleFill className="text-white" />
                    ) : (
                      <Icon className={isActive ? "text-white" : "text-muted"} />
                    )}
                  </div>
                  <small>{step.name}</small>
                </div>
              </Nav.Item>
            );
          })}
        </Nav>

        {/* Details */}
        {showDetails && (
          <Alert variant={getVariant()} className="mt-3">
            <strong>{currentStatus}</strong> — {currentStep.details}
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
};

export default CustomerLoanStatus;