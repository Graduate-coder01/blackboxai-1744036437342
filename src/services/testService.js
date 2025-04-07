import { supabase } from './supabase';

export const createTest = async (testData) => {
  const { title, timeLimit, questions } = testData;
  
  // First create the test record
  const { data: test, error: testError } = await supabase
    .from('tests')
    .insert({
      title,
      time_limit_minutes: timeLimit
    })
    .select()
    .single();

  if (testError) throw testError;

  // Then create all questions
  const { error: questionsError } = await supabase
    .from('questions')
    .insert(questions.map((q, index) => ({
      test_id: test.id,
      question_text: q.text,
      options: q.options,
      correct_answer: q.correctAnswer,
      question_order: index
    })));

  if (questionsError) throw questionsError;

  return test;
};

export const getTests = async () => {
  const { data, error } = await supabase
    .from('tests')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const getTestQuestions = async (testId) => {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('test_id', testId)
    .order('question_order', { ascending: true });

  if (error) throw error;
  return data;
};

export const submitTestResults = async (results) => {
  const { studentId, testId, answers } = results;
  
  // Calculate score
  const questions = await getTestQuestions(testId);
  const correctAnswers = questions.map(q => q.correct_answer);
  const score = answers.reduce((acc, answer, index) => {
    return acc + (answer === correctAnswers[index] ? 1 : 0);
  }, 0) / questions.length * 100;

  // Save results
  const { data, error } = await supabase
    .from('results')
    .insert({
      student_id: studentId,
      test_id: testId,
      answers,
      score
    })
    .select();

  if (error) throw error;
  return data;
};