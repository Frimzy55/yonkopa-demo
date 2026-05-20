// src/supervisorpage/LoanSupervisorDashboard.jsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// Hooks
import { useNavigation } from '../hooks/useNavigation';
import { useScrollPersistence } from '../hooks/useScrollPersistence';


import DashboardContent from './DashboardContent'; 
// UI Components
import { Sidebar } from '../components/Sidebar';
import { TopNavbar } from '../components/TopNavbars';
import { SummaryModal } from '../components/SummaryModals';

// Shared menu items
import { menuItems } from '../menuItems';

// ========== CUSTOMER COMPONENTS ==========
import CustomerMaintenance from '../customer/CustomerMaintenance';
import Enquiries from '../customer/Enquiries';
import IndividualCustomer from '../customer/create-customer/IndividualCustomer';
import CorporateCustomer from '../customer/create-customer/CorporateCustomer';
import JointAccount from '../customer/create-customer/SolidarityGroup';

// ========== ACCOUNT COMPONENTS ==========
import CreateAccount from '../Account/CreateAccount';
import AccountList from '../Account/AccountList';
import CloseAccount from '../Account/CloseAccount';
import EditAccount from '../Account/EditAccount';
import SetReleaseLien from '../Account/SetReleaseLien';
import AccountEnquiry from '../Account/AccountEnquiry';
import AccountStatement from '../Account/AccountStatement';

// ========== TELLER COMPONENTS ==========
import TellerDeposit from '../teller/TellerDeposit';
import TellerWithdraw from '../teller/TellerWithdraw';
import TellerSummary from '../teller/TellerSummary';
import ReverseDeposit from '../teller/ReverseDeposit';
import ReverseWithdrawal from '../teller/ReverseWithdrawal';
import TillStatus from '../teller/TillStatus';
import OpenCloseTill from '../teller/OpenCloseTill';
import TillTransfer from '../teller/TillTransfer';
import ReverseTillTransfer from '../teller/ReverseTillTransfer';
import TillStatement from '../teller/TillStatement';
import BackdatedDeposit from '../teller/BackdatedDeposit';
import BackdatedWithdrawal from '../teller/BackdatedWithdrawal';
import BackdatedEntryReversal from '../teller/BackdatedEntryReversal';
import CallOver from '../teller/CallOver';

// ========== LOAN COMPONENTS ==========
import LoanApplication from '../loans/LoanApplication';
import ApproveWebLoanApplication from '../loans/ApproveWebLoanApplication';
import LoanApproval from '../loans/LoanApproval';
import LoanDisbursement from '../loans/LoanDisbursement';
import LoanRepayment from '../loans/LoanRepayment';
import EditLoanApplication from '../loans/EditLoanApplication';
import EditLoanEvaluation from '../loans/EditLoanEvaluation';
import DisburseLoanList from '../loans/DisburseLoanList';
import ExpectedRepayments from '../loans/ExpectedRepayments';
import DueRepayments from '../loans/DueRepayments';
import ViewLoan from '../loans/ViewLoan';
import ReverseLoan from '../loans/ReverseLoan';
import TerminateLoan from '../loans/TerminateLoan';
import LoanReschedule from '../loans/LoanReschedule';

// ========== INVESTMENT COMPONENTS ==========
import NewInvestment from '../investment/NewInvestment';
import ManageInvestment from '../investment/ManageInvestment';
import InvestmentRedemption from '../investment/InvestmentRedemption';
import InvestmentEnquiries from '../investment/InvestmentEnquiries';

// ========== INTERNAL ACCOUNTS COMPONENTS ==========
import GLAccounts from '../internal-account/GLAccounts';
import InternalTransfers from '../internal-account/InternalTransfers';
import InternalAccountStatement from '../internal-account/InternalAccountStatement';
import CreateFundTransfer from '../internal-account/CreateFundTransfer';
import CreateBackdatedFT from '../internal-account/CreateBackdatedFT';
import ListFundTransfers from '../internal-account/ListFundTransfers';
import SetLien from '../internal-account/SetLien';
import ReleaseLien from '../internal-account/ReleaseLien';
import LienEnquiries from '../internal-account/LienEnquiries';

// ========== ADMIN COMPONENTS ==========
import UserManagement from '../admin/UserManagement';
import Roles from '../admin/Roles';

