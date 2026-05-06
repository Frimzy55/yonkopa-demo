// Basic permissions configuration
export const basicPermissions = [
  { id: 'view_dashboard', name: 'View Dashboard', category: 'General' },
  { id: 'manage_customers', name: 'Manage Customers', category: 'Customer' },
  { id: 'view_customers', name: 'View Customers', category: 'Customer' },
  { id: 'create_customer', name: 'Create Customer', category: 'Customer' },
  { id: 'edit_customer', name: 'Edit Customer', category: 'Customer' },
  { id: 'delete_customer', name: 'Delete Customer', category: 'Customer' },
  { id: 'manage_accounts', name: 'Manage Accounts', category: 'Account' },
  { id: 'view_accounts', name: 'View Accounts', category: 'Account' },
  { id: 'create_account', name: 'Create Account', category: 'Account' },
  { id: 'close_account', name: 'Close Account', category: 'Account' },
  { id: 'teller_transactions', name: 'Teller Transactions', category: 'Teller' },
  { id: 'deposit', name: 'Process Deposit', category: 'Teller' },
  { id: 'withdraw', name: 'Process Withdrawal', category: 'Teller' },
  { id: 'view_teller_summary', name: 'View Teller Summary', category: 'Teller' },
  { id: 'manage_loans', name: 'Manage Loans', category: 'Loans' },
  { id: 'approve_loans', name: 'Approve Loans', category: 'Loans' },
  { id: 'disburse_loans', name: 'Disburse Loans', category: 'Loans' },
  { id: 'manage_gl_accounts', name: 'Manage GL Accounts', category: 'Internal Accounts' },
  { id: 'internal_transfers', name: 'Internal Transfers', category: 'Internal Accounts' },
  { id: 'manage_users', name: 'Manage Users', category: 'Admin' },
  { id: 'manage_roles', name: 'Manage Roles', category: 'Admin' },
  { id: 'view_reports', name: 'View Reports', category: 'Reports' },
  { id: 'batch_upload', name: 'Batch Upload', category: 'Batch Upload' },
  { id: 'system_settings', name: 'System Settings', category: 'System' }
];

