import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import API from "../api/api";

function ProblemDetail() {
  const { id } = useParams();

  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchProblem = async () => {
    try {
      const response = await API.get(`/api/problems/${id}`);
      setProblem(response.data.problem);
    } catch (error) {
      console.error("Problem detail error:", error);
      setMessage("Failed to load problem details.");
    } finally {
      setLoading(false);
    }
  };

  const downloadRevisionNote = () => {
    if (!problem) return;

    const explanationText =
      problem.line_by_line_explanation
        ?.map((item) => {
          return `Line ${item.line}: ${item.code}\nExplanation: ${item.explanation}`;
        })
        .join("\n\n") || "No line-by-line explanation available.";

    const content = `
CODEVAULT AI - REVISION NOTE

Title: ${problem.title}
Date Solved: ${problem.date_solved}
Language: ${problem.language}
Difficulty: ${problem.difficulty}
Topics: ${problem.topics?.join(", ") || "No topics"}

----------------------------------------
PROBLEM STATEMENT
----------------------------------------
${problem.problem_statement}

----------------------------------------
CODE
----------------------------------------
${problem.code}

----------------------------------------
LINE-BY-LINE EXPLANATION
----------------------------------------
${explanationText}

----------------------------------------
SUMMARY
----------------------------------------
${problem.summary || "No summary available."}

----------------------------------------
COMPLEXITY
----------------------------------------
Time Complexity: ${problem.time_complexity || "Not available"}
Space Complexity: ${problem.space_complexity || "Not available"}

----------------------------------------
INTERVIEW EXPLANATION
----------------------------------------
${problem.interview_explanation || "No interview explanation available."}
`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const safeTitle = problem.title
      .replaceAll(" ", "_")
      .replace(/[^\w-]/g, "");

    const link = document.createElement("a");
    link.href = url;
    link.download = `${safeTitle}_revision_note.txt`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchProblem();
  }, [id]);

  if (loading) {
    return (
      <div className="p-8 text-center text-lg font-semibold">
        Loading problem details...
      </div>
    );
  }

  if (message) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 font-semibold">
          {message}
        </div>

        <Link
          to="/problems"
          className="inline-block mt-6 bg-slate-950 text-white px-6 py-3 rounded-xl font-semibold"
        >
          Back to Problems
        </Link>
      </div>
    );
  }

  if (!problem) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <Link to="/problems" className="text-blue-600 font-semibold">
            ← Back to Problems
          </Link>

          <h1 className="text-4xl font-bold text-slate-900 mt-4">
            {problem.title}
          </h1>

          <p className="text-slate-600 mt-2">
            Solved on {problem.date_solved}
          </p>
        </div>

        <div className="flex flex-col items-start md:items-end gap-3">
          <div className="flex flex-wrap gap-2">
            <span className="px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-semibold">
              {problem.language}
            </span>

            <span className="px-4 py-2 rounded-full bg-slate-100 text-slate-700 font-semibold">
              {problem.difficulty}
            </span>
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            <Link
              to={`/problems/edit/${problem.id}`}
              className="bg-slate-950 text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-800 text-center"
            >
              Edit Problem
            </Link>

            <button
              onClick={downloadRevisionNote}
              className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700"
            >
              Download Revision Note
            </button>
          </div>
        </div>
      </div>

      <section className="bg-white rounded-2xl shadow border p-8 mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">
          Problem Statement
        </h2>

        <p className="text-slate-700 leading-7 whitespace-pre-wrap">
          {problem.problem_statement}
        </p>
      </section>

      <section className="bg-white rounded-2xl shadow border p-8 mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Topics</h2>

        <div className="flex flex-wrap gap-2">
          {problem.topics?.length > 0 ? (
            problem.topics.map((topic) => (
              <span
                key={topic}
                className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold"
              >
                {topic}
              </span>
            ))
          ) : (
            <p className="text-slate-500">No topics added.</p>
          )}
        </div>
      </section>

      <section className="bg-slate-950 rounded-2xl shadow border p-8 mb-6">
        <h2 className="text-2xl font-bold text-white mb-4">Code</h2>

        <pre className="overflow-x-auto text-sm leading-7 text-slate-100">
          <code>{problem.code}</code>
        </pre>
      </section>

      <section className="bg-white rounded-2xl shadow border p-8 mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">
          Line-by-Line Explanation
        </h2>

        {problem.line_by_line_explanation?.length > 0 ? (
          <div className="space-y-4">
            {problem.line_by_line_explanation.map((item, index) => (
              <div key={index} className="border rounded-xl p-4 bg-slate-50">
                <div className="flex items-start gap-4">
                  <span className="min-w-12 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-sm font-bold">
                    {item.line}
                  </span>

                  <div className="w-full">
                    <pre className="bg-slate-900 text-slate-100 rounded-lg p-3 overflow-x-auto text-sm">
                      <code>{item.code}</code>
                    </pre>

                    <p className="text-slate-700 mt-3 leading-7">
                      {item.explanation}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500">
            No line-by-line explanation available.
          </p>
        )}
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl shadow border p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Summary</h2>

          <p className="text-slate-700 leading-7">
            {problem.summary || "No summary available."}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow border p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Complexity
          </h2>

          <div className="space-y-4">
            <div>
              <p className="text-slate-500 text-sm">Time Complexity</p>
              <p className="text-2xl font-bold text-slate-900">
                {problem.time_complexity || "Not available"}
              </p>
            </div>

            <div>
              <p className="text-slate-500 text-sm">Space Complexity</p>
              <p className="text-2xl font-bold text-slate-900">
                {problem.space_complexity || "Not available"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-2xl shadow border p-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">
          Interview Explanation
        </h2>

        <p className="text-slate-700 leading-7 whitespace-pre-wrap">
          {problem.interview_explanation ||
            "No interview explanation available."}
        </p>
      </section>
    </div>
  );
}

export default ProblemDetail;