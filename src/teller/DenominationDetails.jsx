import React from 'react';

const DenominationDetails = ({ transaction, onConfirm, onBack, loading }) => {
  return (
    <div className="card mt-3">
      <div className="card-body">
        <h6 className="text-primary fw-bold">Denomination Details</h6>

        {transaction.denominations && transaction.denominations.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-bordered table-striped">
              <thead>
                <tr>
                  <th>Denomination</th>
                  <th>Count</th>
                  <th>Total (GHS)</th>
                </tr>
              </thead>
              <tbody>
                {transaction.denominations.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.denomination || 'N/A'}</td>
                    <td>{item.count || 0}</td>
                    <td>{(item.total || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-muted">No denomination details available.</p>
        )}

        <div className="mt-3">
          <button
            className="btn btn-success"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Confirm Reversal'}
          </button>
          <button
            className="btn btn-outline-success ms-2"
            onClick={onBack}
            disabled={loading}
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default DenominationDetails;