// Complete Menu items configuration with all menus
export const menuItems = [
  { name: 'Dashboard', icon: 'bi-speedometer2' },
  { 
    name: 'Customer', icon: 'bi-people',
    subMenus: [
      { name: 'Create Customer', icon: 'bi-person-plus',
        nestedMenus: [
          { name: 'Individual Customer', icon: 'bi-person' },
          { name: 'Corporate Customer', icon: 'bi-building' },
          { name: 'Solidarity Group', icon: 'bi-people-fill' }
        ]
      },
      { name: 'Customer Maintenance', icon: 'bi-tools' },
      { name: 'Enquiries', icon: 'bi-question-circle' }
    ]
  },
  { 
    name: 'Account', icon: 'bi-bank',
    subMenus: [
      { name: 'Create Account', icon: 'bi-plus-circle' },
      { name: 'Edit Account', icon: 'bi-pencil-square' },
      { name: 'Account List', icon: 'bi-list-ul' },
      { name: 'Set or Release Lien', icon: 'bi-lock' },
      { name: 'Account Enquiry', icon: 'bi-search' },
      { name: 'Account Statement', icon: 'bi-receipt' },
      { name: 'Close Account', icon: 'bi-x-circle' }
    ]
  },
  { 
    name: 'Teller', icon: 'bi-cash-stack',
    subMenus: [
      { name: 'Deposit', icon: 'bi-arrow-down-circle',
        nestedMenus: [
          { name: 'Deposit', icon: 'bi-arrow-down-circle' },
          { name: 'Reverse Deposit', icon: 'bi-arrow-return-left' }
        ]
      },
      { name: 'Withdrawals', icon: 'bi-arrow-up-circle',
        nestedMenus: [
          { name: 'Withdraw', icon: 'bi-arrow-up-circle' },
          { name: 'Reverse Withdrawal', icon: 'bi-arrow-return-right' }
        ]
      },
      { name: 'Till Management', icon: 'bi-calculator',
        nestedMenus: [
          { name: 'Till Status', icon: 'bi-graph-up' },
          { name: 'Open or Close Till', icon: 'bi-toggle-on' },
          { name: 'Till Transfer', icon: 'bi-arrow-left-right' },
          { name: 'Reverse Till Transfer', icon: 'bi-arrow-return-left' },
          { name: 'Till Statement', icon: 'bi-receipt' }
        ]
      },
      { name: 'Back Dates', icon: 'bi-calendar-date',
        nestedMenus: [
          { name: 'Backdated Deposit', icon: 'bi-calendar-plus' },
          { name: 'Backdated Withdrawal', icon: 'bi-calendar-minus' },
          { name: 'Backdated Entry Reversal', icon: 'bi-calendar-x' }
        ]
      },
      { name: 'Call Over', icon: 'bi-megaphone' },
      { name: 'Teller Summary', icon: 'bi-bar-chart' }
    ]
  },
  { 
    name: 'Loans', icon: 'bi-piggy-bank',
    subMenus: [
      { name: 'Loan Application', icon: 'bi-file-text' },
      { name: 'Web Loan', icon: 'bi-globe' },
      { name: 'Edit Loan Application', icon: 'bi-pencil-square' },
      { name: 'Edit Loan Evaluation', icon: 'bi-clipboard-check' },
      { name: 'Loan Evaluation', icon: 'bi-check-circle' },
      { name: 'Loan Disbursement', icon: 'bi-cash' },
      { name: 'Disburse Loan List', icon: 'bi-list-check' },
      { name: 'Loan Repayment', icon: 'bi-arrow-return-left' },
      { name: 'Expected Repayments', icon: 'bi-calendar-check' },
      { name: 'Due Repayments', icon: 'bi-calendar-exclamation' },
      { name: 'View Loan', icon: 'bi-eye' },
      { name: 'Reverse Loan', icon: 'bi-arrow-return-right' },
      { name: 'Terminate Loan', icon: 'bi-x-octagon' },
      { name: 'Loan Reschedule', icon: 'bi-calendar-week' }
    ]
  },
  { 
    name: 'Investment', icon: 'bi-graph-up',
    subMenus: [
      { name: 'New Investment', icon: 'bi-plus-circle' },
      { name: 'Manage Investment', icon: 'bi-gear' },
      { name: 'Investment Redemption', icon: 'bi-cash-stack' },
      { name: 'Enquiries', icon: 'bi-question-circle' }
    ]
  },
  { 
    name: 'Internal Accounts', icon: 'bi-diagram-3',
    subMenus: [
      { name: 'GL Accounts', icon: 'bi-journal-bookmark-fill' },
      { name: 'Internal Transfers', icon: 'bi-arrow-left-right' },
      { name: 'Internal Account Statement', icon: 'bi-receipt' },
      { name: 'Fund Transfer', icon: 'bi-send',
        nestedMenus: [
          { name: 'Create Fund Transfer', icon: 'bi-plus-circle' },
          { name: 'Create Backdated FT', icon: 'bi-calendar-minus' },
          { name: 'List of Fund Transfers', icon: 'bi-list-ul' }
        ]
      },
      { name: 'Lien', icon: 'bi-lock',
        nestedMenus: [
          { name: 'Set Lien', icon: 'bi-lock-fill' },
          { name: 'Release Lien', icon: 'bi-unlock-fill' },
          { name: 'Enquiries', icon: 'bi-question-circle' }
        ]
      }
    ]
  },
  { 
    name: 'Admin', icon: 'bi-shield-lock',
    subMenus: [
      { name: 'User Management', icon: 'bi-people' },
      { name: 'Add Roles', icon: 'bi-shield-check' }
    ]
  },
  {
    name: 'My Approvals', icon: 'bi-check2-circle',
    subMenus: [
      { name: 'Admin', icon: 'bi-person-check',
        nestedMenus: [
          { name: 'Approve User Creation', icon: 'bi-person-plus' },
          { name: 'Approve User Edit', icon: 'bi-pencil-square' },
          { name: 'Approve Role Creation', icon: 'bi-shield-plus' },
          { name: 'Approve Role Edit', icon: 'bi-shield-shaded' },
          { name: 'Approve User Role', icon: 'bi-person-badge' },
          { name: 'Approve User to Role Edit', icon: 'bi-person-gear' },
          { name: 'Approve User Permissions', icon: 'bi-key' },
          { name: 'Approve Role Assignment', icon: 'bi-person-check-fill' },
          { name: 'Approve Teller Limit', icon: 'bi-cash-stack' },
          { name: 'Approve Loan Threshold', icon: 'bi-piggy-bank' },
          { name: 'Approve New Loan Product', icon: 'bi-file-plus' },
          { name: 'Approve Loan Product Edit', icon: 'bi-pencil' },
          { name: 'Approve New Branch', icon: 'bi-building-add' },
          { name: 'Approve Branch Edit', icon: 'bi-building-gear' }
        ]
      },
      { name: 'Customer', icon: 'bi-diagram-3',
        nestedMenus: [
          { name: 'Approve New Customer', icon: 'bi-person-plus' },
          { name: 'Approve Customer Maintenance', icon: 'bi-tools' },
          { name: 'Approve RO Assigning', icon: 'bi-person-badge' },
          { name: 'Approve Batch Upload', icon: 'bi-cloud-upload' }
        ]
      },
      { name: 'Account', icon: 'bi-file-check',
        nestedMenus: [
          { name: 'Approve New Accounts', icon: 'bi-plus-circle' },
          { name: 'Approve Account Maintenance', icon: 'bi-tools' },
          { name: 'Approve Lien', icon: 'bi-lock' }
        ]
      },
      { name: 'Loans', icon: 'bi-shield-plus',
        nestedMenus: [
          { name: 'Loans Awaiting Approvals', icon: 'bi-globe' },
          { name: 'Approve New Individual Loan', icon: 'bi-person' },
          { name: 'Approve Corporate Loan', icon: 'bi-building' },
          { name: 'Approve Group Loan', icon: 'bi-people-fill' },
          { name: 'Approve Loan Maintenance', icon: 'bi-tools' },
          { name: 'Approve Loan Disbursement', icon: 'bi-cash' }
        ]
      },
      { name: 'Collections', icon: 'bi-shield-check',
        nestedMenus: [
          { name: 'Approve Daily Collections', icon: 'bi-calendar-check' }
        ]
      },
      { name: 'Teller', icon: 'bi-person-gear',
        nestedMenus: [
          { name: 'Approve Till Transfer', icon: 'bi-arrow-left-right' },
          { name: 'Approve Backdated Till Transfer', icon: 'bi-calendar-minus' },
          { name: 'Approve Cash Deposit Reversal', icon: 'bi-arrow-return-left' },
          { name: 'Approve Cash Withdrawal Reversal', icon: 'bi-arrow-return-right' },
          { name: 'Approve Teller Shortage & Overage', icon: 'bi-exclamation-triangle' },
          { name: 'Approve Backdated deposit', icon: 'bi-arrow-return-right' },
          { name: 'Approve Backdated withdrawals', icon: 'bi-exclamation-triangle' }
        ]
      },
      { name: 'Internal Accounts', icon: 'bi-person-lines-fill',
        nestedMenus: [
          { name: 'Approve GL Account Creation', icon: 'bi-journal-plus' },
          { name: 'Approve GL Account Edit', icon: 'bi-pencil-square' },
          { name: 'Approve Internal Transfers', icon: 'bi-arrow-left-right' },
          { name: 'Approve Manual GL Postings', icon: 'bi-journal-bookmark-fill' },
          { name: 'Approve Fund Transfer', icon: 'bi-arrow-left-right' },
          { name: 'Approve Backdated FTs', icon: 'bi-journal-bookmark-fill' }
        ]
      },
      { name: 'Batch Uploads', icon: 'bi-key',
        nestedMenus: [
          { name: 'Approve Customer Upload', icon: 'bi-person-plus' },
          { name: 'Approve Account Upload', icon: 'bi-bank' },
          { name: 'Approve Loan Upload', icon: 'bi-piggy-bank' },
          { name: 'Approve Disbursement Upload', icon: 'bi-cash' },
          { name: 'Approve Repayment Upload', icon: 'bi-arrow-return-left' },
          { name: 'Approve Charges Upload', icon: 'bi-receipt' },
          { name: 'Approve GL Adjustments', icon: 'bi-journal-bookmark-fill' },
          { name: 'Approve Branch Reassignment', icon: 'bi-building' },
          { name: 'Approve RO Reassignment', icon: 'bi-person-badge' },
          { name: 'Approve Picture Uploads', icon: 'bi-image' },
          { name: 'Approve ID Uploads', icon: 'bi-file-earmark-person' }
        ]
      }
    ]
  },
  { 
    name: 'Reports', icon: 'bi-file-bar-graph',
    subMenus: [
      { name: 'Loan Reports', icon: 'bi-piggy-bank', reportType: 'Loan Reports',
        reports: [
          { name: 'Loan Portfolio Report', icon: 'bi-bank' },
          { name: 'Approved Loans Report', icon: 'bi-check-circle-fill' },
          { name: 'Loan Disbursement Report', icon: 'bi-cash' },
          { name: 'Loan Repayment Report', icon: 'bi-arrow-return-left' },
          { name: 'Loan Arrears Report', icon: 'bi-exclamation-triangle' },
          { name: 'Portfolio At Risk (PAR) Report', icon: 'bi-graph-up' },
          { name: 'Non-Performing Loans Report', icon: 'bi-flag' },
          { name: 'Loan Aging Analysis Report', icon: 'bi-calendar' },
          { name: 'Written-Off Loans Report', icon: 'bi-trash' }
        ]
      },
      { name: 'Customer Reports', icon: 'bi-people', reportType: 'Customer Reports',
        reports: [
          { name: 'Customer Master List', icon: 'bi-list-ul' },
          { name: 'New Customers Report', icon: 'bi-person-plus' },
          { name: 'Active Customers Report', icon: 'bi-person-check' },
          { name: 'Dormant Customers Report', icon: 'bi-person-x' },
          { name: 'Customer by Branch Report', icon: 'bi-building' },
          { name: 'Customer by Relationship Officer Report', icon: 'bi-person-badge' }
        ]
      },
      { name: 'Teller Reports', icon: 'bi-cash-stack', reportType: 'Teller Reports',
        reports: [
          { name: 'Daily Teller Transactions Report', icon: 'bi-calendar-day' },
          { name: 'Deposit Report', icon: 'bi-arrow-down-circle' },
          { name: 'Withdrawal Report', icon: 'bi-arrow-up-circle' },
          { name: 'Teller Balancing Report', icon: 'bi-calculator' },
          { name: 'Branch Cash Summary Report', icon: 'bi-building' }
        ]
      },
      { name: 'Savings / Account Reports', icon: 'bi-bank', reportType: 'Savings / Account Reports',
        reports: [
          { name: 'Savings Account Listing', icon: 'bi-list-ul' },
          { name: 'New Accounts Opened Report', icon: 'bi-plus-circle' },
          { name: 'Closed Accounts Report', icon: 'bi-x-circle' },
          { name: 'Dormant Accounts Report', icon: 'bi-moon' },
          { name: 'Account Balance Report', icon: 'bi-calculator' }
        ]
      },
      { name: 'Authorization Reports', icon: 'bi-shield-lock', reportType: 'Authorization Reports',
        reports: [
          { name: 'Pending Customer Authorization', icon: 'bi-person-check' },
          { name: 'Pending Loan Authorization', icon: 'bi-file-check' },
          { name: 'Pending Account Authorization', icon: 'bi-bank-check' }
        ]
      }
    ]
  },
  { 
    name: 'Batch Upload', icon: 'bi-cloud-upload',
    subMenus: [
      { name: 'Upload Customers', icon: 'bi-person-plus' },
      { name: 'Upload Loans', icon: 'bi-piggy-bank' }
    ]
  },
  { 
    name: 'System Settings', icon: 'bi-gear',
    subMenus: [
      { name: 'Branches', icon: 'bi-building' },
      { name: 'Configurations', icon: 'bi-sliders2' }
    ]
  }
];

