import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../axiosInstance";

const PastAssessments = () => {
  const [assessments, setAssessments] = useState([]);
  const navigate = useNavigate();

  const fetchAssessments = async () => {
    try {
      const res = await axiosInstance.get("/assessment");
      setAssessments(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Past Assessments</h1>

      {assessments.length === 0 ? (
        <p>No assessments attempted yet.</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {assessments.map((a) => (
            <div
              key={a._id}
              onClick={() => navigate(`/assessment/${a._id}`)}
              className="border rounded-lg p-5 shadow hover:shadow-lg cursor-pointer transition"
            >
              <h2 className="text-lg font-semibold mb-2">{a.topic}</h2>

              <div className="text-sm text-gray-600 space-y-1">
                <p>Score: {a.score}/100</p>
                <p>
                  Start: {new Date(a.timeStarted).toLocaleString()}
                </p>
                <p>
                  End: {new Date(a.timeCompleted).toLocaleString()}
                </p>
                <p>Duration: {a.duration}s</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PastAssessments;