import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';
import BookTablePage from './pages/customer/BookTablePage';
import MyReservationsPage from './pages/customer/MyReservationsPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import ManageTablesPage from './pages/admin/ManageTablesPage';

function HomeRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'admin' ? '/admin' : '/book'} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<Layout />}>
        <Route path="/" element={<HomeRedirect />} />

        <Route element={<ProtectedRoute allowedRole="customer" />}>
          <Route path="/book" element={<BookTablePage />} />
          <Route path="/my-reservations" element={<MyReservationsPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRole="admin" />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/tables" element={<ManageTablesPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
