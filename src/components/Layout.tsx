import { Flag } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';

type NavigationItem = {
  href: string;
  label: string;
};

const navigation: NavigationItem[] = [
  { href: '/', label: 'Overview' },
  { href: '/standings', label: 'Standings' },
  { href: '/races', label: 'Races' },
];

export default function Layout() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <NavLink className="brand" to="/" aria-label="F1 SeasonViewer home">
          <span className="brand-mark">
            <Flag size={20} aria-hidden="true" />
          </span>
          <strong>F1 SeasonViewer</strong>
        </NavLink>

        <nav className="site-nav" aria-label="Main navigation">
          {navigation.map((item) => (
            <NavLink
              className={({ isActive }) =>
                isActive ? 'nav-link nav-link-active' : 'nav-link'
              }
              end={item.href === '/'}
              key={item.href}
              to={item.href}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="app-main">
        <Outlet />
      </main>

      <footer className="site-footer">
        <span>Unofficial Formula 1 exam project</span>
        <span>Data from Jolpica-F1</span>
      </footer>
    </div>
  );
}
