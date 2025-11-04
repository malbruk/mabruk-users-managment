import { Link, useLocation } from 'react-router-dom';
import { ReactNode } from 'react';
import { useAuth } from '../state/useAuth';

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/subscriptions', label: 'Subscriptions' },
  { to: '/pricing-reports', label: 'Pricing Reports' }
];

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h1>Mabruk</h1>
        <nav>
          <ul>
            {links.map((link) => (
              <li key={link.to} className={location.pathname === link.to ? 'active' : ''}>
                <Link to={link.to}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <button type="button" onClick={logout} className="logout-btn">
          Log out
        </button>
      </aside>
      <main className="content">{children}</main>
    </div>
  );
};