// Convert menu items to permissions
const convertMenuToPermissions = (items, parentCategory = '') => {
  let permissions = [];
  
  items.forEach(item => {
    if (item.name && item.name !== 'Dashboard') {
      permissions.push({
        id: item.name.toLowerCase().replace(/ /g, '_'),
        name: `Access ${item.name} Module`,
        category: parentCategory || item.name,
        originalName: item.name,
        icon: item.icon
      });
    }
    
    if (item.subMenus && item.subMenus.length > 0) {
      item.subMenus.forEach(subMenu => {
        if (subMenu.name) {
          permissions.push({
            id: `${item.name.toLowerCase()}_${subMenu.name.toLowerCase().replace(/ /g, '_')}`,
            name: `${subMenu.name}`,
            category: item.name,
            parentMenu: item.name,
            icon: subMenu.icon
          });
        }
        
        if (subMenu.nestedMenus && subMenu.nestedMenus.length > 0) {
          subMenu.nestedMenus.forEach(nested => {
            permissions.push({
              id: `${item.name.toLowerCase()}_${subMenu.name.toLowerCase().replace(/ /g, '_')}_${nested.name.toLowerCase().replace(/ /g, '_')}`,
              name: nested.name,
              category: `${item.name} - ${subMenu.name}`,
              parentMenu: item.name,
              subMenu: subMenu.name,
              icon: nested.icon
            });
          });
        }
        
        if (subMenu.reports && subMenu.reports.length > 0) {
          subMenu.reports.forEach(report => {
            permissions.push({
              id: `${item.name.toLowerCase()}_${subMenu.name.toLowerCase().replace(/ /g, '_')}_${report.name.toLowerCase().replace(/ /g, '_')}`,
              name: report.name,
              category: `${item.name} - ${subMenu.name}`,
              parentMenu: item.name,
              subMenu: subMenu.name,
              icon: report.icon,
              isReport: true
            });
          });
        }
      });
    }
  });
  
  return permissions;
};

const menuPermissions = convertMenuToPermissions(menuItems);
export const availablePermissions = [...basicPermissions, ...menuPermissions];

export const getGroupedPermissions = () => {
  return availablePermissions.reduce((groups, permission) => {
    if (!groups[permission.category]) {
      groups[permission.category] = [];
    }
    groups[permission.category].push(permission);
    return groups;
  }, {});
};