import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import API from "../api/api";

function EditProblem() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    problem_statement: "",
    date_solved: "",
    language: "Python",
    difficulty: "Easy",
    topics: "",
    code: "",
    line_by_line_explanation: [],
    summary: "",
    time_complexity: "",
    space_complexity: "",
    interview_explanation: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [message, setMessage] = useState("");

  const fetchProblem = async () => {
    try {
      const response = await API.get(`/api/problems/${id}`);
      const problem = response.data.problem;

      setFormData({
        title: problem.title || "",
        problem_statement: problem.problem_statement || "",
        date_solved: problem.date_solved || "",
        language: problem.language || "Python",
        difficulty: problem.difficulty || "Easy",
        topics: problem.topics?.join(", ") || "",
        code: problem.code || "",
        line_by_line_explanation: problem.line_by_line_explanation || [],
        summary: problem.summary || "",
        time_complexity: problem.time_complexity || "",
        space_complexity: problem.space_complexity || "",
        interview_explanation: problem.interview_explanation || "",
      });
    } catch (error) {
      console.error("Fetch problem error:", error);
      setMessage("Failed to load problem.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblem();
  }, [id]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const regenerateExplanation = async () => {
    setRegenerating(true);
    setMessage("");

    try {
      const payload = {
        title: formData.title,
        problem_statement: formData.problem_statement,
        language: formData.language,
        code: formData.code,
      };

      const response = await API.post("/api/ai/generate-explanation", payload);
      const result = response.data.result;

      setFormData({
        ...formData,
        line_by_line_explanation: result.line_by_line_explanation || [],
        summary: result.summary || "",
        time_complexity: result.time_complexity || "",
        space_complexity: result.space_complexity || "",
        interview_explanation: result.interview_explanation || "",
      });

      setMessage("AI explanation regenerated successfully. Click Update Problem to save changes.");
    } catch (error) {
      console.error("Regenerate explanation error:", error);
      setMessage(error.response?.data?.detail || "Failed to regenerate AI explanation.");
    } finally {
      setRegenerating(false);
    }
  };

  const handleExplanationChange = (index, field, value) => {
    const updatedExplanation = [...formData.line_by_line_explanation];

    updatedExplanation[index] = {
      ...updatedExplanation[index],
      [field]: value,
    };

    setFormData({
      ...formData,
      line_by_line_explanation: updatedExplanation,
    });
  };

  const addExplanationLine = () => {
    setFormData({
      ...formData,
      line_by_line_explanation: [
        ...formData.line_by_line_explanation,
        {
          line: formData.line_by_line_explanation.length + 1,
          code: "",
          explanation: "",
        },
      ],
    });
  };

  const removeExplanationLine = (index) => {
    const updatedExplanation = formData.line_by_line_explanation.filter(
      (_, i) => i !== index
    );

    setFormData({
      ...formData,
      line_by_line_explanation: updatedExplanation,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const payload = {
        ...formData,
        topics: formData.topics
          .split(",")
          .map((topic) => topic.trim())
          .filter((topic) => topic !== ""),
        line_by_line_explanation: formData.line_by_line_explanation.map(
          (item, index) => ({
            line: Number(item.line) || index + 1,
            code: item.code,
            explanation: item.explanation,
          })
        ),
      };

      await API.put(`/api/problems/${id}`, payload);

      setMessage("Problem updated successfully.");

      setTimeout(() => {
        navigate(`/problems/${id}`);
      }, 800);
    } catch (error) {
      console.error("Update problem error:", error);
      setMessage(error.response?.data?.detail || "Failed to update problem.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-lg font-semibold">
        Loading edit form...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="mb-8">
        <Link to={`/problems/${id}`} className="text-blue-600 font-semibold">
          ← Back to Problem Detail
        </Link>

        <h1 className="text-4xl font-bold text-slate-900 mt-4">
          Edit Problem
        </h1>

        <p className="text-slate-600 mt-2">
          Update your saved solution, explanation, and revision notes.
        </p>
      </div>

      {message && (
        <div className="mb-6 bg-slate-100 border rounded-xl p-4 font-semibold text-slate-800">
          {message}
        </div>
      )}

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
            placeholder="Array, HashMap, Two Pointer"
            className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-900"
          />
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
            className="w-full border rounded-xl px-4 py-3 font-mono text-sm outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={regenerateExplanation}
            disabled={regenerating}
            className="bg-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-purple-700 disabled:opacity-60"
          >
            {regenerating ? "Regenerating AI Explanation..." : "Regenerate AI Explanation"}
          </button>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Summary
          </label>
          <textarea
            name="summary"
            value={formData.summary}
            onChange={handleChange}
            rows="4"
            className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Time Complexity
            </label>
            <input
              type="text"
              name="time_complexity"
              value={formData.time_complexity}
              onChange={handleChange}
              placeholder="O(n)"
              className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Space Complexity
            </label>
            <input
              type="text"
              name="space_complexity"
              value={formData.space_complexity}
              onChange={handleChange}
              placeholder="O(n)"
              className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Interview Explanation
          </label>
          <textarea
            name="interview_explanation"
            value={formData.interview_explanation}
            onChange={handleChange}
            rows="5"
            className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div className="border rounded-2xl p-6 bg-slate-50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-slate-900">
              Line-by-Line Explanation
            </h2>

            <button
              type="button"
              onClick={addExplanationLine}
              className="bg-slate-950 text-white px-5 py-2 rounded-xl font-semibold hover:bg-slate-800"
            >
              Add Line
            </button>
          </div>

          {formData.line_by_line_explanation.length === 0 ? (
            <p className="text-slate-500">No explanation lines added.</p>
          ) : (
            <div className="space-y-4">
              {formData.line_by_line_explanation.map((item, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl border p-4 space-y-3"
                >
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                    <input
                      type="number"
                      value={item.line}
                      onChange={(e) =>
                        handleExplanationChange(index, "line", e.target.value)
                      }
                      className="border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-slate-900"
                    />

                    <input
                      type="text"
                      value={item.code}
                      onChange={(e) =>
                        handleExplanationChange(index, "code", e.target.value)
                      }
                      placeholder="Code line"
                      className="md:col-span-4 border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-slate-900"
                    />

                    <button
                      type="button"
                      onClick={() => removeExplanationLine(index)}
                      className="bg-red-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-red-700"
                    >
                      Remove
                    </button>
                  </div>

                  <textarea
                    value={item.explanation}
                    onChange={(e) =>
                      handleExplanationChange(
                        index,
                        "explanation",
                        e.target.value
                      )
                    }
                    rows="3"
                    placeholder="Explanation"
                    className="w-full border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-slate-950 text-white px-8 py-3 rounded-xl font-semibold hover:bg-slate-800 disabled:opacity-60"
        >
          {saving ? "Saving Changes..." : "Update Problem"}
        </button>
      </form>
    </div>
  );
}

export default EditProblem;