// ========== MY APPROVALS COMPONENTS ==========
import ApproveUserCreation from '../my-approvals/ApproveUserCreation';
import ApproveUserEdit from '../my-approvals/ApproveUserEdit';
import ApproveRoleCreation from '../my-approvals/ApproveRoleCreation';
import ApproveRoleEdit from '../my-approvals/ApproveRoleEdit';
import ApproveUserRole from '../my-approvals/ApproveUserRole';
import ApproveUserToRoleEdit from '../my-approvals/ApproveUserToRoleEdit';
import ApproveUserPermissions from '../my-approvals/ApproveUserPermissions';
import ApproveRoleAssignment from '../my-approvals/ApproveRoleAssignment';
import ApproveTellerLimit from '../my-approvals/ApproveTellerLimit';
import ApproveLoanThreshold from '../my-approvals/ApproveLoanThreshold';
import ApproveNewLoanProduct from '../my-approvals/ApproveNewLoanProduct';
import ApproveLoanProductEdit from '../my-approvals/ApproveLoanProductEdit';
import ApproveNewBranch from '../my-approvals/ApproveNewBranch';
import ApproveBranchEdit from '../my-approvals/ApproveBranchEdit';
import ApproveNewCustomer from '../my-approvals/ApproveNewCustomer';
import ApproveCustomerMaintenance from '../my-approvals/ApproveCustomerMaintenance';
import ApproveROAssigning from '../my-approvals/ApproveROAssigning';
import ApproveBatchUpload from '../my-approvals/ApproveBatchUpload';
import ApproveNewAccounts from '../my-approvals/ApproveNewAccounts';
import ApproveAccountMaintenance from '../my-approvals/ApproveAccountMaintenance';
import ApproveLien from '../my-approvals/ApproveLien';
import AwaitingApproval from '../my-approvals/AwaitingApproval';
import ApproveNewIndividualLoan from '../my-approvals/ApproveNewIndividualLoan';
import ApproveCorporateLoan from '../my-approvals/ApproveCorporateLoan';
import ApproveGroupLoan from '../my-approvals/ApproveGroupLoan';
import ApproveLoanMaintenance from '../my-approvals/ApproveLoanMaintenance';
import ApproveLoanDisbursement from '../my-approvals/ApproveLoanDisbursement';
import ApproveDailyCollections from '../my-approvals/ApproveDailyCollections';
import ApproveTillTransfer from '../my-approvals/ApproveTillTransfer';
import ApproveBackdatedTillTransfer from '../my-approvals/ApproveBackdatedTillTransfer';
import ApproveCashDepositReversal from '../my-approvals/ApproveCashDepositReversal';
import ApproveCashWithdrawalReversal from '../my-approvals/ApproveCashWithdrawalReversal';
import ApproveTellerShortageOverage from '../my-approvals/ApproveTellerShortageOverage';
import ApproveGLAccountCreation from '../my-approvals/ApproveGLAccountCreation';
import ApproveGLAccountEdit from '../my-approvals/ApproveGLAccountEdit';
import ApproveInternalTransfers from '../my-approvals/ApproveInternalTransfers';
import ApproveManualGLPostings from '../my-approvals/ApproveManualGLPostings';
import ApproveCustomerUpload from '../my-approvals/ApproveCustomerUpload';
import ApproveAccountUpload from '../my-approvals/ApproveAccountUpload';
import ApproveLoanUpload from '../my-approvals/ApproveLoanUpload';
import ApproveDisbursementUpload from '../my-approvals/ApproveDisbursementUpload';
import ApproveRepaymentUpload from '../my-approvals/ApproveRepaymentUpload';
import ApproveChargesUpload from '../my-approvals/ApproveChargesUpload';
import ApproveGLAdjustments from '../my-approvals/ApproveGLAdjustments';
import ApproveBranchReassignment from '../my-approvals/ApproveBranchReassignment';
import ApproveROReassignment from '../my-approvals/ApproveROReassignment';
import ApprovePictureUploads from '../my-approvals/ApprovePictureUploads';
import ApproveIDUploads from '../my-approvals/ApproveIDUploads';
import ApproveBackdatedDeposit from '../my-approvals/ApproveBackdatedDeposit';
import ApproveBackdatedWithdrawals from '../my-approvals/ApproveBackdatedWithdrawals';
import ApproveFundTransfer from '../my-approvals/ApproveFundTransfer';
import ApproveBackdatedFts from '../my-approvals/ApproveBackdatedFts';
import ApprovedLoans from '../my-approvals/ApprovedLoans';

// ========== BATCH UPLOAD COMPONENTS ==========
import UploadCustomers from '../batch-upload/UploadCustomers';
import UploadLoans from '../batch-upload/UploadLoans';

// ========== SYSTEM SETTINGS COMPONENTS ==========
import Branches from '../system-settings/Branches';
import Configurations from '../system-settings/Configurations';

// ========== REPORT COMPONENTS ==========
import LoanReports from '../reports/LoanReports';
import CustomerReports from '../reports/CustomerReports';
import KYCComplianceReports from '../reports/KYCComplianceReports';
import TellerReports from '../reports/TellerReports';
import SavingsAccountReports from '../reports/SavingsAccountReports';
import CollectionReports from '../reports/CollectionReports';
import RiskReports from '../reports/RiskReports';
import AuthorizationReports from '../reports/AuthorizationReports';
import FinancialReports from '../reports/FinancialReports';
import InternalAccountGLReports from '../reports/InternalAccountGLReports';

// KYC Reports
import PendingKYCReport from '../reports/kyc-reports/PendingKYCReport';
import VerifiedKYCReport from '../reports/kyc-reports/VerifiedKYCReport';
import RejectedKYCReport from '../reports/kyc-reports/RejectedKYCReport';
import ExpiredIDReport from '../reports/kyc-reports/ExpiredIDReport';
import PEPScreeningReport from '../reports/kyc-reports/PEPScreeningReport';
import HighRiskCustomerReport from '../reports/kyc-reports/HighRiskCustomerReport';

// Loan Reports
import LoanPortfolioReport from '../reports/loan-reports/LoanPortfolioReport';
import LoanDisbursementReport from '../reports/loan-reports/LoanDisbursementReport';
import LoanRepaymentReport from '../reports/loan-reports/LoanRepaymentReport';
import LoanArrearsReport from '../reports/loan-reports/LoanArrearsReport';
import PortfolioAtRiskReport from '../reports/loan-reports/PortfolioAtRiskReport';
import NonPerformingLoansReport from '../reports/loan-reports/NonPerformingLoansReport';
import LoanAgingAnalysisReport from '../reports/loan-reports/LoanAgingAnalysisReport';
import WrittenOffLoansReport from '../reports/loan-reports/WrittenOffLoansReport';
import ApprovedLoansReport from '../reports/loan-reports/ApprovedLoansReport';

// Customer Reports
import CustomerMasterList from '../reports/customer-reports/CustomerMasterList';
import NewCustomersReport from '../reports/customer-reports/NewCustomersReport';
import ActiveCustomersReport from '../reports/customer-reports/ActiveCustomersReport';
import DormantCustomersReport from '../reports/customer-reports/DormantCustomersReport';
import CustomerByBranchReport from '../reports/customer-reports/CustomerByBranchReport';
import CustomerByRelationshipOfficerReport from '../reports/customer-reports/CustomerByRelationshipOfficerReport';

// Teller Reports
import DailyTellerTransactionsReport from '../reports/teller-reports/DailyTellerTransactionsReport';
import DepositReport from '../reports/teller-reports/DepositReport';
import WithdrawalReport from '../reports/teller-reports/WithdrawalReport';
import TellerBalancingReport from '../reports/teller-reports/TellerBalancingReport';
import BranchCashSummaryReport from '../reports/teller-reports/BranchCashSummaryReport';

