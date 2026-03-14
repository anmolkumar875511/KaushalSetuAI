import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../axiosInstance";
import { AuthContext } from "../context/AuthContext";
import { getThemeColors } from "../theme";
import { ArrowRight, ArrowLeft, PlayCircle, CheckCircle } from "lucide-react";

const AssessmentPage = () => {
  const { id } = useParams();

  const { user } = useContext(AuthContext);
  const { colors } = getThemeColors(user?.theme || "light");

  const [assessment, setAssessment] = useState(null);
  const [topic, setTopic] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [started, setStarted] = useState(false);

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

  useEffect(() => {
    if (id) {
      fetchAssessment(id);
    }
  }, [id]);

  const generateAssessment = async () => {
    try {
      const res = await axiosInstance.post("/assessment/generate", { topic });
      const assessmentId = res.data.data;
      await fetchAssessment(assessmentId);
    } catch (err) {
      console.error(err);
    }
  };

  const startAssessment = async () => {
    try {
      await axiosInstance.patch(`/assessment/start/${assessment._id}`);
      setStarted(true);
    } catch (err) {
      console.error(err);
    }
  };

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
        ? { backgroundColor: `${colors.primary}20`, borderColor: colors.primary }
        : {};
    }

    const question = assessment.questions[currentQuestion];

    if (option === question.correctAnswer) {
      return { backgroundColor: "#dcfce7", borderColor: "#16a34a" };
    }

    if (option === question.userAnswer) {
      return { backgroundColor: "#fee2e2", borderColor: "#dc2626" };
    }

    return {};
  };

  /* ---------- GENERATE SCREEN ---------- */

  if (!assessment && !id) {
    return (
      <div
        className="min-h-screen py-16 px-6"
        style={{ backgroundColor: colors.bgLight }}
      >
        <div className="max-w-xl mx-auto space-y-6">

          <h1
            className="text-3xl font-bold"
            style={{ color: colors.textMain }}
          >
            Generate Assessment
          </h1>

          <input
            type="text"
            placeholder="Enter topic (React, NodeJS...)"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full px-4 py-3 border rounded-xl"
            style={{ borderColor: colors.border }}
          />

          <button
            disabled={!topic}
            onClick={generateAssessment}
            className="px-6 py-3 rounded-xl text-white font-semibold disabled:opacity-50"
            style={{ backgroundColor: colors.secondary }}
          >
            Generate Assessment
          </button>
        </div>
      </div>
    );
  }

  if (!assessment) return <div className="p-6">Loading...</div>;

  const completed = assessment.completed;
  const question = assessment.questions?.[currentQuestion];

  return (
    <div
      className="min-h-screen py-12 px-6"
      style={{ backgroundColor: colors.bgLight }}
    >
      <div className="max-w-3xl mx-auto space-y-8">

        {/* HEADER */}
        <div className="relative pl-5 border-l-4"
          style={{ borderColor: colors.secondary }}
        >
          <h1
            className="text-3xl font-bold"
            style={{ color: colors.textMain }}
          >
            {assessment.topic} Assessment
          </h1>
        </div>

        {/* START SCREEN */}
        {!started && !completed && (
          <div
            className="border rounded-3xl p-10 text-center"
            style={{ borderColor: colors.border, backgroundColor: colors.white }}
          >
            <PlayCircle
              size={48}
              style={{ color: colors.primary }}
              className="mx-auto mb-4"
            />

            <p
              className="mb-6 text-sm"
              style={{ color: colors.textMuted }}
            >
              This assessment contains {assessment.questions?.length || 0} questions
            </p>

            <button
              onClick={startAssessment}
              className="px-8 py-3 text-white rounded-xl font-semibold"
              style={{ backgroundColor: colors.primary }}
            >
              Start Assessment
            </button>
          </div>
        )}

        {/* RESULT */}
        {completed && (
          <div
            className="text-sm font-medium flex items-center gap-3"
            style={{ color: colors.primary }}
          >
            <CheckCircle size={18} />
            Score: {assessment.score}/100 | Duration: {assessment.duration}s
          </div>
        )}

        {/* QUESTIONS */}
        {(started || completed) && question && (
          <>
            <div
              className="border rounded-3xl p-6"
              style={{ borderColor: colors.border, backgroundColor: colors.white }}
            >
              <p
                className="font-semibold mb-5"
                style={{ color: colors.textMain }}
              >
                Q{currentQuestion + 1}. {question.question}
              </p>

              <div className="space-y-3">
                {question.options?.map((option, i) => (
                  <div
                    key={i}
                    onClick={() => selectOption(option)}
                    className="border p-3 rounded-xl cursor-pointer transition"
                    style={{
                      borderColor: colors.border,
                      ...getOptionStyle(option),
                    }}
                  >
                    {option}
                  </div>
                ))}
              </div>

              <div
                className="text-xs mt-4"
                style={{ color: colors.textMuted }}
              >
                Difficulty: {question.level}
              </div>
            </div>

            {/* NAVIGATION */}
            <div className="flex justify-between">

              <button
                onClick={prevQuestion}
                disabled={currentQuestion === 0}
                className="flex items-center gap-2 px-4 py-2 border rounded-xl"
                style={{ borderColor: colors.border }}
              >
                <ArrowLeft size={16} />
                Previous
              </button>

              {currentQuestion === assessment.questions.length - 1 && !completed ? (
                <button
                  onClick={submitAssessment}
                  className="px-6 py-2 text-white rounded-xl font-semibold"
                  style={{ backgroundColor: "#16a34a" }}
                >
                  Submit
                </button>
              ) : (
                <button
                  onClick={nextQuestion}
                  disabled={currentQuestion === assessment.questions.length - 1}
                  className="flex items-center gap-2 px-4 py-2 border rounded-xl"
                  style={{ borderColor: colors.border }}
                >
                  Next
                  <ArrowRight size={16} />
                </button>
              )}

            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AssessmentPage;