import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './services/supabase';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setUser(session?.user || null)
    );

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={!user ? <Login /> : <Navigate to={
          user.email === 'teacher@edutest.com' ? '/teacher' : '/student'
        } />} />
        <Route path="/teacher" element={user?.email === 'teacher@edutest.com' ? 
          <TeacherDashboard /> : <Navigate to="/" />} />
        <Route path="/student" element={user?.email === 'student@edutest.com' ? 
          <StudentDashboard /> : <Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
