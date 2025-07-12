import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; // Assuming useAuth is used to determine admin role
// import PeerIQLogo from '../assets/images/peer-iq-logo.png'; // Assuming you have a logo for PeerIQ/ExpertConnect

const Sidebar = () => {
  const { user } = useAuth(); // Get user info to conditionally show Admin Panel

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: 'M4 4a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm0 8a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm8-8a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V4zm0 8a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' }, // Example SVG path for dashboard
    { name: 'Xchange', path: '/forum', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' }, // Example SVG path for comments/forum
    { name: 'Settings', path: '/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.525.322 1.018.525 1.516.635.452.1.928.15 1.399.15.471 0 .947-.05 1.399-.15s.991-.513 1.516-.635zM12 8.424a3.576 3.576 0 100 7.152 3.576 3.576 0 000-7.152zM12 14a2 2 0 110-4 2 2 0 010 4z' }, // Example SVG path for settings
  ];

  return (
    <div className="bg-gray-800 text-white w-64 min-h-screen p-5 flex flex-col shadow-xl"> {/* Darker sidebar background */}
      {/* PeerIQ Logo (if you uncomment and add one) */}
      <div className="mb-8 text-center">
        {/* {PeerIQLogo && <img src={PeerIQLogo} alt="PeerIQ Logo" className="h-10 mx-auto" />} */}
        <h1 className="text-2xl font-bold text-blue-400 mt-2">PeerIQ</h1> {/* Example app name */}
      </div>

      <nav className="flex-1">
        <ul className="space-y-3">
          {navItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center p-3 rounded-lg text-lg font-medium transition-colors duration-200 ${
                    isActive ? 'bg-blue-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`
                }
              >
                <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d={item.icon}></path>
                </svg>
                {item.name}
              </NavLink>
            </li>
          ))}

          {/* Admin Panel Link (conditionally rendered for admins) */}
          {user?.role === 'admin' && (
            <li>
              <NavLink
                to="/admin/dashboard"
                className={({ isActive }) =>
                  `flex items-center p-3 rounded-lg text-lg font-medium transition-colors duration-200 mt-6 ${ // Added mt-6 for spacing
                    isActive ? 'bg-red-600 text-white shadow-md' : 'text-red-300 hover:bg-gray-700 hover:text-white'
                  }`
                }
              >
                <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path> {/* Example SVG for admin */}
                </svg>
                Admin Panel
              </NavLink>
            </li>
          )}
        </ul>
      </nav>

      {/* Optional: Add a logout button or other fixed elements at the bottom */}
      {/* <div className="mt-auto pt-6 border-t border-gray-700">
        <button className="flex items-center w-full p-3 rounded-lg text-lg font-medium text-gray-300 hover:bg-gray-700 hover:text-white">
          <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"></path></svg>
          Logout
        </button>
      </div> */}
    </div>
  );
};

export default Sidebar;