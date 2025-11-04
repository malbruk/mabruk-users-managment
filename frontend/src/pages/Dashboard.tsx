import { useQuery } from '@tanstack/react-query';
import { fetchDashboardSummary } from '../api/client';
import { useDashboardStore } from '../state/store';

export const Dashboard = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: fetchDashboardSummary
  });
  const { selectedUserId, setSelectedUserId } = useDashboardStore();

  if (isLoading) {
    return <div className="section">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="section">Unable to load dashboard data.</div>;
  }

  return (
    <div className="section">
      <header>
        <h2>Usage Overview</h2>
        <p>Monitor user access, engagement, and subscription activity.</p>
      </header>
      <table>
        <thead>
          <tr>
            <th>User</th>
            <th>Email</th>
            <th>Active Subscriptions</th>
            <th>Last Login</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((user) => (
            <tr
              key={user.id}
              className={selectedUserId === user.id ? 'active-row' : ''}
              onClick={() => setSelectedUserId(user.id)}
            >
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>
                <span className="badge">
                  {user.activeSubscriptions} active
                </span>
              </td>
              <td>{new Date(user.lastLogin).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
