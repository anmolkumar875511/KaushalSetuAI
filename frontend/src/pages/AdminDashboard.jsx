import React, { useState, useEffect, useContext } from "react";
import {
  Briefcase,
  Users,
  Activity,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  History
} from "lucide-react";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

import { toast } from "sonner";
import axiosInstance from "../axiosInstance";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { getThemeColors } from "../theme";

/* ─────────────────────────────────────────────
   ADMIN DASHBOARD
───────────────────────────────────────────── */

const AdminDashboard = () => {

  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState({
    userGrowth: [],
    topSkills: [],
    missingSkills: [],
    skillDemand: []
  });

  const [loading, setLoading] = useState(true);
  const [ingesting, setIngesting] = useState(false);

  const { user } = useContext(AuthContext);
  const { colors, font, radius, shadow, transition } =
    getThemeColors(user?.theme || "light");

  const navigate = useNavigate();

  /* ─────────────────────────────────────────────
     FETCH DASHBOARD STATS
  ───────────────────────────────────────────── */

  const fetchDashboardData = async () => {
    try {
      const res = await axiosInstance.get("/admin/dashboard");
      setStats(res.data.message);
    } catch (err) {
      toast.error("Failed to load dashboard");
    }
  };

  /* ─────────────────────────────────────────────
     FETCH ANALYTICS
  ───────────────────────────────────────────── */

  const fetchAnalytics = async () => {
    try {

      const [
        growth,
        topSkills,
        missingSkills,
        skillDemand
      ] = await Promise.all([
        axiosInstance.get("/admin/analytics/user-growth"),
        axiosInstance.get("/admin/analytics/top-skills"),
        axiosInstance.get("/admin/analytics/missing-skills"),
        axiosInstance.get("/admin/analytics/skill-demand")
      ]);

      setAnalytics({
        userGrowth: growth.data,
        topSkills: topSkills.data,
        missingSkills: missingSkills.data,
        skillDemand: skillDemand.data
      });

    } catch (err) {
      toast.error("Analytics failed to load");
    }
  };

  /* ───────────────────────────────────────────── */

  useEffect(() => {

    if (!user || user.role !== "admin") return;

    setLoading(true);

    Promise.all([
      fetchDashboardData(),
      fetchAnalytics()
    ]).finally(() => setLoading(false));

  }, [user]);

  /* ─────────────────────────────────────────────
     INGEST OPPORTUNITIES
  ───────────────────────────────────────────── */

  const handleIngest = async () => {

    setIngesting(true);

    try {

      await axiosInstance.get("/admin/fetch");

      toast.success("Opportunities synced successfully");

      fetchDashboardData();
      fetchAnalytics();

    } catch {
      toast.error("Sync failed");
    }

    finally {
      setIngesting(false);
    }
  };

  /* ─────────────────────────────────────────────
     GUARDS
  ───────────────────────────────────────────── */

  if (!user || user.role !== "admin") {

    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: colors.bgPage,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <AlertCircle color={colors.danger} /> Unauthorized
      </div>
    );
  }

  if (loading) {

    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.bgPage
        }}
      >
        Loading…
      </div>
    );
  }

  /* ─────────────────────────────────────────────
     STAT CARDS
  ───────────────────────────────────────────── */

  const statCards = [

    {
      title: "Total Users",
      value: stats?.users?.total || 0,
      icon: <Users size={16} />,
      accent: colors.primary
    },

    {
      title: "Active Jobs",
      value: stats?.opportunities?.active || 0,
      icon: <Briefcase size={16} />,
      accent: colors.secondary
    },

    {
      title: "Roadmaps",
      value: stats?.roadmaps || 0,
      icon: <Activity size={16} />,
      accent: colors.primary
    },

    {
      title: "Resumes Parsed",
      value: stats?.resumes || 0,
      icon: <Activity size={16} />,
      accent: colors.secondary
    }
  ];

  /* ───────────────────────────────────────────── */

  return (

    <div
      style={{
        minHeight: "100vh",
        backgroundColor: colors.bgPage,
        fontFamily: font.body
      }}
    >

      <main
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "2rem 1.25rem"
        }}
      >

        {/* HEADER */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "2rem"
          }}
        >

          <div>

            <p style={{ fontSize: 11, color: colors.textSub }}>
              ADMIN
            </p>

            <h1
              style={{
                fontSize: "1.6rem",
                color: colors.textMain
              }}
            >
              System Overview
            </h1>

          </div>

          <button
            onClick={handleIngest}
            disabled={ingesting}
            style={{
              backgroundColor: colors.primary,
              color: "#fff",
              border: "none",
              padding: "0.6rem 1rem",
              borderRadius: radius.md,
              display: "flex",
              gap: 6,
              cursor: "pointer"
            }}
          >
            <RefreshCw size={14} />
            {ingesting ? "Syncing..." : "Sync Opportunities"}
          </button>

        </div>

        {/* STAT CARDS */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
            gap: "1rem",
            marginBottom: "2rem"
          }}
        >

          {statCards.map((card) => (

            <div
              key={card.title}
              style={{
                background: colors.bgCard,
                border: `1px solid ${colors.border}`,
                padding: "1rem",
                borderRadius: radius.lg
              }}
            >

              <p style={{ fontSize: 11 }}>{card.title}</p>

              <h2>{card.value}</h2>

            </div>

          ))}

        </div>

        {/* ANALYTICS */}

        <h2
          style={{
            marginBottom: "1rem",
            color: colors.textMain
          }}
        >
          Workforce Analytics
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
            gap: "1rem"
          }}
        >

          {/* USER GROWTH */}

          <ChartCard title="User Growth">

            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={analytics.userGrowth}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  dataKey="count"
                  stroke={colors.primary}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>

          </ChartCard>

          {/* TOP SKILLS */}

          <ChartCard title="Top Skills">

            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={analytics.topSkills}>
                <XAxis dataKey="skill" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill={colors.primary} />
              </BarChart>
            </ResponsiveContainer>

          </ChartCard>

          {/* MISSING SKILLS */}

          <ChartCard title="Missing Skills">

            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={analytics.missingSkills}>
                <XAxis dataKey="skill" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>

          </ChartCard>

          {/* SKILL DEMAND */}

          <ChartCard title="Market Skill Demand">

            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={analytics.skillDemand}>
                <XAxis dataKey="skill" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill={colors.secondary} />
              </BarChart>
            </ResponsiveContainer>

          </ChartCard>

        </div>

        {/* LOGS */}

        <div
          style={{
            marginTop: "2rem",
            background: colors.bgCard,
            border: `1px solid ${colors.border}`,
            borderRadius: radius.lg,
            padding: "1rem"
          }}
        >

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "1rem"
            }}
          >

            <h3>System Activity</h3>

            <button
              onClick={() => navigate("/logger")}
              style={{
                background: "none",
                border: "none",
                color: colors.primary,
                cursor: "pointer"
              }}
            >
              View Logs
            </button>

          </div>

          {stats?.recentLogs?.map((log) => (

            <div key={log._id} style={{ marginBottom: 10 }}>

              <strong>{log.meta?.action}</strong>

              <p>{log.message}</p>

            </div>

          ))}

        </div>

      </main>

    </div>

  );
};

/* ─────────────────────────────────────────────
   CHART CARD
───────────────────────────────────────────── */

const ChartCard = ({ title, children }) => (

  <div
    style={{
      background: "#fff",
      border: "1px solid #eee",
      borderRadius: 10,
      padding: "1rem"
    }}
  >

    <h4 style={{ marginBottom: 10 }}>{title}</h4>

    {children}

  </div>

);

export default AdminDashboard;