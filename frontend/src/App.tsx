import { useState } from 'react';

import './App.css';

import Login from './pages/Login';
import Customers from './pages/Customers';
import Products from './pages/Products';
import AppLayout from './layouts/AppLayout';
import { useAuth } from './context/AuthContext';
import StockMovements from './pages/StockMovements';
import SalesChallans from './pages/SalesChallans';

const App = () => {
  const {
    user,
    isLoading,
    isAuthenticated,
  } = useAuth();

  const [activePage, setActivePage] =
    useState('dashboard');

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>Loading ERP Portal...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Login />;
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return (
          <div className="dashboard-page">
            <div className="page-heading">
              <div>
                <h1>
                  Welcome back
                </h1>

                <p>
                  Here's what's happening
                  across your operations.
                </p>
              </div>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">
                  👥
                </div>

                <div>
                  <span>
                    Customers
                  </span>

                  <strong>5</strong>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  📦
                </div>

                <div>
                  <span>
                    Products
                  </span>

                  <strong>8</strong>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  🧾
                </div>

                <div>
                  <span>
                    Challans
                  </span>

                  <strong>3</strong>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  🔄
                </div>

                <div>
                  <span>
                    Stock Movements
                  </span>

                  <strong>12+</strong>
                </div>
              </div>
            </div>

            <div className="dashboard-grid">
              <div className="dashboard-panel">
                <div className="panel-header">
                  <div>
                    <h3>
                      Quick Actions
                    </h3>

                    <p>
                      Frequently used
                      operations
                    </p>
                  </div>
                </div>

                <div className="quick-actions">

                  {(user.role === 'ADMIN' ||
                    user.role === 'SALES') && (
                      <button
                        onClick={() =>
                          setActivePage(
                            'customers'
                          )
                        }
                      >
                        <span>
                          👥
                        </span>

                        <div>
                          <strong>
                            Manage Customers
                          </strong>

                          <small>
                            View and manage CRM
                            records
                          </small>
                        </div>
                      </button>
                    )}

                  {(user.role === 'ADMIN' ||
                    user.role ===
                    'WAREHOUSE') && (
                      <button
                        onClick={() =>
                          setActivePage(
                            'products'
                          )
                        }
                      >
                        <span>
                          📦
                        </span>

                        <div>
                          <strong>
                            Products
                          </strong>

                          <small>
                            Manage products and
                            inventory
                          </small>
                        </div>
                      </button>
                    )}

                  {(user.role === 'ADMIN' ||
                    user.role ===
                    'WAREHOUSE') && (
                      <button
                        onClick={() =>
                          setActivePage(
                            'stock'
                          )
                        }
                      >
                        <span>
                          🔄
                        </span>

                        <div>
                          <strong>
                            Stock Movements
                          </strong>

                          <small>
                            Manage inventory
                            transactions
                          </small>
                        </div>
                      </button>
                    )}

                  <button
                    onClick={() =>
                      setActivePage(
                        'challans'
                      )
                    }
                  >
                    <span>
                      🧾
                    </span>

                    <div>
                      <strong>
                        Sales Challans
                      </strong>

                      <small>
                        View and manage
                        challans
                      </small>
                    </div>
                  </button>

                </div>
              </div>

              <div className="dashboard-panel">
                <div className="panel-header">
                  <div>
                    <h3>
                      Current Session
                    </h3>

                    <p>
                      Your account
                      information
                    </p>
                  </div>
                </div>

                <div className="session-info">
                  <div>
                    <span>
                      Email
                    </span>

                    <strong>
                      {user.email}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Role
                    </span>

                    <strong className="role-badge">
                      {user.role}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Access
                    </span>

                    <strong>
                      Authenticated
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'customers':
        return <Customers />;

      case 'products':
        return <Products />;

      case 'stock':
        return <StockMovements />;

      case 'challans':
        return <SalesChallans />;

      default:
        return null;
    }
  };

  return (
    <AppLayout
      activePage={activePage}
      onNavigate={setActivePage}
    >
      {renderPage()}
    </AppLayout>
  );
};

export default App;