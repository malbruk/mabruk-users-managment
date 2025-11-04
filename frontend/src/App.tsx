import { Navigate, Route, Routes } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { SubscriptionAssignment } from './pages/SubscriptionAssignment';
import { PricingReports } from './pages/PricingReports';
import { useAuth } from './state/useAuth';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';

const App = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/subscriptions" element={<SubscriptionAssignment />} />
        <Route path="/pricing-reports" element={<PricingReports />} />
      </Routes>
    </Layout>
  );
};

export default App;
