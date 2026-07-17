import React, { useEffect, useState } from "react";
import { Card, Table, Badge, Button, Row, Col, Alert, Spinner } from "react-bootstrap";

const TillStatus = () => {
  const [tills, setTills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const apiBase = process.env.REACT_APP_API_URL || "http://localhost:5002";

  useEffect(() => {
    fetchTills();
  }, []);

  const fetchTills = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiBase}/api/tills`);
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setTills(data);
      setError("");
    } catch (err) {
      setError("Failed to load till status");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "open":
        return <Badge bg="success">Open</Badge>;
      case "active":
        return <Badge bg="primary">Active</Badge>;
      case "closed":
        return <Badge bg="secondary">Closed</Badge>;
      case "inactive":
        return <Badge bg="warning">Inactive</Badge>;
      case "pending":
        return <Badge bg="info">Pending</Badge>;
      default:
        return <Badge bg="dark">{status}</Badge>;
    }
  };

  // --- Summary counts ---
  const totalTills = tills.length;
  const activeTills = tills.filter(
    (till) => till.status === "active" || till.status === "open"
  ).length;
  const openTills = tills.filter(
    (till) => till.status === "open"
  ).length;
  const closedTills = tills.filter(
    (till) => till.status === "closed"
  ).length;

  if (loading) {
    return (
      <div className="text-center p-5">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* --- Header with Refresh only --- */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">
          <i className="bi bi-graph-up me-2 text-primary"></i> Till Status
        </h4>
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={fetchTills}
        >
          <i className="bi bi-arrow-repeat me-1"></i> Refresh
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* --- Summary Cards (4 columns) --- */}
      <Row className="mb-4 g-3">
        <Col md={3} sm={6}>
          <Card className="shadow-sm text-center py-2">
            <Card.Body>
              <h6 className="text-muted">Total Tills</h6>
              <h2 className="fw-bold text-primary">{totalTills}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6}>
          <Card className="shadow-sm text-center py-2">
            <Card.Body>
              <h6 className="text-muted">Active Tills</h6>
              <h2 className="fw-bold text-success">{activeTills}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6}>
          <Card className="shadow-sm text-center py-2">
            <Card.Body>
              <h6 className="text-muted">Open Tills</h6>
              <h2 className="fw-bold text-info">{openTills}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6}>
          <Card className="shadow-sm text-center py-2">
            <Card.Body>
              <h6 className="text-muted">Closed Tills</h6>
              <h2 className="fw-bold text-secondary">{closedTills}</h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* --- Till Table (no actions) --- */}
      <Card className="shadow-sm">
        <Card.Header className="bg-light">
          <h6 className="mb-0 fw-bold">
            <i className="bi bi-table me-2"></i> Till List
          </h6>
        </Card.Header>
        <Card.Body className="p-0">
          <Table responsive bordered hover className="mb-0">
            <thead className="table-light">
              <tr>
                <th>Till Number</th>
                <th>Till Name</th>
                <th>Branch</th>
                <th>Teller</th>
                <th>Currency</th>
                <th className="text-end">Balance</th>
                <th>Status</th>
                {/* Action column removed */}
              </tr>
            </thead>
            <tbody>
              {tills.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">
                    No tills found
                  </td>
                </tr>
              ) : (
                tills.map((till) => (
                  <tr key={till.id}>
                    <td className="fw-semibold">{till.till_number}</td>
                    <td>{till.till_name}</td>
                    <td>{till.branch}</td>
                    <td>{till.assigned_teller}</td>
                    <td>{till.currency}</td>
                    <td className="text-end">
                      {Number(till.opening_balance).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td>{getStatusBadge(till.status)}</td>
                    {/* Action cell removed */}
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};

export default TillStatus;