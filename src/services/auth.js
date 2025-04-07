import { supabase } from './supabase';

const FIXED_CREDENTIALS = {
  teacher: {
    email: 'teacher@edutest.com',
    password: 'teacher123'
  },
  student: {
    email: 'student@edutest.com',
    password: 'student123'
  }
};

export const loginUser = async (email, password) => {
  // Validate against fixed credentials
  let role = null;
  if (email === FIXED_CREDENTIALS.teacher.email && 
      password === FIXED_CREDENTIALS.teacher.password) {
    role = 'teacher';
  } else if (email === FIXED_CREDENTIALS.student.email && 
            password === FIXED_CREDENTIALS.student.password) {
    role = 'student';
  } else {
    throw new Error('Invalid credentials');
  }

  // Authenticate with Supabase
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;
  
  return { ...data, role };
};

export const logoutUser = async () => {
  await supabase.auth.signOut();
};