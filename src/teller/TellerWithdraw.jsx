// TellerWithdraw.js
import React, { useState } from 'react';

const TellerWithdraw = () => {
  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    availableBalance: '',
    amount: '',
    narration: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Withdrawal data:', formData);
    alert('Withdrawal submitted successfully!');
    // Optionally reset form
  };

  const handleCustomerIdBlur = () => {
    if (formData.customerId === '123') {
      setFormData((prev) => ({
        ...prev,
        customerName: 'John Doe',
        availableBalance: '5000.00',
      }));
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Withdrawal Form</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.grid}>
          <div style={styles.formGroup}>
            <label>Customer ID:</label>
            <input
              type="text"
              name="customerId"
              value={formData.customerId}
              onChange={handleChange}
              onBlur={handleCustomerIdBlur}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label>Customer Name:</label>
            <input
              type="text"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              readOnly
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label>Available Balance:</label>
            <input
              type="text"
              name="availableBalance"
              value={formData.availableBalance}
              onChange={handleChange}
              readOnly
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label>Amount:</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              min="0.01"
              step="0.01"
              style={styles.input}
            />
          </div>
        </div>

        {/* Narration – full width */}
        <div style={styles.formGroup}>
          <label>Narration:</label>
          <textarea
            name="narration"
            value={formData.narration}
            onChange={handleChange}
            rows="3"
            style={styles.textarea}
          />
        </div>

        <button type="submit" style={styles.button}>
          Submit Withdrawal
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '700px',
    margin: '50px auto',
    padding: '30px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    backgroundColor: '#f9f9f9',
  },
  title: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr', // two equal columns
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  input: {
    padding: '8px',
    fontSize: '16px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    marginTop: '4px',
  },
  textarea: {
    padding: '8px',
    fontSize: '16px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    marginTop: '4px',
    resize: 'vertical',
  },
  button: {
    padding: '10px 20px',
    fontSize: '16px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '10px',
    alignSelf: 'center',
    width: '50%',
  },
};

export default TellerWithdraw;