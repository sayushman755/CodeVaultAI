import { useState } from "react";
import API from "../api/api";

function AddProblem() {
  const [formData, setFormData] = useState({
    title: "",
    problem_statement: "",
    date_solved: "",
    language: "Python",
    difficulty: "Easy",
    topics: "",
    code: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [savedProblem, setSavedProblem] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setSavedProblem(null);

    try {
      const payload = {
        ...formData,
        topics: formData.topics
          .split(",")
          .map((topic) => topic.trim())
          .filter((topic) => topic !== ""),
      };

      const response = await API.post("/api/problems/generate-and-save", payload);

      setSavedProblem(response.data.problem);
      setMessage("Problem saved successfully with AI explanation!");

      setFormData({
        title: "",
        problem_statement: "",
        date_solved: "",
        language: "Python",
        difficulty: "Easy",
        topics: "",
        code: "",
      });
    } catch (error) {
      console.error("Add problem error:", error);
      setMessage(
        error.response?.data?.detail || "Something went wrong. Check backend or API key."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900">Add Problem</h1>
        <p className="text-slate-600 mt-2">
          Paste your code and let AI generate line-by-line explanation before saving.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow border p-8 space-y-6"
      >
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
            placeholder="Example: Two Sum"
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Date Solved
            </label>
            <input
              type="date"
              name="date_solved"
              value={formData.date_solved}
              onChange={handleChange}
              required
              className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Language
            </label>
            <select
              name="language"
              value={formData.language}
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
            placeholder="Example: Array, HashMap, Two Pointer"
            className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-900"
          />
          <p className="text-xs text-slate-500 mt-1">
            Separate topics with commas.
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Code
          </label>
          <textarea
            name="code"
            value={formData.code}
            onChange={handleChange}
            required
            rows="12"
            placeholder="Paste your code here..."
            className="w-full border rounded-xl px-4 py-3 font-mono text-sm outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-slate-950 text-white px-8 py-3 rounded-xl font-semibold hover:bg-slate-800 disabled:opacity-60"
        >
          {loading ? "Generating AI Explanation..." : "Generate Explanation & Save"}
        </button>
      </form>

      {message && (
        <div className="mt-6 bg-slate-100 border rounded-xl p-4 font-semibold text-slate-800">
          {message}
        </div>
      )}

      {savedProblem && (
        <div className="mt-8 bg-white rounded-2xl shadow border p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Saved Problem Preview
          </h2>

          <p className="mb-2">
            <span className="font-semibold">Title:</span> {savedProblem.title}
          </p>

          <p className="mb-2">
            <span className="font-semibold">Language:</span>{" "}
            {savedProblem.language}
          </p>

          <p className="mb-2">
            <span className="font-semibold">Time Complexity:</span>{" "}
            {savedProblem.time_complexity}
          </p>

          <p className="mb-4">
            <span className="font-semibold">Space Complexity:</span>{" "}
            {savedProblem.space_complexity}
          </p>

          <div>
            <h3 className="text-xl font-bold mb-2">Summary</h3>
            <p className="text-slate-700">{savedProblem.summary}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddProblem;