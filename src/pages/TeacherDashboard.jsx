import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiSave, FiTrash2 } from 'react-icons/fi';

export default function TeacherDashboard() {
  const [testName, setTestName] = useState('');
  const [questionCount, setQuestionCount] = useState(1);
  const [timeLimit, setTimeLimit] = useState(1);
  const [questions, setQuestions] = useState(
    Array(1).fill().map(() => ({
      text: '',
      options: ['', '', '', ''],
      correctAnswer: 0
    }))
  );
  const navigate = useNavigate();

  const handleQuestionCountChange = (count) => {
    const newCount = Math.max(1, Math.min(50, count));
    setQuestionCount(newCount);
    
    if (newCount > questions.length) {
      // Add new questions
      setQuestions([...questions, ...Array(newCount - questions.length).fill().map(() => ({
        text: '',
        options: ['', '', '', ''],
        correctAnswer: 0
      }))]);
    } else if (newCount < questions.length) {
      // Remove extra questions
      setQuestions(questions.slice(0, newCount));
    }
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    if (field === 'text') {
      newQuestions[index].text = value;
    } else if (field.startsWith('option')) {
      const optionIndex = parseInt(field.replace('option', ''));
      newQuestions[index].options[optionIndex] = value;
    } else if (field === 'correctAnswer') {
      newQuestions[index].correctAnswer = parseInt(value);
    }
    setQuestions(newQuestions);
  };

  const handleCreateTest = async () => {
    if (!testName.trim()) {
      alert('Please enter a test name');
      return;
    }

    if (questions.some(q => !q.text.trim() || q.options.some(o => !o.trim()))) {
      alert('Please fill all questions and options');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const test = await createTest({
        title: testName,
        timeLimit,
        questions
      });

      alert(`Test "${test.title}" created successfully!`);
      navigate('/teacher');
    } catch (error) {
      alert('Error creating test: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-md p-6 mb-6"
        >
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Create New Test</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Test Name</label>
              <input
                type="text"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter test name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Number of Questions</label>
              <input
                type="number"
                min="1"
                max="50"
                value={questionCount}
                onChange={(e) => handleQuestionCountChange(parseInt(e.target.value) || 1)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time Limit (minutes)</label>
              <input
                type="number"
                min="1"
                value={timeLimit}
                onChange={(e) => setTimeLimit(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <AnimatePresence>
            {questions.map((question, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mb-6 p-4 border rounded-lg bg-gray-50"
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium text-gray-700">Question {index + 1}</h3>
                  {questions.length > 1 && (
                    <button
                      onClick={() => {
                        handleQuestionCountChange(questionCount - 1);
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FiTrash2 />
                    </button>
                  )}
                </div>
                
                <input
                  type="text"
                  value={question.text}
                  onChange={(e) => handleQuestionChange(index, 'text', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg mb-3 focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter question text"
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center">
                      <input
                        type="radio"
                        name={`correctAnswer-${index}`}
                        checked={question.correctAnswer === optionIndex}
                        onChange={() => handleQuestionChange(index, 'correctAnswer', optionIndex)}
                        className="mr-2"
                      />
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleQuestionChange(index, `option${optionIndex}`, e.target.value)}
                        className="flex-1 px-3 py-1 border rounded focus:ring-2 focus:ring-blue-500"
                        placeholder={`Option ${optionIndex + 1}`}
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <div className="flex justify-end">
            <button
              onClick={handleCreateTest}
              className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiSave className="mr-2" />
              Create Test
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}