import { useCallback, useEffect, type ReactNode } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { PortalProvider, usePortal } from './context/PortalContext'
import { AuthProvider, authRoleToPortal, getStoredAuthRole } from './context/AuthContext'
import Layout from './components/Layout'
import { ProtectedRoute, GuestRoute } from './components/ProtectedRoute'
import { PortalRoute, AdminOnly, ClientOnly } from './components/PortalRoute'
import LoginPage from './pages/LoginPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import CreateAccount from './pages/admin/CreateAccount'
import AdminAlerts from './pages/admin/AdminAlerts'
import AsgAdminPage from './pages/admin/AsgAdminPage'
import AsgDashboard from './pages/client/AsgDashboard'
import ClientProducts from './pages/client/ClientProducts'
import ClientOrder from './pages/client/ClientOrder'
import ClientTracking from './pages/client/ClientTracking'
import ClientBilling from './pages/client/ClientBilling'
import IvrPage from './pages/IvrPage'
import MarketingLayout from './marketing/MarketingLayout'
import {
  MarketingAboutPage,
  MarketingContactPage,
  MarketingHomePage,
  MarketingPartnerPage,
  MarketingPrivacyPage,
  MarketingProductsPage,
  MarketingTermsPage,
} from './marketing/marketingPages'
import { runDataMigration } from './lib/dataMigration'
import { seedSampleData } from './data/seed'

runDataMigration()
seedSampleData()

function AuthProviderWrapper({ children }: { children: ReactNode }) {
  const { setPortal } = usePortal()

  const onRoleChange = useCallback(
    (role: ReturnType<typeof getStoredAuthRole>) => {
      setPortal(authRoleToPortal(role))
    },
    [setPortal],
  )

  useEffect(() => {
    const session = getStoredAuthRole()
    if (session) setPortal(authRoleToPortal(session))
  }, [setPortal])

  return <AuthProvider onRoleChange={onRoleChange}>{children}</AuthProvider>
}

export default function App() {
  return (
    <PortalProvider>
      <AuthProviderWrapper>
        <BrowserRouter>
          <Routes>
            <Route element={<MarketingLayout />}>
              <Route path="/" element={<MarketingHomePage />} />
              <Route path="/about" element={<MarketingAboutPage />} />
              <Route path="/products" element={<MarketingProductsPage />} />
              <Route path="/partner-with-us" element={<MarketingPartnerPage />} />
              <Route path="/contact" element={<MarketingContactPage />} />
              <Route path="/privacy-policy" element={<MarketingPrivacyPage />} />
              <Route path="/terms-of-service" element={<MarketingTermsPage />} />
            </Route>

            <Route
              path="/login"
              element={
                <GuestRoute>
                  <LoginPage />
                </GuestRoute>
              }
            />

            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route
                path="/dashboard"
                element={<PortalRoute admin={<AdminDashboard />} client={<AsgDashboard />} />}
              />
              <Route path="/accounts" element={<AdminOnly><CreateAccount /></AdminOnly>} />
              <Route path="/alerts" element={<AdminOnly><AdminAlerts /></AdminOnly>} />
              <Route
                path="/asg-data"
                element={
                  <PortalRoute
                    admin={<AsgAdminPage />}
                    client={<Navigate to="/dashboard" replace />}
                  />
                }
              />
              <Route path="/catalog" element={<ClientOnly><ClientProducts /></ClientOnly>} />
              <Route path="/order" element={<ClientOnly><ClientOrder /></ClientOnly>} />
              <Route path="/tracking" element={<ClientOnly><ClientTracking /></ClientOnly>} />
              <Route path="/billing" element={<ClientOnly><ClientBilling /></ClientOnly>} />
              <Route path="/ivr" element={<IvrPage />} />
              <Route path="/asg" element={<Navigate to="/dashboard" replace />} />
              <Route path="/asg/dashboard" element={<Navigate to="/dashboard" replace />} />
              <Route path="/skin-substitutes" element={<Navigate to="/tracking" replace />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProviderWrapper>
    </PortalProvider>
  )
}