// Savings Account Reports
import SavingsAccountListing from '../reports/savings-reports/SavingsAccountListing';
import NewAccountsOpenedReport from '../reports/savings-reports/NewAccountsOpenedReport';
import ClosedAccountsReport from '../reports/savings-reports/ClosedAccountsReport';
import DormantAccountsReport from '../reports/savings-reports/DormantAccountsReport';
import AccountBalanceReport from '../reports/savings-reports/AccountBalanceReport';

// Collection Reports
import CollectionPerformanceReport from '../reports/collection-reports/CollectionPerformanceReport';
import ExpectedVsActualCollections from '../reports/collection-reports/ExpectedVsActualCollections';
import DailyCollectionSheet from '../reports/collection-reports/DailyCollectionSheet';
import MissedPaymentReport from '../reports/collection-reports/MissedPaymentReport';
import RecoveryFollowUpReport from '../reports/collection-reports/RecoveryFollowUpReport';

// Risk Reports
import PortfolioAtRiskReportRisk from '../reports/risk-reports/PortfolioAtRiskReport';
import PARGreaterThan30DaysReport from '../reports/risk-reports/PARGreaterThan30DaysReport';
import DelinquencyTrendReport from '../reports/risk-reports/DelinquencyTrendReport';
import TopExposureCustomersReport from '../reports/risk-reports/TopExposureCustomersReport';

// Authorization Reports
import PendingCustomerAuthorization from '../reports/authorization-reports/PendingCustomerAuthorization';
import PendingLoanAuthorization from '../reports/authorization-reports/PendingLoanAuthorization';
import PendingAccountAuthorization from '../reports/authorization-reports/PendingAccountAuthorization';

// Financial Reports
import RevenueReport from '../reports/financial-reports/RevenueReport';
import ExpenseReport from '../reports/financial-reports/ExpenseReport';
import RevenueVsExpenseReport from '../reports/financial-reports/RevenueVsExpenseReport';

// GL Reports
import GLTransactionReport from '../reports/gl-reports/GLTransactionReport';

