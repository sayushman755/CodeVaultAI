import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/api";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const response = await API.get("/api/dashboard/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center text-lg font-semibold">
        Loading dashboard...
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-8 text-center text-red-600 font-semibold">
        Failed to load dashboard data. Make sure backend is running on port 8001.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 mt-2">
            Track coding growth, streaks, solved problems, and revision notes.
          </p>
        </div>

        <Link
          to="/revision"
          className="bg-slate-950 text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-800 text-center"
        >
          Start Revision Mode
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <DashboardCard
          label="Total Solved Problems"
          value={stats.total_solved_problems}
          color="text-slate-900"
        />

        <DashboardCard
          label="Solved Today"
          value={stats.problems_solved_today}
          color="text-green-600"
        />

        <DashboardCard
          label="Current Streak"
          value={`${stats.current_streak} Days`}
          color="text-orange-500"
        />

        <DashboardCard
          label="Longest Streak"
          value={`${stats.longest_streak} Days`}
          color="text-purple-600"
        />

        <DashboardCard
          label="Total Active Days"
          value={stats.total_active_days}
          color="text-blue-600"
        />

        <DashboardCard
          label="Pending Statements"
          value={stats.problem_statements?.pending}
          color="text-orange-500"
        />

        <DashboardCard
          label="Solved Statements"
          value={stats.problem_statements?.solved}
          color="text-green-600"
        />

        <DashboardCard
          label="Knowledge Notes"
          value={stats.knowledge_notes?.total}
          color="text-indigo-600"
        />
      </div>

      <div className="bg-white rounded-2xl shadow border p-6 mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">
          Quick Actions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <QuickAction
            to="/add-problem"
            title="Add Problem"
            description="Save a new solved coding problem with AI explanation."
          />

          <QuickAction
            to="/problems"
            title="View Problems"
            description="Search, filter, edit, and revise solved problems."
          />

          <QuickAction
            to="/knowledge"
            title="Knowledge Vault"
            description="Store reusable logic, skills, snippets, and notes."
          />

          <QuickAction
            to="/revision"
            title="Revision Mode"
            description="Revise problems and knowledge notes like flashcards."
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard title="Language Wise Count" data={stats.language_wise_count} />
        <StatsCard title="Difficulty Wise Count" data={stats.difficulty_wise_count} />
        <StatsCard title="Topic Wise Count" data={stats.topic_wise_count} />
      </div>
    </div>
  );
}

function DashboardCard({ label, value, color }) {
  return (
    <div className="bg-white rounded-2xl shadow p-6 border hover:shadow-lg transition">
      <p className="text-slate-500 text-sm">{label}</p>
      <h2 className={`text-4xl font-bold mt-2 ${color}`}>{value}</h2>
    </div>
  );
}

function QuickAction({ to, title, description }) {
  return (
    <Link
      to={to}
      className="border rounded-2xl p-5 hover:bg-slate-50 hover:shadow transition block"
    >
      <h3 className="text-xl font-bold text-slate-900">{title}</h3>
      <p className="text-slate-600 text-sm mt-2 leading-6">{description}</p>
    </Link>
  );
}

function StatsCard({ title, data }) {
  const entries = Object.entries(data || {});

  return (
    <div className="bg-white rounded-2xl shadow p-6 border">
      <h3 className="text-xl font-bold text-slate-900 mb-4">{title}</h3>

      {entries.length === 0 ? (
        <p className="text-slate-500">No data available yet.</p>
      ) : (
        <div className="space-y-3">
          {entries.map(([key, value]) => (
            <div key={key} className="flex justify-between border-b pb-2">
              <span className="text-slate-700">{key}</span>
              <span className="font-bold text-slate-900">{value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;