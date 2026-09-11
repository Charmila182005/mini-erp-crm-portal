import { useAuth } from '../context/AuthContext';

interface AppLayoutProps {
    children: React.ReactNode;
    activePage?: string;
    onNavigate?: (page: string) => void;
}

const AppLayout = ({
    children,
    activePage = 'dashboard',
    onNavigate,
}: AppLayoutProps) => {
    const { user, logout } = useAuth();

    if (!user) {
        return null;
    }

    const navigation = [
        {
            id: 'dashboard',
            label: 'Dashboard',
            icon: '📊',
            roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'],
        },
        {
            id: 'customers',
            label: 'Customers & CRM',
            icon: '👥',
            roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'],
        },
        {
            id: 'products',
            label: 'Products',
            icon: '📦',
            roles: ['ADMIN', 'WAREHOUSE', 'ACCOUNTS'],
        },
        {
            id: 'stock',
            label: 'Stock Movements',
            icon: '🔄',
            roles: ['ADMIN', 'WAREHOUSE'],
        },
        {
            id: 'challans',
            label: 'Sales Challans',
            icon: '🧾',
            roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'],
        },
    ];

    const allowedNavigation = navigation.filter(
        (item) => item.roles.includes(user.role)
    );

    return (
        <div className="erp-layout">

            <aside className="sidebar">

                <div className="sidebar-brand">
                    <div className="brand-icon">
                        ERP
                    </div>

                    <div>
                        <h1>Mini ERP</h1>
                        <span>CRM Portal</span>
                    </div>
                </div>

                <nav className="sidebar-nav">

                    <p className="nav-section-title">
                        OPERATIONS
                    </p>

                    {allowedNavigation.map((item) => (
                        <button
                            key={item.id}
                            className={`nav-item ${activePage === item.id
                                    ? 'active'
                                    : ''
                                }`}
                            onClick={() =>
                                onNavigate?.(item.id)
                            }
                        >
                            <span className="nav-icon">
                                {item.icon}
                            </span>

                            <span>
                                {item.label}
                            </span>
                        </button>
                    ))}

                </nav>

                <div className="sidebar-bottom">

                    <div className="sidebar-user">

                        <div className="user-avatar">
                            {user.email
                                .charAt(0)
                                .toUpperCase()}
                        </div>

                        <div className="user-details">
                            <strong>
                                {user.email}
                            </strong>

                            <span>
                                {user.role}
                            </span>
                        </div>

                    </div>

                    <button
                        className="logout-button"
                        onClick={logout}
                    >
                        <span>🚪</span>
                        Logout
                    </button>

                </div>

            </aside>

            <div className="erp-main">

                <header className="topbar">

                    <div>
                        <h2>
                            {navigation.find(
                                (item) =>
                                    item.id === activePage
                            )?.label || 'Dashboard'}
                        </h2>

                        <p>
                            Wholesale & Distribution
                            Operations
                        </p>
                    </div>

                    <div className="topbar-user">

                        <div className="topbar-avatar">
                            {user.email
                                .charAt(0)
                                .toUpperCase()}
                        </div>

                        <div>
                            <strong>
                                {user.email}
                            </strong>

                            <span>
                                {user.role}
                            </span>
                        </div>

                    </div>

                </header>

                <main className="erp-content">
                    {children}
                </main>

            </div>

        </div>
    );
};

export default AppLayout;