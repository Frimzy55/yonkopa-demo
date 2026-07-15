import React, { useState, useEffect } from 'react';

const DenominationDetails = ({ transaction, onConfirm, onBack, loading }) => {
  // Local state for withdrawal details
  const [withdrawalBy, setWithdrawalBy] = useState('Account Holder');
  const [payeeName, setPayeeName] = useState('');
  const [amount, setAmount] = useState(0); // starts at 0, no auto-fill

  // ---- Define all possible denominations (notes + coins) ----
  const allDenomValues = [200, 100, 50, 20, 10, 5, 2, 1, 0.5, 0.2, 0.1, 0.05, 0.02, 0.01];

  // Get denominations from transaction (if any)
  const transactionDenoms = transaction?.denominations || [];
  const transactionDenomValues = transactionDenoms.map(item => item.denomination).filter(v => v !== undefined);

  // Combine all unique denominations (default + transaction)
  const uniqueDenoms = [...new Set([...allDenomValues, ...transactionDenomValues])].sort((a, b) => b - a);

  // Initialize counts: from transaction if available, else 0
  const initialCounts = {};
  uniqueDenoms.forEach(denom => {
    const found = transactionDenoms.find(item => item.denomination === denom);
    initialCounts[denom] = found ? found.count || 0 : 0;
  });

  // State for counts per denomination
  const [counts, setCounts] = useState(initialCounts);

  // Compute totals per denomination, totals per table, and grand total
  const computeTotals = () => {
    let notesTotal = 0;
    let coinsTotal = 0;
    const rowTotals = {};

    uniqueDenoms.forEach(denom => {
      const count = counts[denom] || 0;
      const total = count * denom;
      rowTotals[denom] = total;
      if (denom >= 1) {
        notesTotal += total;
      } else {
        coinsTotal += total;
      }
    });

    return { rowTotals, notesTotal, coinsTotal, grandTotal: notesTotal + coinsTotal };
  };

  const { rowTotals, notesTotal, coinsTotal, grandTotal } = computeTotals();

  // Filter denominations for notes and coins
  const notes = uniqueDenoms.filter(d => d >= 1);
  const coins = uniqueDenoms.filter(d => d < 1);

  // Handle count change
  const handleCountChange = (denom, value) => {
    const newCount = Math.max(0, parseInt(value) || 0);
    setCounts(prev => ({
      ...prev,
      [denom]: newCount,
    }));
  };

  // Format denomination display
  const formatDenomination = (denom) => {
    if (denom === undefined || denom === null) return 'N/A';
    const str = String(denom);
    if (str.startsWith('GH₵') || str.startsWith('GHS')) return str;
    const num = parseFloat(denom);
    if (Number.isInteger(num)) {
      return `GH₵${num}`;
    } else {
      return `Gp${(num * 100).toFixed(0)}`;
    }
  };

  // Render a table for given list of denomination values
  const renderTable = (denomList, title) => {
    if (!denomList || denomList.length === 0) return null;

    const totalCount = denomList.reduce((sum, d) => sum + (counts[d] || 0), 0);
    const totalAmount = denomList.reduce((sum, d) => sum + (rowTotals[d] || 0), 0);

    return (
      <div className="mb-4">
        <h6 className="text-primary fw-bold">{title}</h6>
        <div className="table-responsive">
          <table className="table table-bordered table-striped table-hover">
            <thead className="table-primary">
              <tr>
                <th style={{ width: '50px' }}>#</th>
                <th>Denomination</th>
                <th style={{ width: '120px' }}>Count</th>
                <th style={{ width: '150px' }}>Amount (GHS)</th>
              </tr>
            </thead>
            <tbody>
              {denomList.map((denom, idx) => {
                const count = counts[denom] || 0;
                const total = rowTotals[denom] || 0;
                return (
                  <tr key={denom}>
                    <td className="text-center">{idx + 1}</td>
                    <td>{formatDenomination(denom)}</td>
                    <td>
                      <input
                        type="number"
                        className="form-control form-control-sm text-end"
                        min="0"
                        step="1"
                        value={count === 0 ? '' : count}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '') {
                            handleCountChange(denom, 0);
                          } else {
                            handleCountChange(denom, parseInt(val) || 0);
                          }
                        }}
                        disabled={loading}
                        style={{ width: '100%' }}
                      />
                    </td>
                    <td className="text-end">
                      {total.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="table-secondary fw-bold">
              <tr>
                <td colSpan="2" className="text-end">Total</td>
                <td className="text-end">{totalCount.toLocaleString()}</td>
                <td className="text-end">
                  {totalAmount.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    );
  };

  // ---- Narration is derived from payeeName ----
  const narrationText = `being cash withdrawn by ${payeeName}`.trim();

  const handleConfirm = () => {
    // Build denomination details from counts (only those with count > 0)
    const denomDetails = uniqueDenoms
      .filter(d => (counts[d] || 0) > 0)
      .map(d => ({
        denomination: d,
        count: counts[d],
        total: rowTotals[d],
      }));

    onConfirm({
      withdrawalBy,
      payeeName,
      narration: narrationText,
      amount,
      denominations: denomDetails,
    });
  };

  return (
    <div className="card mt-3">
      <div className="card-body">
        {/* ---- NOTES TABLE ---- */}
        {renderTable(notes, 'Notes')}

        {/* ---- COINS TABLE ---- */}
        {renderTable(coins, 'Coins')}

        {/* Grand Total summary */}
        <div className="text-end fw-bold mb-3">
          <span className="me-3">Grand Total:</span>
          <span>
            {grandTotal.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{' '}
            GHS
          </span>
        </div>

        {/* ---- Withdrawal Details Section ---- */}
        <div className="mt-4">
          <h6 className="text-primary fw-bold">Withdrawal Details</h6>
          <div className="row g-3">
            {/* Withdrawal By */}
            <div className="col-md-4">
              <label className="form-label fw-medium">Withdrawal By</label>
              <select
                className="form-select"
                value={withdrawalBy}
                onChange={(e) => setWithdrawalBy(e.target.value)}
                disabled={loading}
              >
                <option value="Account Holder">Account Holder</option>
                <option value="Third Party">Third Party</option>
              </select>
            </div>

            {/* Payment Number (amount) – no auto-fill */}
            <div className="col-md-4">
              <label className="form-label fw-medium">Payment Number</label>
              <input
                type="number"
                className="form-control"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
                disabled={loading}
              />
            </div>

            {/* Payee Name */}
            <div className="col-md-4">
              <label className="form-label fw-medium">Payee Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter payee name"
                value={payeeName}
                onChange={(e) => setPayeeName(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Narration – read-only, auto-updates with payee name */}
            <div className="col-12">
              <label className="form-label fw-medium">Narration</label>
              <input
                type="text"
                className="form-control"
                value={narrationText}
                readOnly
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-3">
          <button
            className="btn btn-success"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Submit'}
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