// ========== COMPONENT ==========
const LoanSupervisorDashboard = () => {
  const navigate = useNavigate();

    // Get logged-in user from localStorage (memoized to prevent unnecessary re-renders)
  const originalUser = useMemo(() => {
    return JSON.parse(localStorage.getItem('user')) || {};
  }, []); // Empty dependency array – only runs once on mount

  // For the welcome card – use the real user's name (or fallback)
  const realUserName = useMemo(() => {
    return originalUser?.fullName || originalUser?.name || 'Loan Supervisor';
  }, [originalUser]);

  // For the top bar – override the name to "Loan Supervisor"
  const userForTopBar = useMemo(() => {
    return {
      ...originalUser,
      fullName: 'Loan Supervisor',
      name: 'Loan Supervisor',
    };
  }, [originalUser]);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [selectedSummary, setSelectedSummary] = useState('portfolio');
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [isSummaryDropdownOpen, setIsSummaryDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  const [userTasks, setUserTasks] = useState([]);


  const summaryDropdownRef = useRef(null);
  const userDropdownRef = useRef(null);

  // Custom hooks
  const {
    navigation,
    expandedMenus,
    expandedSubMenus,
    toggleSubMenu,
    toggleNestedMenu,
    handleMenuClick: handleMenuClickBase,
    handleSubMenuClick: handleSubMenuClickBase,
    handleNestedMenuClick: handleNestedMenuClickBase,
    handleReportClick: handleReportClickBase,
    getDisplayTitle,
  } = useNavigation();

  const { contentAreaRef, saveCurrentScrollPosition } = useScrollPersistence(navigation);

  // ========== HIDE ALL MENU EXCEPT DASHBOARD (UI ONLY) ==========
  // Filter menuItems to show only 'Dashboard' – all other main menu items are hidden from the sidebar
  /*const visibleMenuItems = useMemo(
    () => menuItems.filter(item => item.name === 'Dashboard'),
    [menuItems]
  );*/



const normalize = (str) =>
  str.toLowerCase().replace(/\s+/g, "_");


const visibleMenuItems = useMemo(() => {
  const dashboardMenu = menuItems.find(item => item.name === 'Dashboard');
  if (!userTasks.length) return [dashboardMenu];

  // Normalise: lowercase, spaces and special chars become underscores
  const normalise = (str) =>
    str.toLowerCase().replace(/[\s-]+/g, '_').replace(/[^a-z0-9_]/g, '');

  // Build a set of normalised task names for quick lookup
  const normalisedTasks = userTasks.map(t => normalise(t.task_name));

  // Check if a given hierarchical path (e.g., "account_create_account") is granted
  const hasPermission = (pathParts) => {
    const fullPath = pathParts.join('_');
    return normalisedTasks.some(task => task === fullPath || task.startsWith(fullPath + '_'));
  };

  const filtered = menuItems
    .filter(menu => menu.name !== 'Dashboard')
    .map((menu) => {
      const menuKey = normalise(menu.name);
      // Does the user have any task belonging to this main menu?
      const hasMainMenu = normalisedTasks.some(task => task.startsWith(menuKey));
      if (!hasMainMenu) return null;

      // Process sub‑menus
      let filteredSubMenus = null;
      if (menu.subMenus && menu.subMenus.length) {
        filteredSubMenus = menu.subMenus
          .map((sub) => {
            const subKey = normalise(sub.name);
            const fullSubPath = `${menuKey}_${subKey}`;
            const hasSubMenu = normalisedTasks.some(task => task.startsWith(fullSubPath));
            if (!hasSubMenu) return null;

            // Process nested menus inside this sub‑menu
            let filteredNested = null;
            if (sub.nestedMenus && sub.nestedMenus.length) {
              filteredNested = sub.nestedMenus.filter(nested => {
                const nestedKey = normalise(nested.name);
                const fullNestedPath = `${fullSubPath}_${nestedKey}`;
                return normalisedTasks.some(task => task.startsWith(fullNestedPath));
              });
            }

            // Process reports inside this sub‑menu
            let filteredReports = null;
            if (sub.reports && sub.reports.length) {
              filteredReports = sub.reports.filter(report => {
                const reportKey = normalise(report.name);
                const fullReportPath = `${fullSubPath}_${reportKey}`;
                return normalisedTasks.some(task => task.startsWith(fullReportPath));
              });
            }

            // Build the sub‑menu object (only keep granted children)
            const updatedSub = { ...sub };
            if (filteredNested && filteredNested.length) updatedSub.nestedMenus = filteredNested;
            else delete updatedSub.nestedMenus;

            if (filteredReports && filteredReports.length) updatedSub.reports = filteredReports;
            else delete updatedSub.reports;

            return updatedSub;
          })
          .filter(Boolean);
      }

      // Process top‑level reports directly under the main menu (e.g., Reports menu)
      let topLevelReports = null;
      if (menu.reports && menu.reports.length) {
        topLevelReports = menu.reports.filter(report => {
          const reportKey = normalise(report.name);
          const fullReportPath = `${menuKey}_${reportKey}`;
          return normalisedTasks.some(task => task.startsWith(fullReportPath));
        });
      }

      const updatedMenu = { ...menu };
      if (filteredSubMenus && filteredSubMenus.length) updatedMenu.subMenus = filteredSubMenus;
      else delete updatedMenu.subMenus;

      if (topLevelReports && topLevelReports.length) updatedMenu.reports = topLevelReports;
      else delete updatedMenu.reports;

      return updatedMenu;
    })
    .filter(Boolean);

  return [dashboardMenu, ...filtered];
}, [userTasks]);




  // Update date/time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Navigation wrappers (preserve scroll and close mobile menu)
  const handleMenuClick = useCallback(
    (item, e) => {
      if (e) e.preventDefault();
      handleMenuClickBase(item, saveCurrentScrollPosition);
      if (isMobile) setMobileMenuOpen(false);
    },
    [handleMenuClickBase, saveCurrentScrollPosition, isMobile]
  );

  const handleSubMenuClick = useCallback(
    (parentMenu, subMenuName, hasNestedOrReports, e) => {
      if (e) e.preventDefault();
      handleSubMenuClickBase(parentMenu, subMenuName, saveCurrentScrollPosition);
      if (isMobile) setMobileMenuOpen(false);
    },
    [handleSubMenuClickBase, saveCurrentScrollPosition, isMobile]
  );

  const handleNestedMenuClick = useCallback(
    (parentMenu, subMenuName, nestedMenuName, e) => {
      if (e) e.preventDefault();
      handleNestedMenuClickBase(parentMenu, subMenuName, nestedMenuName, saveCurrentScrollPosition);
      if (isMobile) setMobileMenuOpen(false);
    },
    [handleNestedMenuClickBase, saveCurrentScrollPosition, isMobile]
  );

  const handleReportClick = useCallback(
    (reportType, reportName, e) => {
      if (e) e.preventDefault();
      handleReportClickBase(reportType, reportName, saveCurrentScrollPosition);
      if (isMobile) setMobileMenuOpen(false);
    },
    [handleReportClickBase, saveCurrentScrollPosition, isMobile]
  );






  /*useEffect(() => {
  const fetchTasks = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));

     /* const response = await fetch(
        `http://localhost:5000/tasks2/${user.userId}`
      );

      const response = await fetch(
     `${process.env.REACT_APP_API_URL}/tasks2/${user.userId}`
      );

      const data = await response.json();

      setUserTasks(data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  fetchTasks();
}, []); */


useEffect(() => {
  const fetchTasks = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) return;

      const user = JSON.parse(storedUser);

      const url = `${process.env.REACT_APP_API_URL}/tasks2/${user.userId}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const data = await response.json();
      setUserTasks(data);

    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  fetchTasks();
}, []);





  // Responsive detection
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setMobileMenuOpen(false);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (summaryDropdownRef.current && !summaryDropdownRef.current.contains(event.target)) {
        setIsSummaryDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (mobileMenuOpen && !e.target.closest('.mobile-sidebar') && !e.target.closest('.mobile-menu-toggle')) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [mobileMenuOpen]);

  // User actions
  const handleProfile = useCallback(() => navigate('/admin/profile'), [navigate]);
  const handleSettings = useCallback(() => navigate('/admin/settings'), [navigate]);
  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    navigate('/access');
  }, [navigate]);

  const handleSummarySelect = useCallback((summaryType, summaryName) => {
    setSelectedSummary(summaryType);
    setShowSummaryModal(true);
    setIsSummaryDropdownOpen(false);
  }, []);

  const toggleSidebar = useCallback(() => {
    if (isMobile) setMobileMenuOpen(!mobileMenuOpen);
    else setSidebarCollapsed((prev) => !prev);
  }, [isMobile, mobileMenuOpen]);

  const handleMouseEnter = useCallback((itemId) => setHoveredItem(itemId), []);
  const handleMouseLeave = useCallback(() => setHoveredItem(null), []);

  // Helper functions for active state
  const getMenuItemId = useCallback((item, level, parent = null) => {
    if (level === 'main') return `main-${item.name}`;
    if (level === 'sub') return `sub-${parent}-${item.name}`;
    if (level === 'nested') return `nested-${parent}-${item.name}`;
    if (level === 'report') return `report-${parent}-${item.name}`;
    return item.name;
  }, []);

  const isMainMenuActive = useCallback(
    (item) =>
      navigation.activeMenu === item.name &&
      !navigation.activeSubMenu &&
      !navigation.activeNestedMenu &&
      !navigation.activeReportName,
    [navigation]
  );

  const isSubMenuActive = useCallback(
    (subItem) =>
      navigation.activeSubMenu === subItem.name &&
      !navigation.activeNestedMenu &&
      !navigation.activeReportName,
    [navigation]
  );

  const isReportActive = useCallback((reportName) => navigation.activeReportName === reportName, [navigation]);
  const isNestedActive = useCallback((nestedName) => navigation.activeNestedMenu === nestedName, [navigation]);

  // Render My Approvals Content (same as AdminDashboard)
  const renderMyApprovalsContent = useCallback(() => {
    const { activeSubMenu, activeNestedMenu } = navigation;

    if (!activeSubMenu) {
      return (
        <div className="bg-light p-4 rounded-3 text-center">
          <i className="bi bi-check2-circle fs-1 text-secondary"></i>
          <p className="mt-2 mb-0">Please select an approval category from the menu.</p>
        </div>
      );
    }

    const adminApprovals = {
      'Approve User Creation': ApproveUserCreation,
      'Approve User Edit': ApproveUserEdit,
      'Approve Role Creation': ApproveRoleCreation,
      'Approve Role Edit': ApproveRoleEdit,
      'Approve User Role': ApproveUserRole,
      'Approve User to Role Edit': ApproveUserToRoleEdit,
      'Approve User Permissions': ApproveUserPermissions,
      'Approve Role Assignment': ApproveRoleAssignment,
      'Approve Teller Limit': ApproveTellerLimit,
      'Approve Loan Threshold': ApproveLoanThreshold,
      'Approve New Loan Product': ApproveNewLoanProduct,
      'Approve Loan Product Edit': ApproveLoanProductEdit,
      'Approve New Branch': ApproveNewBranch,
      'Approve Branch Edit': ApproveBranchEdit,
    };

    const customerApprovals = {
      'Approve New Customer': ApproveNewCustomer,
      'Approve Customer Maintenance': ApproveCustomerMaintenance,
      'Approve RO Assigning': ApproveROAssigning,
      'Approve Batch Upload': ApproveBatchUpload,
    };

    const accountApprovals = {
      'Approve New Accounts': ApproveNewAccounts,
      'Approve Account Maintenance': ApproveAccountMaintenance,
      'Approve Lien': ApproveLien,
    };

    const loanApprovals = {
      'Loans Awaiting Approvals': AwaitingApproval,
      'Approved Loans': ApprovedLoans,
      'Approve New Individual Loan': ApproveNewIndividualLoan,
      'Approve Corporate Loan': ApproveCorporateLoan,
      'Approve Group Loan': ApproveGroupLoan,
      'Approve Loan Maintenance': ApproveLoanMaintenance,
      'Approve Loan Disbursement': ApproveLoanDisbursement,
    };

    const tellerApprovals = {
      'Approve Till Transfer': ApproveTillTransfer,
      'Approve Backdated Till Transfer': ApproveBackdatedTillTransfer,
      'Approve Cash Deposit Reversal': ApproveCashDepositReversal,
      'Approve Cash Withdrawal Reversal': ApproveCashWithdrawalReversal,
      'Approve Teller Shortage & Overage': ApproveTellerShortageOverage,
      'Approve Backdated deposit': ApproveBackdatedDeposit,
      'Approve Backdated withdrawals': ApproveBackdatedWithdrawals,
    };

    const internalAccountsApprovals = {
      'Approve GL Account Creation': ApproveGLAccountCreation,
      'Approve GL Account Edit': ApproveGLAccountEdit,
      'Approve Internal Transfers': ApproveInternalTransfers,
      'Approve Manual GL Postings': ApproveManualGLPostings,
      'Approve Fund Transfer': ApproveFundTransfer,
      'Approve Backdated FTs': ApproveBackdatedFts,
    };

    const batchUploadApprovals = {
      'Approve Customer Upload': ApproveCustomerUpload,
      'Approve Account Upload': ApproveAccountUpload,
      'Approve Loan Upload': ApproveLoanUpload,
      'Approve Disbursement Upload': ApproveDisbursementUpload,
      'Approve Repayment Upload': ApproveRepaymentUpload,
      'Approve Charges Upload': ApproveChargesUpload,
      'Approve GL Adjustments': ApproveGLAdjustments,
      'Approve Branch Reassignment': ApproveBranchReassignment,
      'Approve RO Reassignment': ApproveROReassignment,
      'Approve Picture Uploads': ApprovePictureUploads,
      'Approve ID Uploads': ApproveIDUploads,
    };

    if (activeSubMenu === 'Admin' && adminApprovals[activeNestedMenu]) {
      const Component = adminApprovals[activeNestedMenu];
      return <Component />;
    }

    if (activeSubMenu === 'Customer' && customerApprovals[activeNestedMenu]) {
      const Component = customerApprovals[activeNestedMenu];
      return <Component />;
    }

    if (activeSubMenu === 'Account' && accountApprovals[activeNestedMenu]) {
      const Component = accountApprovals[activeNestedMenu];
      return <Component />;
    }

    if (activeSubMenu === 'Loans' && loanApprovals[activeNestedMenu]) {
      const Component = loanApprovals[activeNestedMenu];
      return <Component />;
    }

    if (activeSubMenu === 'Collections' && activeNestedMenu === 'Approve Daily Collections') {
      return <ApproveDailyCollections />;
    }

    if (activeSubMenu === 'Teller' && tellerApprovals[activeNestedMenu]) {
      const Component = tellerApprovals[activeNestedMenu];
      return <Component />;
    }

    if (activeSubMenu === 'Internal Accounts' && internalAccountsApprovals[activeNestedMenu]) {
      const Component = internalAccountsApprovals[activeNestedMenu];
      return <Component />;
    }

    if (activeSubMenu === 'Batch Uploads' && batchUploadApprovals[activeNestedMenu]) {
      const Component = batchUploadApprovals[activeNestedMenu];
      return <Component />;
    }

    return (
      <div className="bg-light p-4 rounded-3 text-center">
        <i className="bi bi-check2-circle fs-1 text-secondary"></i>
        <p className="mt-2 mb-0">Please select an approval category from the menu.</p>
      </div>
    );
  }, [navigation]);

    // ---------- Render content ----------
  const renderContent = useCallback(() => {
    const { activeMenu, activeSubMenu, activeNestedMenu, activeReportName } = navigation;

    // Dashboard Section – use the extracted component
    if (activeMenu === 'Dashboard') {
      return <DashboardContent realUserName={realUserName} user={originalUser} />;
    }

    // Customer Section
    if (activeMenu === 'Customer') {
      if (activeSubMenu === 'Create Customer') {
        const customerTypes = {
          'Individual Customer': IndividualCustomer,
          'Corporate Customer': CorporateCustomer,
          'Solidarity Group': JointAccount,
        };
        if (activeNestedMenu && customerTypes[activeNestedMenu]) {
          const Component = customerTypes[activeNestedMenu];
          return <Component />;
        }
        return (
          <div className="bg-light p-4 rounded-3 text-center">
            <i className="bi bi-person-plus fs-1 text-secondary"></i>
            <p className="mt-2 mb-0">Please select a customer type to create.</p>
          </div>
        );
      }

      const customerComponents = {
        'Customer Maintenance': CustomerMaintenance,
        'Enquiries': Enquiries,
      };
      if (activeSubMenu && customerComponents[activeSubMenu]) {
        const Component = customerComponents[activeSubMenu];
        return <Component />;
      }
      return (
        <div className="bg-light p-4 rounded-3 text-center">
          <i className="bi bi-people fs-1 text-secondary"></i>
          <p className="mt-2 mb-0">Please select a customer management option from the menu.</p>
        </div>
      );
    }

    // Account Section
    if (activeMenu === 'Account') {
      const accountComponents = {
        'Create Account': CreateAccount,
        'Edit Account': EditAccount,
        'Account List': AccountList,
        'Set or Release Lien': SetReleaseLien,
        'Account Enquiry': AccountEnquiry,
        'Account Statement': AccountStatement,
        'Close Account': CloseAccount,
      };
      if (activeSubMenu && accountComponents[activeSubMenu]) {
        const Component = accountComponents[activeSubMenu];
        return <Component />;
      }
      return (
        <div className="bg-light p-4 rounded-3 text-center">
          <i className="bi bi-bank fs-1 text-secondary"></i>
          <p className="mt-2 mb-0">Please select an account management option from the menu.</p>
        </div>
      );
    }

    // Teller Section
    if (activeMenu === 'Teller') {
      if (activeSubMenu === 'Deposit') {
        const depositComponents = {
          'Deposit': TellerDeposit,
          'Reverse Deposit': ReverseDeposit,
        };
        if (activeNestedMenu && depositComponents[activeNestedMenu]) {
          const Component = depositComponents[activeNestedMenu];
          return <Component />;
        }
        return <TellerDeposit />;
      }

      if (activeSubMenu === 'Withdrawals') {
        const withdrawalComponents = {
          'Withdraw': TellerWithdraw,
          'Reverse Withdrawal': ReverseWithdrawal,
        };
        if (activeNestedMenu && withdrawalComponents[activeNestedMenu]) {
          const Component = withdrawalComponents[activeNestedMenu];
          return <Component />;
        }
        return <TellerWithdraw />;
      }

      if (activeSubMenu === 'Till Management') {
        const tillComponents = {
          'Till Status': TillStatus,
          'Open or Close Till': OpenCloseTill,
          'Till Transfer': TillTransfer,
          'Reverse Till Transfer': ReverseTillTransfer,
          'Till Statement': TillStatement,
        };
        if (activeNestedMenu && tillComponents[activeNestedMenu]) {
          const Component = tillComponents[activeNestedMenu];
          return <Component />;
        }
        return <TillStatus />;
      }

      if (activeSubMenu === 'Back Dates') {
        const backdateComponents = {
          'Backdated Deposit': BackdatedDeposit,
          'Backdated Withdrawal': BackdatedWithdrawal,
          'Backdated Entry Reversal': BackdatedEntryReversal,
        };
        if (activeNestedMenu && backdateComponents[activeNestedMenu]) {
          const Component = backdateComponents[activeNestedMenu];
          return <Component />;
        }
        return <BackdatedDeposit />;
      }

      if (activeSubMenu === 'Call Over') return <CallOver />;
      if (activeSubMenu === 'Teller Summary') return <TellerSummary />;

      return (
        <div className="bg-light p-4 rounded-3 text-center">
          <i className="bi bi-cash-stack fs-1 text-secondary"></i>
          <p className="mt-2 mb-0">Please select a teller transaction option from the menu.</p>
        </div>
      );
    }

    // Loans Section
    if (activeMenu === 'Loans') {
      const loanComponents = {
        'Loan Application': LoanApplication,
        'Web Loan': ApproveWebLoanApplication,
        'Edit Loan Application': EditLoanApplication,
        'Edit Loan Evaluation': EditLoanEvaluation,
        'Loan Evaluation': LoanApproval,
        'Loan Disbursement': LoanDisbursement,
        'Disburse Loan List': DisburseLoanList,
        'Loan Repayment': LoanRepayment,
        'Expected Repayments': ExpectedRepayments,
        'Due Repayments': DueRepayments,
        'View Loan': ViewLoan,
        'Reverse Loan': ReverseLoan,
        'Terminate Loan': TerminateLoan,
        'Loan Reschedule': LoanReschedule,
      };
      if (activeSubMenu && loanComponents[activeSubMenu]) {
        const Component = loanComponents[activeSubMenu];
        return <Component />;
      }
      return (
        <div className="bg-light p-4 rounded-3 text-center">
          <i className="bi bi-piggy-bank fs-1 text-secondary"></i>
          <p className="mt-2 mb-0">Please select a loan management option from the menu.</p>
        </div>
      );
    }

    // Investment Section
    if (activeMenu === 'Investment') {
      const investmentComponents = {
        'New Investment': NewInvestment,
        'Manage Investment': ManageInvestment,
        'Investment Redemption': InvestmentRedemption,
        'Enquiries': InvestmentEnquiries,
      };
      if (activeSubMenu && investmentComponents[activeSubMenu]) {
        const Component = investmentComponents[activeSubMenu];
        return <Component />;
      }
      return (
        <div className="bg-light p-4 rounded-3 text-center">
          <i className="bi bi-graph-up fs-1 text-secondary"></i>
          <p className="mt-2 mb-0">Please select an investment option from the menu.</p>
        </div>
      );
    }

    // Internal Accounts Section
    if (activeMenu === 'Internal Accounts') {
      if (activeSubMenu === 'Fund Transfer') {
        const fundTransferComponents = {
          'Create Fund Transfer': CreateFundTransfer,
          'Create Backdated FT': CreateBackdatedFT,
          'List of Fund Transfers': ListFundTransfers,
        };
        if (activeNestedMenu && fundTransferComponents[activeNestedMenu]) {
          const Component = fundTransferComponents[activeNestedMenu];
          return <Component />;
        }
        return <CreateFundTransfer />;
      }

      if (activeSubMenu === 'Lien') {
        const lienComponents = {
          'Set Lien': SetLien,
          'Release Lien': ReleaseLien,
          'Enquiries': LienEnquiries,
        };
        if (activeNestedMenu && lienComponents[activeNestedMenu]) {
          const Component = lienComponents[activeNestedMenu];
          return <Component />;
        }
        return <SetLien />;
      }

      const internalComponents = {
        'GL Accounts': GLAccounts,
        'Internal Transfers': InternalTransfers,
        'Internal Account Statement': InternalAccountStatement,
      };
      if (activeSubMenu && internalComponents[activeSubMenu]) {
        const Component = internalComponents[activeSubMenu];
        return <Component />;
      }
      return (
        <div className="bg-light p-4 rounded-3 text-center">
          <i className="bi bi-diagram-3 fs-1 text-secondary"></i>
          <p className="mt-2 mb-0">Please select an internal accounts option from the menu.</p>
        </div>
      );
    }

    // Admin Section
    if (activeMenu === 'Admin') {
      const adminComponents = {
        'User Management': UserManagement,
        'Add Roles': Roles,
      };
      if (activeSubMenu && adminComponents[activeSubMenu]) {
        const Component = adminComponents[activeSubMenu];
        return <Component />;
      }
      return (
        <div className="bg-light p-4 rounded-3 text-center">
          <i className="bi bi-shield-lock fs-1 text-secondary"></i>
          <p className="mt-2 mb-0">Please select an admin option from the menu.</p>
        </div>
      );
    }

    // My Approvals Section
    if (activeMenu === 'My Approvals') {
      return renderMyApprovalsContent();
    }

    // Reports Section
    if (activeMenu === 'Reports') {
      const reportComponents = {
        'Loan Portfolio Report': LoanPortfolioReport,
        'Approved Loans Report': ApprovedLoansReport,
        'Loan Disbursement Report': LoanDisbursementReport,
        'Loan Repayment Report': LoanRepaymentReport,
        'Loan Arrears Report': LoanArrearsReport,
        'Portfolio At Risk (PAR) Report': PortfolioAtRiskReport,
        'Non-Performing Loans Report': NonPerformingLoansReport,
        'Loan Aging Analysis Report': LoanAgingAnalysisReport,
        'Written-Off Loans Report': WrittenOffLoansReport,
        'Customer Master List': CustomerMasterList,
        'New Customers Report': NewCustomersReport,
        'Active Customers Report': ActiveCustomersReport,
        'Dormant Customers Report': DormantCustomersReport,
        'Customer by Branch Report': CustomerByBranchReport,
        'Customer by Relationship Officer Report': CustomerByRelationshipOfficerReport,
        'Pending KYC Report': PendingKYCReport,
        'Verified KYC Report': VerifiedKYCReport,
        'Rejected KYC Report': RejectedKYCReport,
        'Expired ID Report': ExpiredIDReport,
        'PEP Screening Report': PEPScreeningReport,
        'High Risk Customer Report': HighRiskCustomerReport,
        'Daily Teller Transactions Report': DailyTellerTransactionsReport,
        'Deposit Report': DepositReport,
        'Withdrawal Report': WithdrawalReport,
        'Teller Balancing Report': TellerBalancingReport,
        'Branch Cash Summary Report': BranchCashSummaryReport,
        'Savings Account Listing': SavingsAccountListing,
        'New Accounts Opened Report': NewAccountsOpenedReport,
        'Closed Accounts Report': ClosedAccountsReport,
        'Dormant Accounts Report': DormantAccountsReport,
        'Account Balance Report': AccountBalanceReport,
        'Collection Performance Report': CollectionPerformanceReport,
        'Expected vs Actual Collections': ExpectedVsActualCollections,
        'Daily Collection Sheet': DailyCollectionSheet,
        'Missed Payment Report': MissedPaymentReport,
        'Recovery Follow-up Report': RecoveryFollowUpReport,
        'Portfolio At Risk Report': PortfolioAtRiskReportRisk,
        'PAR > 30 Days Report': PARGreaterThan30DaysReport,
        'Delinquency Trend Report': DelinquencyTrendReport,
        'Top Exposure Customers Report': TopExposureCustomersReport,
        'Pending Customer Authorization': PendingCustomerAuthorization,
        'Pending Loan Authorization': PendingLoanAuthorization,
        'Pending Account Authorization': PendingAccountAuthorization,
        'Revenue Report': RevenueReport,
        'Expense Report': ExpenseReport,
        'Revenue vs Expense': RevenueVsExpenseReport,
        'GL Transaction Report': GLTransactionReport,
      };

      if (activeReportName && reportComponents[activeReportName]) {
        const Component = reportComponents[activeReportName];
        return <Component />;
      }

      const categoryComponents = {
        'Loan Reports': LoanReports,
        'Customer Reports': CustomerReports,
        'KYC & Compliance Reports': KYCComplianceReports,
        'Teller Reports': TellerReports,
        'Savings / Account Reports': SavingsAccountReports,
        'Collection Reports': CollectionReports,
        'Risk Reports': RiskReports,
        'Authorization Reports': AuthorizationReports,
        'Financial Reports': FinancialReports,
        'Internal Account / GL Reports': InternalAccountGLReports,
      };

      if (activeSubMenu && categoryComponents[activeSubMenu]) {
        const Component = categoryComponents[activeSubMenu];
        return <Component />;
      }

      return (
        <div className="bg-light p-4 rounded-3 text-center">
          <i className="bi bi-file-bar-graph fs-1 text-secondary"></i>
          <p className="mt-2 mb-0">Please select a report type from the menu.</p>
        </div>
      );
    }

    // Batch Upload Section
    if (activeMenu === 'Batch Upload') {
      const batchComponents = {
        'Upload Customers': UploadCustomers,
        'Upload Loans': UploadLoans,
      };
      if (activeSubMenu && batchComponents[activeSubMenu]) {
        const Component = batchComponents[activeSubMenu];
        return <Component />;
      }
      return (
        <div className="bg-light p-4 rounded-3 text-center">
          <i className="bi bi-cloud-upload fs-1 text-secondary"></i>
          <p className="mt-2 mb-0">Please select a batch upload option from the menu.</p>
        </div>
      );
    }

    // System Settings Section
    if (activeMenu === 'System Settings') {
      const settingsComponents = {
        'Branches': Branches,
        'Configurations': Configurations,
      };
      if (activeSubMenu && settingsComponents[activeSubMenu]) {
        const Component = settingsComponents[activeSubMenu];
        return <Component />;
      }
      return (
        <div className="bg-light p-4 rounded-3 text-center">
          <i className="bi bi-gear fs-1 text-secondary"></i>
          <p className="mt-2 mb-0">Please select a system settings option from the menu.</p>
        </div>
      );
    }

    // Fallback (should not happen)
    return (
      <div className="bg-light p-4 rounded-3 text-center">
        <i className={`bi ${menuItems.find(m => m.name === activeMenu)?.icon || 'bi-grid'} fs-1 text-secondary`}></i>
        <p className="mt-2 mb-0">Manage your {activeMenu.toLowerCase()} here.</p>
      </div>
    );
  }, [navigation, renderMyApprovalsContent, realUserName, originalUser]);

  const formatDateTime = (date) => {
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };
    return date.toLocaleString(undefined, options);
  };

  // ---------- Main Render ----------
  return (
    <>
      <TopNavbar
        getDisplayTitle={getDisplayTitle}
        sidebarCollapsed={sidebarCollapsed}
        isMobile={isMobile}
        toggleSidebar={toggleSidebar}
        isSummaryDropdownOpen={isSummaryDropdownOpen}
        setIsSummaryDropdownOpen={setIsSummaryDropdownOpen}
        summaryDropdownRef={summaryDropdownRef}
        handleSummarySelect={handleSummarySelect}
        isUserDropdownOpen={isUserDropdownOpen}
        setIsUserDropdownOpen={setIsUserDropdownOpen}
        userDropdownRef={userDropdownRef}
        handleProfile={handleProfile}
        handleSettings={handleSettings}
        handleLogout={handleLogout}
        currentDateTime={formatDateTime(currentDateTime)}
        user={userForTopBar}
      />

      <SummaryModal show={showSummaryModal} summaryType={selectedSummary} onClose={() => setShowSummaryModal(false)} />

      <div className="d-flex vh-100 overflow-hidden" style={{ marginTop: '70px' }}>
        {/* Desktop Sidebar */}
        {!isMobile && (
          <div
            className={`bg-dark text-white d-flex flex-column flex-shrink-0 transition-all ${
              sidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'
            }`}
            style={{ width: sidebarCollapsed ? '80px' : '280px', transition: 'width 0.3s ease' }}
          >
            <Sidebar
              sidebarCollapsed={sidebarCollapsed}
              isMobile={isMobile}
              expandedMenus={expandedMenus}
              expandedSubMenus={expandedSubMenus}
              hoveredItem={hoveredItem}
              menuItems={visibleMenuItems}  // <-- Only Dashboard is visible
              navigation={navigation}
              toggleSubMenu={toggleSubMenu}
              toggleNestedMenu={toggleNestedMenu}
              handleMenuClick={handleMenuClick}
              handleSubMenuClick={handleSubMenuClick}
              handleReportClick={handleReportClick}
              handleNestedMenuClick={handleNestedMenuClick}
              handleMouseEnter={handleMouseEnter}
              handleMouseLeave={handleMouseLeave}
              getMenuItemId={getMenuItemId}
              isMainMenuActive={isMainMenuActive}
              isSubMenuActive={isSubMenuActive}
              isReportActive={isReportActive}
              isNestedActive={isNestedActive}
              toggleSidebar={toggleSidebar}
              setMobileMenuOpen={setMobileMenuOpen}
            />
          </div>
        )}

        {/* Mobile Sidebar Overlay */}
        {isMobile && mobileMenuOpen && (
          <>
            <div
              className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
              style={{ zIndex: 1040 }}
              onClick={() => setMobileMenuOpen(false)}
            />
            <div
              className="mobile-sidebar position-fixed top-0 start-0 h-100 bg-dark text-white d-flex flex-column"
              style={{ width: '280px', zIndex: 1045, transition: 'transform 0.3s ease', transform: 'translateX(0)' }}
            >
              <Sidebar
                sidebarCollapsed={false}
                isMobile={isMobile}
                expandedMenus={expandedMenus}
                expandedSubMenus={expandedSubMenus}
                hoveredItem={hoveredItem}
                menuItems={visibleMenuItems}  // <-- Only Dashboard is visible
                navigation={navigation}
                toggleSubMenu={toggleSubMenu}
                toggleNestedMenu={toggleNestedMenu}
                handleMenuClick={handleMenuClick}
                handleSubMenuClick={handleSubMenuClick}
                handleReportClick={handleReportClick}
                handleNestedMenuClick={handleNestedMenuClick}
                handleMouseEnter={handleMouseEnter}
                handleMouseLeave={handleMouseLeave}
                getMenuItemId={getMenuItemId}
                isMainMenuActive={isMainMenuActive}
                isSubMenuActive={isSubMenuActive}
                isReportActive={isReportActive}
                isNestedActive={isNestedActive}
                toggleSidebar={toggleSidebar}
                setMobileMenuOpen={setMobileMenuOpen}
              />
            </div>
          </>
        )}

        {/* Main Content Area */}
        <div className="d-flex flex-column flex-grow-1 bg-light" style={{ height: 'calc(100vh - 70px)', overflow: 'hidden' }}>
          <div ref={contentAreaRef} className="dashboard-content-area">
            <div className="p-3 p-md-4">
              <div className="card border-0 shadow-sm mb-3 mb-md-4">
                <div className="card-body bg-primary bg-opacity-10 rounded-3 p-3 p-md-4">
                  <h4 className="mb-2 fs-5 fs-md-4">Welcome back, {realUserName}!</h4>
                  <p className="mb-0 text-secondary small">
                    You are currently viewing: <strong>{getDisplayTitle()}</strong>
                  </p>
                </div>
              </div>

              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-0 py-3">
                  <h5 className="mb-0 fw-semibold fs-6 fs-md-5">{getDisplayTitle()} Section</h5>
                </div>
                <div className="card-body p-3 p-md-4">{renderContent()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoanSupervisorDashboard;