import { useState } from 'react';
import { loginUser } from '../services/auth';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { role } = await loginUser(email, password);
      navigate(role === 'teacher' ? '/teacher' : '/student');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="backdrop-blur-lg bg-white/30 rounded-2xl shadow-xl overflow-hidden border border-white/20">
          <div className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-800 bg-clip-text text-transparent">
                EduTest
              </h1>
              <p className="text-gray-600 mt-2">Login to your account</p>
            </div>

            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
                {error}
              </div>
            )}
