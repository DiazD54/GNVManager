import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import SaaSLayout from './layouts/SaaSLayout';
import ThermodynamicsModule from './pages/ThermodynamicsModule';
import ReportsModule from './pages/ReportsModule';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/app" 
            element={
              <ProtectedRoute>
                <SaaSLayout />
              </ProtectedRoute>
            } 
          >
            {/* Subrutas renderizadas dentro de SaaSLayout (Outlet) */}
            <Route path="thermodynamics" element={<ThermodynamicsModule />} />
            <Route path="reports" element={<ReportsModule />} />
            <Route path="settings" element={<ReportsModule />} /> {/* Placeholder */}
            
            {/* Redirección por defecto si entran a /app */}
            <Route index element={<Navigate to="thermodynamics" replace />} />
          </Route>

          <Route path="/" element={<Navigate to="/app/thermodynamics" replace />} />
          <Route path="/dashboard" element={<Navigate to="/app/thermodynamics" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
