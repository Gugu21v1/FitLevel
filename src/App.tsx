import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { GlobalStyles } from './styles/GlobalStyles';
import { Layout } from './components/Layout/Layout';
import { ProtectedRoute } from './components/ProtectedRoute/ProtectedRoute';
import { Login } from './pages/Login/Login';
import { SignUp } from './pages/SignUp/SignUp';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { Workouts } from './pages/Workouts/Workouts';
import { Nutrition } from './pages/Nutrition/Nutrition';
import { Progress } from './pages/Progress/Progress';
import { Challenges } from './pages/Challenges/Challenges';
import { Goals } from './pages/Goals/Goals';
import { Calendar } from './pages/Calendar/Calendar';
import { Recipes } from './pages/Recipes/Recipes';
import { Coupons } from './pages/Coupons/Coupons';
import { Profile } from './pages/Profile/Profile';
import { Admin, AcademyDetails } from './pages/Admin';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const [timeoutReached, setTimeoutReached] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setTimeoutReached(true);
    }, 3000); // 3 second timeout

    return () => clearTimeout(timer);
  }, []);

  if (loading && !timeoutReached) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        gap: '16px'
      }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '4px solid #e0e0e0',
          borderTop: '4px solid #00B8D9',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <div>Carregando...</div>
      </div>
    );
  }

  // If timeout reached or loading finished, check user status
  return user ? <>{children}</> : <Navigate to="/login" />;
};

const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/signup" element={user ? <Navigate to="/" /> : <SignUp />} />
      
      <Route path="/" element={
        <PrivateRoute>
          <Layout />
        </PrivateRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="workouts" element={<Workouts />} />
        <Route path="nutrition" element={<Nutrition />} />
        <Route path="progress" element={<Progress />} />
        <Route path="challenges" element={<Challenges />} />
        <Route path="goals" element={<Goals />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="recipes" element={<Recipes />} />
        <Route path="coupons" element={<Coupons />} />
        <Route path="profile" element={<Profile />} />
        <Route path="admin" element={
          <ProtectedRoute requiredUserType="admin">
            <Admin />
          </ProtectedRoute>
        } />
        <Route path="admin/academy/:academyId" element={
          <ProtectedRoute requiredUserType="admin">
            <AcademyDetails />
          </ProtectedRoute>
        } />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <GlobalStyles />
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App
