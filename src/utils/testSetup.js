import { supabase } from '../services/supabase';
import { testSupabaseConnection } from '../services/testConnection';
import { getTests } from '../services/testService';

export const verifyApplicationSetup = async () => {
  const results = {
    supabaseConnection: false,
    authInitialized: false,
    testService: false
  };

  try {
    // Test Supabase connection
    const connectionTest = await testSupabaseConnection();
    results.supabaseConnection = connectionTest.success;

    // Test auth initialization
    const { data: { session } } = await supabase.auth.getSession();
    results.authInitialized = session !== null;

    // Test test service
    const tests = await getTests();
    results.testService = Array.isArray(tests);

    return {
      success: Object.values(results).every(Boolean),
      details: results
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      details: results
    };
  }
};