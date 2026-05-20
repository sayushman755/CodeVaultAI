import { useEffect, useState } from "react";
import API from "../api/api";

function Statements() {
  const [statements, setStatements] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    problem_statement: "",
    source: "",
    difficulty: "Easy",
    topics: "",
    status: "Pending",
    language_planned: "Python",
    target_date: "",
  });

  const fetchStatements = async () => {
    setLoading(true);
    setMessage("");

    try {
      let endpoint = "/api/statements/";

      if (filter === "pending") {
        endpoint = "/api/statements/pending";
      }

      if (filter === "solved") {
        endpoint = "/api/statements/solved";
      }

      const response = await API.get(endpoint);
      setStatements(response.data.statements || []);
    } catch (error) {
      console.error("Fetch statements error:", error);
      setMessage("Failed to load problem statements.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatements();
  }, [filter]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const createStatement = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const payload = {
        ...formData,
        topics: formData.topics
          .split(",")
          .map((topic) => topic.trim())
          .filter((topic) => topic !== ""),
        target_date: formData.target_date || null,
      };

      await API.post("/api/statements/", payload);

      setMessage("Problem statement saved successfully.");

      setFormData({
        title: "",
        problem_statement: "",
        source: "",
        difficulty: "Easy",
        topics: "",
        status: "Pending",
        language_planned: "Python",
        target_date: "",
      });

      setFilter("all");
      fetchStatements();
    } catch (error) {
      console.error("Create statement error:", error);
      setMessage(error.response?.data?.detail || "Failed to save statement.");
    }
  };

  const markAsSolved = async (id) => {
    try {
      await API.put(`/api/statements/${id}/mark-solved`);
      setMessage("Statement marked as solved.");
      fetchStatements();
    } catch (error) {
      console.error("Mark solved error:", error);
      setMessage("Failed to mark statement as solved.");
    }
  };

  const deleteStatement = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this statement?"
    );

    if (!confirmDelete) return;

    try {
      await API.delete(`/api/statements/${id}`);
      setStatements(statements.filter((statement) => statement.id !== id));
      setMessage("Statement deleted successfully.");
    } catch (error) {
      console.error("Delete statement error:", error);
      setMessage("Failed to delete statement.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900">
          Problem Statements
        </h1>
        <p className="text-slate-600 mt-2">
          Store pending problems, track solved statements, and plan your coding practice.
        </p>
      </div>

      <form
        onSubmit={createStatement}
        className="bg-white rounded-2xl shadow border p-8 mb-8 space-y-6"
      >
        <h2 className="text-2xl font-bold text-slate-900">
          Add New Problem Statement
        </h2>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Problem Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Example: Reverse Linked List"
            className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Problem Statement
          </label>
          <textarea
            name="problem_statement"
            value={formData.problem_statement}
            onChange={handleChange}
            required
            rows="4"
            placeholder="Paste the full problem statement here..."
            className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Source
            </label>
            <input
              type="text"
              name="source"
              value={formData.source}
              onChange={handleChange}
              placeholder="LeetCode"
              className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Difficulty
            </label>
            <select
              name="difficulty"
              value={formData.difficulty}
              onChange={handleChange}
              className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Language Planned
            </label>
            <select
              name="language_planned"
              value={formData.language_planned}
              onChange={handleChange}
              className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option>Python</option>
              <option>Java</option>
              <option>JavaScript</option>
              <option>C++</option>
              <option>SQL</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Target Date
            </label>
            <input
              type="date"
              name="target_date"
              value={formData.target_date}
              onChange={handleChange}
              className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Topics
          </label>
          <input
            type="text"
            name="topics"
            value={formData.topics}
            onChange={handleChange}
            placeholder="Example: Linked List, Recursion"
            className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-900"
          />
          <p className="text-xs text-slate-500 mt-1">
            Separate topics with commas.
          </p>
        </div>

        <button
          type="submit"
          className="bg-slate-950 text-white px-8 py-3 rounded-xl font-semibold hover:bg-slate-800"
        >
          Save Statement
        </button>
      </form>

      {message && (
        <div className="mb-6 bg-slate-100 border rounded-xl p-4 font-semibold text-slate-800">
          {message}
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={() => setFilter("all")}
          className={`px-5 py-2 rounded-xl font-semibold ${
            filter === "all"
              ? "bg-slate-950 text-white"
              : "bg-white border text-slate-700"
          }`}
        >
          All
        </button>

        <button
          onClick={() => setFilter("pending")}
          className={`px-5 py-2 rounded-xl font-semibold ${
            filter === "pending"
              ? "bg-orange-500 text-white"
              : "bg-white border text-slate-700"
          }`}
        >
          Pending
        </button>

        <button
          onClick={() => setFilter("solved")}
          className={`px-5 py-2 rounded-xl font-semibold ${
            filter === "solved"
              ? "bg-green-600 text-white"
              : "bg-white border text-slate-700"
          }`}
        >
          Solved
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-lg font-semibold">
          Loading statements...
        </div>
      ) : statements.length === 0 ? (
        <div className="bg-white rounded-2xl shadow border p-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900">
            No statements found
          </h2>
          <p className="text-slate-600 mt-2">
            Add a problem statement to start planning your practice.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {statements.map((statement) => (
            <div
              key={statement.id}
              className="bg-white rounded-2xl shadow border p-6 hover:shadow-lg transition"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {statement.title}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Source: {statement.source || "Not added"}
                  </p>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    statement.status?.toLowerCase() === "solved"
                      ? "bg-green-100 text-green-700"
                      : "bg-orange-100 text-orange-700"
                  }`}
                >
                  {statement.status}
                </span>
              </div>

              <p className="text-slate-700 mt-4 line-clamp-3">
                {statement.problem_statement}
              </p>

              <div className="flex flex-wrap gap-2 mt-4">
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-sm font-semibold">
                  {statement.difficulty}
                </span>

                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
                  {statement.language_planned || "No language"}
                </span>

                {statement.topics?.map((topic) => (
                  <span
                    key={topic}
                    className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold"
                  >
                    {topic}
                  </span>
                ))}
              </div>

              {statement.target_date && (
                <p className="text-sm text-slate-500 mt-4">
                  Target Date: {statement.target_date}
                </p>
              )}

              <div className="flex flex-wrap gap-3 mt-6">
                {statement.status?.toLowerCase() !== "solved" && (
                  <button
                    onClick={() => markAsSolved(statement.id)}
                    className="bg-green-600 text-white px-5 py-2 rounded-xl font-semibold hover:bg-green-700"
                  >
                    Mark Solved
                  </button>
                )}

                <button
                  onClick={() => deleteStatement(statement.id)}
                  className="bg-red-600 text-white px-5 py-2 rounded-xl font-semibold hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Statements;