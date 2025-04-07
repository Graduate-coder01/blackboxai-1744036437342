import { supabase } from './supabase';

export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('tests')
      .select('*')
      .limit(1);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};