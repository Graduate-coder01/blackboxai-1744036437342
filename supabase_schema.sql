-- Create tables for EduTest platform
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('teacher', 'student')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert fixed credentials
INSERT INTO users (email, role) VALUES
  ('teacher@edutest.com', 'teacher'),
  ('student@edutest.com', 'student');

-- Tests table
CREATE TABLE tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  time_limit_minutes INTEGER NOT NULL CHECK (time_limit_minutes > 0),
  created_by UUID REFERENCES users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Questions table
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_id UUID REFERENCES tests(id) ON DELETE CASCADE NOT NULL,
  question_text TEXT NOT NULL,
  options TEXT[] NOT NULL CHECK (array_length(options, 1) = 4),
  correct_answer INTEGER NOT NULL CHECK (correct_answer BETWEEN 0 AND 3),
  question_order INTEGER NOT NULL
);

-- Results table
CREATE TABLE results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES users(id) NOT NULL,
  test_id UUID REFERENCES tests(id) NOT NULL,
  score DECIMAL(5,2) NOT NULL CHECK (score BETWEEN 0 AND 100),
  answers INTEGER[] NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, test_id)
);

-- Enable Row Level Security
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;

-- Create storage bucket for test attachments
INSERT INTO storage.buckets (id, name) VALUES ('test_attachments', 'test_attachments');

-- Set up policies (example - customize as needed)
CREATE POLICY "Teachers can manage their tests" ON tests
  FOR ALL USING (auth.uid() = created_by);

CREATE POLICY "Students can view available tests" ON tests
  FOR SELECT USING (true);