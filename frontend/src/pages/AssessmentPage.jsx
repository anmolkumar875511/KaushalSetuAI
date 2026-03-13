import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../axiosInstance";

const AssessmentPage = () => {
  const { id } = useParams(); // get id from URL

  const [assessment, setAssessment] = useState(null);
  const [topic, setTopic] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [started, setStarted] = useState(false);

  // Fetch assessment
  const fetchAssessment = async (assessmentId) => {
    try {
      const res = await axiosInstance.get(`/assessment/${assessmentId}`);
      const data = res.data.data;

      if (!data) return;

      setAssessment(data);

      if (data.questions) {
        setAnswers(data.questions.map((q) => q.userAnswer || null));
      }

      if (data.timeStarted) {
        setStarted(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Load assessment if id exists
  useEffect(() => {
    if (id) {
      fetchAssessment(id);
    }
  }, [id]);

  // Generate assessment
  const generateAssessment = async () => {
    try {
      const res = await axiosInstance.post("/assessment/generate", { topic });

      const assessmentId = res.data.data;

      await fetchAssessment(assessmentId);
    } catch (err) {
      console.error(err);
    }
  };

  // Start assessment
  const startAssessment = async () => {
    try {
      await axiosInstance.patch(`/assessment/start/${assessment._id}`);
      setStarted(true);
    } catch (err) {
      console.error(err);
    }
  };

  // Submit assessment
  const submitAssessment = async () => {
    try {
      await axiosInstance.post("/assessment/submit", {
        assessmentId: assessment._id,
        answers,
      });

      await fetchAssessment(assessment._id);
    } catch (err) {
      console.error(err);
    }
  };

  // Select option
  const selectOption = (option) => {
    if (assessment.completed) return;

    const newAnswers = [...answers];
    newAnswers[currentQuestion] = option;
    setAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestion < assessment.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const getOptionStyle = (option) => {
    if (!assessment.completed) {
      return answers[currentQuestion] === option
        ? "bg-blue-100 border-blue-400"
        : "";
    }

    const question = assessment.questions[currentQuestion];

    if (option === question.correctAnswer) {
      return "bg-green-100 border-green-400";
    }

    if (option === question.userAnswer) {
      return "bg-red-100 border-red-400";
    }

    return "";
  };

  // Generate screen
  if (!assessment && !id) {
    return (
      <div className="p-6 max-w-xl mx-auto">
        <h1 className="text-xl font-semibold mb-4">
          Generate Assessment
        </h1>

        <input
          type="text"
          placeholder="Enter topic (React, NodeJS...)"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="border p-2 w-full mb-4"
        />

        <button
          disabled={!topic}
          onClick={generateAssessment}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
        >
          Generate Assessment
        </button>
      </div>
    );
  }

  if (!assessment) return <div className="p-6">Loading...</div>;

  const completed = assessment.completed;
  const question = assessment.questions?.[currentQuestion];

  return (
    <div className="p-6 max-w-3xl mx-auto">

      <h1 className="text-2xl font-semibold mb-6">
        {assessment.topic} Assessment
      </h1>

      {/* START SCREEN */}
      {!started && !completed && (
        <div className="border rounded-lg p-8 text-center">
          <p className="mb-4 text-gray-600">
            This assessment contains {assessment.questions?.length || 0} questions
          </p>

          <button
            onClick={startAssessment}
            className="px-6 py-3 bg-blue-600 text-white rounded"
          >
            Start Assessment
          </button>
        </div>
      )}

      {/* RESULT */}
      {completed && (
        <div className="mb-4 text-sm text-gray-600">
          Score: {assessment.score}/100 | Duration: {assessment.duration}s
        </div>
      )}

      {/* QUESTIONS */}
      {(started || completed) && question && (
        <>
          <div className="border rounded-lg p-6 mb-6">
            <p className="font-medium mb-4">
              Q{currentQuestion + 1}. {question.question}
            </p>

            <div className="space-y-3">
              {question.options?.map((option, i) => (
                <div
                  key={i}
                  onClick={() => selectOption(option)}
                  className={`border p-3 rounded cursor-pointer ${getOptionStyle(option)}`}
                >
                  {option}
                </div>
              ))}
            </div>

            <div className="text-sm text-gray-500 mt-3">
              Difficulty: {question.level}
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={prevQuestion}
              disabled={currentQuestion === 0}
              className="px-4 py-2 border rounded"
            >
              Previous
            </button>

            {currentQuestion === assessment.questions.length - 1 && !completed ? (
              <button
                onClick={submitAssessment}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                Submit
              </button>
            ) : (
              <button
                onClick={nextQuestion}
                disabled={currentQuestion === assessment.questions.length - 1}
                className="px-4 py-2 border rounded"
              >
                Next
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AssessmentPage;