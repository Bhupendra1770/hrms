// import { Link, Outlet, useLocation } from 'react-router-dom'
// import { useAuth } from '../context/AuthContext'

// export default function Layout() {
//   const { logout, user, isAdmin } = useAuth()
//   const location = useLocation()

//   const navItems = [
//     { path: '/', label: 'Dashboard', icon: '◫' },
//     { path: '/employees', label: isAdmin ? 'Employees' : 'My Profile', icon: '👥' },
//     ...(isAdmin ? [{ path: '/departments', label: 'Departments', icon: '▦' }] : []),
//     { path: '/attendance', label: isAdmin ? 'Attendance' : 'My Attendance', icon: '✓' },
//     { path: '/leaves', label: 'Leaves', icon: '☾' },
//     { path: '/announcements', label: 'Announcements', icon: '✦' },
//     { path: '/holidays', label: 'Holidays', icon: '✺' },
//     ...(isAdmin ? [{ path: '/reports', label: 'Reports', icon: '◌' }] : []),
//   ]

//   return (
//     <div className="app-shell">
//       <aside className="sidebar">
//         <div className="brand-badge">
//           <span className="brand-dot" />
//           <strong>People OS</strong>
//         </div>
//         <h2 className="sidebar-title">HRMS Portal</h2>
//         <p className="sidebar-copy">Modern workspace for workforce analytics, approvals, attendance and people operations.</p>

//         <nav className="nav-grid">
//           {navItems.map((item) => (
//             <Link
//               key={item.path}
//               to={item.path}
//               className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
//             >
//               <span aria-hidden="true" style={{ width: 20, textAlign: 'center' }}>{item.icon}</span>
//               <span>{item.label}</span>
//             </Link>
//           ))}
//         </nav>

//         <div className="mini-panel" style={{ marginTop: 18 }}>
//           <div className="label">Signed in as</div>
//           <div className="value" style={{ fontSize: 22 }}>{user?.full_name || 'HR user'}</div>
//           <div style={{ color: '#9fb0d4', marginTop: 6, fontSize: 13, textTransform: 'capitalize' }}>Role: {user?.role || 'employee'}</div>
//         </div>

//         <button onClick={logout} className="logout-btn">Logout</button>
//       </aside>

//       <main className="main-content page-fade">
//         <Outlet />
//       </main>
//     </div>
//   )
// }


import { Link, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
  const { logout, user, isAdmin } = useAuth()
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '◫' },
    { path: '/employees', label: isAdmin ? 'Employees' : 'My Profile', icon: '👥' },
    ...(isAdmin ? [{ path: '/departments', label: 'Departments', icon: '▦' }] : []),
    { path: '/attendance', label: isAdmin ? 'Attendance' : 'My Attendance', icon: '✓' },
    { path: '/leaves', label: 'Leaves', icon: '☾' },
    { path: '/announcements', label: 'Announcements', icon: '✦' },
    { path: '/holidays', label: 'Holidays', icon: '✺' },
    ...(isAdmin ? [{ path: '/reports', label: 'Reports', icon: '◌' }] : []),
  ]

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <nav className="nav-grid">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span aria-hidden="true" style={{ width: 20, textAlign: 'center' }}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-user-card">
          <div>Signed in as</div>
          <strong>{user?.full_name || 'HR user'}</strong>
          <div style={{ color: '#9fb0d4', marginTop: 6, fontSize: 13, textTransform: 'capitalize' }}>
            Role: {user?.role || 'employee'}
          </div>
        </div>

        <button onClick={logout} className="logout-btn">
          Logout
        </button>
      </aside>

      <main className="main-content page-fade">
        <Outlet />
      </main>
    </div>
  )
}