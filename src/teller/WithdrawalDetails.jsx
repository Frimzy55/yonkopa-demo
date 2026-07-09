import React from 'react';

const TransactionDetails = ({ transaction, onNext, loading }) => {
  return (
    <div className="card mt-4">
      <div className="card-body">
        <h5 className="text-primary fw-bold mb-4">Account Details</h5>

        {/* Account fields */}
        <div className="row mb-3">
          <div className="col-md-4">
            <small className="text-muted">Customer ID</small>
            <p className="fw-bold">{transaction.customerId || 'N/A'}</p>
          </div>
          <div className="col-md-4">
            <small className="text-muted">Account Number</small>
            <p className="fw-bold">{transaction.accountNumber || 'N/A'}</p>
          </div>
          <div className="col-md-4">
            <small className="text-muted">Account Name</small>
            <p className="fw-bold">{transaction.accountName || 'N/A'}</p>
          </div>
          <div className="col-md-4">
            <small className="text-muted">Product Name</small>
            <p className="fw-bold">{transaction.productName || 'N/A'}</p>
          </div>
          <div className="col-md-4">
            <small className="text-muted">Phone Number</small>
            <p className="fw-bold">{transaction.phone || 'N/A'}</p>
          </div>
          <div className="col-md-4">
            <small className="text-muted">Account Branch</small>
            <p className="fw-bold">{transaction.branch || 'N/A'}</p>
          </div>
          <div className="col-md-4">
            <small className="text-muted">Relationship Officer</small>
            <p className="fw-bold">{transaction.relationshipOfficer || 'N/A'}</p>
          </div>
          <div className="col-md-4">
            <small className="text-muted">Account Status</small>
            <p>
              <span className="badge bg-success">{transaction.status || 'N/A'}</span>
            </p>
          </div>
        </div>

        {/* Balance */}
        <div className="row mb-3">
          <div className="col-12">
            <h6 className="text-primary fw-bold">Account Balance</h6>
          </div>
          <div className="col-md-4">
            <small className="text-muted">Current Balance</small>
            <p className="fw-bold">
              GHS {transaction.currentBalance?.toLocaleString() ?? '0.00'}
            </p>
          </div>
          <div className="col-md-4">
            <small className="text-muted">Hold Balance</small>
            <p className="fw-bold">
              GHS {transaction.holdBalance?.toLocaleString() ?? '0.00'}
            </p>
          </div>
          <div className="col-md-4">
            <small className="text-muted">Available Balance</small>
            <p className="fw-bold text-success">
              GHS {transaction.availableBalance?.toLocaleString() ?? '0.00'}
            </p>
          </div>
        </div>

        {/* Mandate */}
        <div className="mt-4">
          <h6 className="text-primary fw-bold">Verify Account Mandate</h6>
          <div className="table-responsive">
            <table className="table table-bordered table-striped">
              <thead>
                <tr>
                  <th>S/N</th>
                  <th>Fullname</th>
                  <th>Photo</th>
                  <th>Signature</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {transaction.mandates && transaction.mandates.length > 0 ? (
                  transaction.mandates.map((mandate, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{mandate.fullname || 'N/A'}</td>
                      <td>
                        {mandate.photo ? (
                          <img
                            src={mandate.photo}
                            alt="Mandate"
                            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                          />
                        ) : (
                          'N/A'
                        )}
                      </td>
                      <td>
                        {mandate.signature ? (
                          <img
                            src={mandate.signature}
                            alt="Signature"
                            style={{ width: '80px', height: '30px', objectFit: 'contain' }}
                          />
                        ) : (
                          'N/A'
                        )}
                      </td>
                      <td>
                        <button className="btn btn-sm btn-outline-success">Verify</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center text-muted">
                      No mandate records available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-success mt-3"
          onClick={onNext}
          disabled={loading}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default TransactionDetails;