import React, { useEffect, useState } from "react";
import axiosInstance from "../axiosInstance";

const AssessmentPage = () => {
  const [assessment, setAssessment] = useState(null);
  const [topic, setTopic] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [started, setStarted] = useState(false);

  const fetchAssessment = async () => {
    try {
      const res = await axiosInstance.get(`/assessment/${id}`);
      const data = res.data.data;

      if (!data) return;

      setAssessment(data);
      setAnswers(data.questions.map((q) => q.userAnswer || null));

      if (data.timeStarted) {
        setStarted(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAssessment();
  }, []);

  // Generate assessment
  const generateAssessment = async () => {
    try {
      await axiosInstance.post("/assessment/generate", { topic });

      await fetchAssessment();
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

      await fetchAssessment();
    } catch (err) {
      console.error(err);
    }
  };

  if (!assessment) {
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
          onClick={generateAssessment}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Generate Assessment
        </button>
      </div>
    );
  }

  const completed = assessment.completed;
  const question = assessment.questions[currentQuestion];

  const selectOption = (option) => {
    if (completed) return;

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
    if (!completed) {
      return answers[currentQuestion] === option
        ? "bg-blue-100 border-blue-400"
        : "";
    }

    if (option === question.correctAnswer) {
      return "bg-green-100 border-green-400";
    }

    if (option === question.userAnswer) {
      return "bg-red-100 border-red-400";
    }

    return "";
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">

      <h1 className="text-2xl font-semibold mb-6">
        {assessment.topic} Assessment
      </h1>

      {/* START SCREEN */}
      {!started && !completed && (
        <div className="border rounded-lg p-8 text-center">
          <p className="mb-4 text-gray-600">
            This assessment contains {assessment.questions.length} questions
          </p>

          <button
            onClick={startAssessment}
            className="px-6 py-3 bg-blue-600 text-white rounded"
          >
            Start Assessment
          </button>
        </div>
      )}

      {/* RESULT INFO */}
      {completed && (
        <div className="mb-4 text-sm text-gray-600">
          Score: {assessment.score}/100 | Duration: {assessment.duration}s
        </div>
      )}

      {/* QUESTION SECTION */}
      {(started || completed) && (
        <>
          <div className="border rounded-lg p-6 mb-6">
            <p className="font-medium mb-4">
              Q{currentQuestion + 1}. {question.question}
            </p>

            <div className="space-y-3">
              {question.options.map((option, i) => (
                <div
                  key={i}
                  onClick={() => selectOption(option)}
                  className={`border p-3 rounded cursor-pointer ${getOptionStyle(
                    option
                  )}`}
                >
                  {option}
                </div>
              ))}
            </div>

            <div className="text-sm text-gray-500 mt-3">
              Difficulty: {question.level}
            </div>
          </div>

          {/* NAVIGATION */}
          <div className="flex justify-between">
            <button
              onClick={prevQuestion}
              disabled={currentQuestion === 0}
              className="px-4 py-2 border rounded"
            >
              Previous
            </button>

            {currentQuestion === assessment.questions.length - 1 &&
            !completed ? (
              <button
                onClick={submitAssessment}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                Submit
              </button>
            ) : (
              <button
                onClick={nextQuestion}
                disabled={
                  currentQuestion === assessment.questions.length - 1
                }
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