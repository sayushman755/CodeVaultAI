import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/api";

function ProblemList() {
  const [problems, setProblems] = useState([]);
  const [filteredProblems, setFilteredProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [search, setSearch] = useState("");
  const [languageFilter, setLanguageFilter] = useState("All");
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [topicFilter, setTopicFilter] = useState("");

  const fetchProblems = async () => {
    try {
      const response = await API.get("/api/problems/");
      const data = response.data.problems || [];
      setProblems(data);
      setFilteredProblems(data);
    } catch (error) {
      console.error("Fetch problems error:", error);
      setMessage("Failed to load problems. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  useEffect(() => {
    let result = [...problems];

    if (search.trim() !== "") {
      result = result.filter((problem) =>
        problem.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (languageFilter !== "All") {
      result = result.filter(
        (problem) =>
          problem.language.toLowerCase() === languageFilter.toLowerCase()
      );
    }

    if (difficultyFilter !== "All") {
      result = result.filter(
        (problem) =>
          problem.difficulty.toLowerCase() === difficultyFilter.toLowerCase()
      );
    }

    if (topicFilter.trim() !== "") {
      result = result.filter((problem) =>
        problem.topics?.some((topic) =>
          topic.toLowerCase().includes(topicFilter.toLowerCase())
        )
      );
    }

    setFilteredProblems(result);
  }, [search, languageFilter, difficultyFilter, topicFilter, problems]);

  const deleteProblem = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this problem?"
    );

    if (!confirmDelete) return;

    try {
      await API.delete(`/api/problems/${id}`);

      const updatedProblems = problems.filter((problem) => problem.id !== id);

      setProblems(updatedProblems);
      setFilteredProblems(updatedProblems);
      setMessage("Problem deleted successfully.");
    } catch (error) {
      console.error("Delete problem error:", error);
      setMessage("Failed to delete problem.");
    }
  };

  const resetFilters = () => {
    setSearch("");
    setLanguageFilter("All");
    setDifficultyFilter("All");
    setTopicFilter("");
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-lg font-semibold">
        Loading problems...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Solved Problems</h1>
          <p className="text-slate-600 mt-2">
            Search, filter, and revise all coding problems saved in your
            CodeVault.
          </p>
        </div>

        <Link
          to="/add-problem"
          className="bg-slate-950 text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-800 text-center"
        >
          Add New Problem
        </Link>
      </div>

      {message && (
        <div className="mb-6 bg-slate-100 border rounded-xl p-4 font-semibold text-slate-800">
          {message}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow border p-6 mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">
          Search & Filters
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-900"
          />

          <select
            value={languageFilter}
            onChange={(e) => setLanguageFilter(e.target.value)}
            className="border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-900"
          >
            <option>All</option>
            <option>Python</option>
            <option>Java</option>
            <option>JavaScript</option>
            <option>C++</option>
            <option>SQL</option>
          </select>

          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-900"
          >
            <option>All</option>
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>

          <input
            type="text"
            placeholder="Filter by topic..."
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value)}
            className="border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div className="flex items-center justify-between mt-4">
          <p className="text-slate-600">
            Showing{" "}
            <span className="font-bold text-slate-900">
              {filteredProblems.length}
            </span>{" "}
            of{" "}
            <span className="font-bold text-slate-900">{problems.length}</span>{" "}
            problems
          </p>

          <button
            onClick={resetFilters}
            className="px-5 py-2 rounded-xl border font-semibold hover:bg-slate-100"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {filteredProblems.length === 0 ? (
        <div className="bg-white rounded-2xl shadow border p-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900">
            No problems found
          </h2>
          <p className="text-slate-600 mt-2">
            Try changing your search or filter values.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProblems.map((problem) => (
            <div
              key={problem.id}
              className="bg-white rounded-2xl shadow border p-6 hover:shadow-lg transition"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {problem.title}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Solved on {problem.date_solved}
                  </p>
                </div>

                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-sm font-semibold">
                  {problem.difficulty}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
                  {problem.language}
                </span>

                {problem.topics?.map((topic) => (
                  <span
                    key={topic}
                    className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold"
                  >
                    {topic}
                  </span>
                ))}
              </div>

              <p className="text-slate-700 mt-4 line-clamp-3">
                {problem.summary || "No summary available."}
              </p>

              <div className="flex flex-wrap gap-3 mt-6">
                <Link
                  to={`/problems/${problem.id}`}
                  className="bg-slate-950 text-white px-5 py-2 rounded-xl font-semibold hover:bg-slate-800"
                >
                  View Details
                </Link>

                <Link
                  to={`/problems/edit/${problem.id}`}
                  className="bg-blue-600 text-white px-5 py-2 rounded-xl font-semibold hover:bg-blue-700"
                >
                  Edit
                </Link>

                <button
                  onClick={() => deleteProblem(problem.id)}
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

export default ProblemList;