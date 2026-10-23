import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AdminAuthProvider, RequireAdmin } from './admin/AdminAuth'
import AdminLayout from './admin/AdminLayout'
import BrandingPage from './admin/pages/BrandingPage'
import ClientDetailPage from './admin/pages/ClientDetailPage'
import ClientsPage from './admin/pages/ClientsPage'
import DashboardPage from './admin/pages/DashboardPage'
import KycPage from './admin/pages/KycPage'
import AdminLoginPage from './admin/pages/LoginPage'
import TeamPage from './admin/pages/TeamPage'
import AccountTypesSettings from './admin/settings/AccountTypesSettings'
import EmailSettings from './admin/settings/EmailSettings'
import GeneralSettings from './admin/settings/GeneralSettings'
import KycSettings from './admin/settings/KycSettings'
import PaymentsSettings from './admin/settings/PaymentsSettings'
import SecuritySettings from './admin/settings/SecuritySettings'
import ServersSettings from './admin/settings/ServersSettings'
import SettingsLayout from './admin/settings/SettingsLayout'
import SmsSettings from './admin/settings/SmsSettings'
import AdminTicketsPage from './admin/pages/TicketsPage'
import AdminTransactionsPage from './admin/pages/TransactionsPage'
import RequireAuth from './components/RequireAuth'
import { ToastProvider } from './components/Toast'
import { AuthProvider } from './context/AuthContext'
import { BrandProvider } from './context/BrandContext'
import { VerificationProvider } from './features/verification/VerificationContext'
import PortalLayout from './layouts/PortalLayout'
import AccountsPage from './pages/Accounts/AccountsPage'
import AuthPage from './pages/Auth/AuthPage'
import DepositPage from './pages/Deposit/DepositPage'
import Landing from './pages/Landing/Landing'
import OpenAccountPage from './pages/OpenAccount/OpenAccountPage'
import OrdersHistoryPage from './pages/OrdersHistory/OrdersHistoryPage'
import PerformancePage from './pages/Performance/PerformancePage'
import Placeholder from './pages/Placeholder'
import SecurityPage from './pages/Security/SecurityPage'
import NewTicketPage from './pages/Support/NewTicketPage'
import SupportHubPage from './pages/Support/SupportHubPage'
import TransactionsPage from './pages/Transactions/TransactionsPage'
import TransferPage from './pages/Transfer/TransferPage'
import VerificationPage from './pages/Verification/VerificationPage'

// Multi-tenant: pass loadBrand to fetch the tenant's brand at startup, e.g.
//   const loadBrand = () => fetch(`/api/tenants/${location.hostname}/brand`).then((r) => r.json())
//   <BrandProvider loadBrand={loadBrand}>
export default function App() {
  return (
    <BrandProvider>
      <AuthProvider>
        <BrowserRouter>
          <ToastProvider>
            <AdminAuthProvider>
              <VerificationProvider>
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/accounts/sign-in" element={<AuthPage mode="sign-in" />} />
                  <Route path="/accounts/sign-up" element={<AuthPage mode="sign-up" />} />

                  {/* Full-screen authenticated pages (no sidebar) */}
                  <Route
                    path="/pa/new-account"
                    element={
                      <RequireAuth>
                        <OpenAccountPage />
                      </RequireAuth>
                    }
                  />

                  <Route
                    path="/pa"
                    element={
                      <RequireAuth>
                        <PortalLayout />
                      </RequireAuth>
                    }
                  >
                    <Route index element={<Navigate to="trading/accounts" replace />} />
                    <Route path="trading/accounts" element={<AccountsPage />} />
                    <Route path="trading/performance" element={<PerformancePage />} />
                    <Route path="trading/history" element={<OrdersHistoryPage />} />
                    <Route path="payments-and-wallet/deposit" element={<DepositPage />} />
                    <Route path="payments-and-wallet/transfer" element={<TransferPage />} />
                    <Route path="payments-and-wallet/history" element={<TransactionsPage />} />
                    <Route path="support" element={<SupportHubPage />} />
                    <Route path="support/tickets/new" element={<NewTicketPage />} />
                    <Route path="profile/verification" element={<VerificationPage />} />
                    <Route path="profile/security" element={<SecurityPage />} />
                    <Route path="*" element={<Placeholder />} />
                  </Route>

                  {/* Back office */}
                  <Route path="/admin/login" element={<AdminLoginPage />} />
                  <Route
                    path="/admin"
                    element={
                      <RequireAdmin>
                        <AdminLayout />
                      </RequireAdmin>
                    }
                  >
                    <Route index element={<DashboardPage />} />
                    <Route
                      path="clients"
                      element={
                        <RequireAdmin area="clients">
                          <ClientsPage />
                        </RequireAdmin>
                      }
                    />
                    <Route
                      path="clients/:id"
                      element={
                        <RequireAdmin area="clients">
                          <ClientDetailPage />
                        </RequireAdmin>
                      }
                    />
                    <Route
                      path="kyc"
                      element={
                        <RequireAdmin area="kyc">
                          <KycPage />
                        </RequireAdmin>
                      }
                    />
                    <Route
                      path="transactions"
                      element={
                        <RequireAdmin area="transactions">
                          <AdminTransactionsPage />
                        </RequireAdmin>
                      }
                    />
                    <Route
                      path="tickets"
                      element={
                        <RequireAdmin area="tickets">
                          <AdminTicketsPage />
                        </RequireAdmin>
                      }
                    />
                    <Route
                      path="settings"
                      element={
                        <RequireAdmin area="settings">
                          <SettingsLayout />
                        </RequireAdmin>
                      }
                    >
                      <Route index element={<Navigate to="general" replace />} />
                      <Route path="general" element={<GeneralSettings />} />
                      <Route path="branding" element={<BrandingPage />} />
                      <Route path="team" element={<TeamPage />} />
                      <Route path="servers" element={<ServersSettings />} />
                      <Route path="account-types" element={<AccountTypesSettings />} />
                      <Route path="payments" element={<PaymentsSettings />} />
                      <Route path="email" element={<EmailSettings />} />
                      <Route path="sms" element={<SmsSettings />} />
                      <Route path="kyc" element={<KycSettings />} />
                      <Route path="security" element={<SecuritySettings />} />
                    </Route>
                    <Route path="*" element={<Navigate to="/admin" replace />} />
                  </Route>

                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </VerificationProvider>
            </AdminAuthProvider>
          </ToastProvider>
        </BrowserRouter>
      </AuthProvider>
    </BrandProvider>
  )
}
