import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiClock, FiAward } from 'react-icons/fi';
import { supabase } from '../services/supabase';
import { getTestQuestions, submitTestResults } from '../services/testService';

export default function StudentDashboard() {
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTestActive, setIsTestActive] = useState(false);
  const navigate = useNavigate();

  // Fetch tests with question counts from Supabase
  useEffect(() => {
    const fetchTests = async () => {
      try {
        const { data: tests, error: testsError } = await supabase
          .from('tests')
          .select('*')
          .order('created_at', { ascending: false });

        if (testsError) throw testsError;

        const testsWithCounts = await Promise.all(tests.map(async (test) => {
          const { count, error: countError } = await supabase
            .from('questions')
            .select('*', { count: 'exact', head: true })
            .eq('test_id', test.id);

          if (countError) throw countError;

          return {
            ...test,
            questionCount: count || 0,
            timeLimit: test.time_limit_minutes
          };
        }));

        setTests(testsWithCounts);
      } catch (error) {
        console.error('Error fetching tests:', error);
        alert('Failed to load tests: ' + error.message);
      }
    };

    fetchTests();
  }, []);

  const startTest = async (test) => {
    try {
      const questions = await getTestQuestions(test.id);
      setSelectedTest({
        ...test,
        questions
      });
      setAnswers(Array(questions.length).fill(null));
      setTimeLeft(test.timeLimit * 60);
      setIsTestActive(true);
    } catch (error) {
      alert('Failed to start test: ' + error.message);
    }
  };

  useEffect(() => {
    let timer;
    if (isTestActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTestActive) {
      submitTest();
    }
    return () => clearInterval(timer);
  }, [isTestActive, timeLeft]);

  const handleAnswerChange = (questionIndex, answer) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = answer;
    setAnswers(newAnswers);
  };

  const submitTest = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      await submitTestResults({
        studentId: user.id,
        testId: selectedTest.id,
        answers
      });

      setIsTestActive(false);
      navigate('/student');
    } catch (error) {
      alert('Error submitting test: ' + error.message);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (isTestActive && selectedTest) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">{selectedTest.name}</h1>
              <div className="flex items-center text-red-500 font-medium">
                <FiClock className="mr-2" />
                {formatTime(timeLeft)}
              </div>
            </div>

            <div className="space-y-6">
              {selectedTest.questions.map((question, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 border rounded-lg bg-gray-50"
                >
                  <h3 className="font-medium text-gray-700 mb-3">Question {index + 1}</h3>
                  <p className="mb-4">{question.question_text}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {question.options.map((option, optionIndex) => (
                      <label key={optionIndex} className="flex items-center">
                        <input
                          type="radio"
                          name={`question-${index}`}
                          checked={answers[index] === optionIndex}
                          onChange={() => handleAnswerChange(index, optionIndex)}
                          className="mr-2"
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={submitTest}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Submit Test
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-md p-6 mb-6"
        >
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Available Tests</h1>
          
          {tests.length === 0 ? (
            <p className="text-gray-500">No tests available at the moment.</p>
          ) : (
            <div className="space-y-4">
              {tests.map((test) => (
                <motion.div
                  key={test.id}
                  whileHover={{ scale: 1.02 }}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => startTest(test)}
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-lg">{test.name}</h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <FiClock className="mr-1" />
                      <span className="mr-4">{test.timeLimit} mins</span>
                      <FiAward className="mr-1" />
                      <span>{test.questionCount} questions</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Created: {new Date(test.created_at).toLocaleDateString()}</p>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}