import { useEffect, useState } from "react";
import API from "../api/api";

function RevisionMode() {
  const [revisionItems, setRevisionItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [showAnswer, setShowAnswer] = useState(false);

  const fetchRevisionData = async () => {
    try {
      setLoading(true);

      const problemsResponse = await API.get("/api/problems/");
      const knowledgeResponse = await API.get("/api/knowledge/");

      const problems = problemsResponse.data.problems || [];
      const notes = knowledgeResponse.data.notes || [];

      const problemItems = problems.map((problem) => ({
        id: problem.id,
        type: "Problem",
        title: problem.title,
        subtitle: `${problem.language} • ${problem.difficulty}`,
        tags: problem.topics || [],
        raw: problem,
      }));

      const knowledgeItems = notes.map((note) => ({
        id: note.id,
        type: "Knowledge Note",
        title: note.title,
        subtitle: `${note.category} • ${note.note_type}`,
        tags: note.tags || [],
        raw: note,
      }));

      const combinedItems = [...problemItems, ...knowledgeItems];

      setRevisionItems(combinedItems);
      setFilteredItems(combinedItems);

      if (combinedItems.length > 0) {
        setSelectedItem(combinedItems[0]);
      }
    } catch (error) {
      console.error("Revision data error:", error);
      setMessage("Failed to load revision data. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevisionData();
  }, []);

  useEffect(() => {
    let result = [...revisionItems];

    if (search.trim() !== "") {
      result = result.filter((item) => {
        const titleMatch = item.title
          .toLowerCase()
          .includes(search.toLowerCase());

        const subtitleMatch = item.subtitle
          .toLowerCase()
          .includes(search.toLowerCase());

        const tagMatch = item.tags?.some((tag) =>
          tag.toLowerCase().includes(search.toLowerCase())
        );

        return titleMatch || subtitleMatch || tagMatch;
      });
    }

    if (typeFilter !== "All") {
      result = result.filter((item) => item.type === typeFilter);
    }

    setFilteredItems(result);

    if (result.length > 0) {
      setSelectedItem(result[0]);
      setShowAnswer(false);
    } else {
      setSelectedItem(null);
    }
  }, [search, typeFilter, revisionItems]);

  const selectItem = (item) => {
    setSelectedItem(item);
    setShowAnswer(false);
  };

  const goToNext = () => {
    if (!selectedItem || filteredItems.length === 0) return;

    const currentIndex = filteredItems.findIndex(
      (item) => item.id === selectedItem.id && item.type === selectedItem.type
    );

    const nextIndex = (currentIndex + 1) % filteredItems.length;

    setSelectedItem(filteredItems[nextIndex]);
    setShowAnswer(false);
  };

  const goToPrevious = () => {
    if (!selectedItem || filteredItems.length === 0) return;

    const currentIndex = filteredItems.findIndex(
      (item) => item.id === selectedItem.id && item.type === selectedItem.type
    );

    const previousIndex =
      currentIndex === 0 ? filteredItems.length - 1 : currentIndex - 1;

    setSelectedItem(filteredItems[previousIndex]);
    setShowAnswer(false);
  };

  const resetFilters = () => {
    setSearch("");
    setTypeFilter("All");
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-lg font-semibold">
        Loading revision mode...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900">Revision Mode</h1>
        <p className="text-slate-600 mt-2">
          Revise your solved problems and Knowledge Vault notes together like flashcards.
        </p>
      </div>

      {message && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 font-semibold">
          {message}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow border p-6 mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">
          Search & Choose Revision Type
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search by title, tag, language, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="md:col-span-2 border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-900"
          />

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-900"
          >
            <option>All</option>
            <option>Problem</option>
            <option>Knowledge Note</option>
          </select>
        </div>

        <div className="flex items-center justify-between mt-4">
          <p className="text-slate-600">
            Showing{" "}
            <span className="font-bold text-slate-900">
              {filteredItems.length}
            </span>{" "}
            of{" "}
            <span className="font-bold text-slate-900">
              {revisionItems.length}
            </span>{" "}
            revision items
          </p>

          <button
            onClick={resetFilters}
            className="px-5 py-2 rounded-xl border font-semibold hover:bg-slate-100"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl shadow border p-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900">
            No revision items found
          </h2>
          <p className="text-slate-600 mt-2">
            Add solved problems or Knowledge Vault notes first.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow border p-6 lg:col-span-1">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Revision List
            </h2>

            <div className="space-y-3 max-h-[700px] overflow-y-auto pr-2">
              {filteredItems.map((item) => (
                <button
                  key={`${item.type}-${item.id}`}
                  onClick={() => selectItem(item)}
                  className={`w-full text-left border rounded-xl p-4 transition ${
                    selectedItem?.id === item.id &&
                    selectedItem?.type === item.type
                      ? "bg-slate-950 text-white border-slate-950"
                      : "bg-white hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold">{item.title}</h3>
                      <p
                        className={`text-sm mt-1 ${
                          selectedItem?.id === item.id &&
                          selectedItem?.type === item.type
                            ? "text-slate-300"
                            : "text-slate-500"
                        }`}
                      >
                        {item.subtitle}
                      </p>
                    </div>

                    <span
                      className={`text-xs px-2 py-1 rounded-full font-semibold ${
                        item.type === "Problem"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-indigo-100 text-indigo-700"
                      }`}
                    >
                      {item.type}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedItem && (
              <RevisionCard
                item={selectedItem}
                showAnswer={showAnswer}
                setShowAnswer={setShowAnswer}
                goToNext={goToNext}
                goToPrevious={goToPrevious}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function RevisionCard({
  item,
  showAnswer,
  setShowAnswer,
  goToNext,
  goToPrevious,
}) {
  if (item.type === "Problem") {
    return (
      <ProblemRevisionCard
        item={item}
        showAnswer={showAnswer}
        setShowAnswer={setShowAnswer}
        goToNext={goToNext}
        goToPrevious={goToPrevious}
      />
    );
  }

  return (
    <KnowledgeRevisionCard
      item={item}
      showAnswer={showAnswer}
      setShowAnswer={setShowAnswer}
      goToNext={goToNext}
      goToPrevious={goToPrevious}
    />
  );
}

function ProblemRevisionCard({
  item,
  showAnswer,
  setShowAnswer,
  goToNext,
  goToPrevious,
}) {
  const problem = item.raw;

  return (
    <div className="bg-white rounded-2xl shadow border p-8">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
          Problem
        </span>

        <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-sm font-semibold">
          {problem.language}
        </span>

        <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-sm font-semibold">
          {problem.difficulty}
        </span>
      </div>

      <h2 className="text-3xl font-bold text-slate-900 mb-4">
        {problem.title}
      </h2>

      <div className="bg-slate-50 border rounded-xl p-5 mb-6">
        <h3 className="font-bold text-slate-900 mb-2">Question</h3>
        <p className="text-slate-700 whitespace-pre-wrap leading-7">
          {problem.problem_statement}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {problem.topics?.map((topic) => (
          <span
            key={topic}
            className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold"
          >
            {topic}
          </span>
        ))}
      </div>

      <button
        onClick={() => setShowAnswer(!showAnswer)}
        className="bg-slate-950 text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-800 mb-6"
      >
        {showAnswer ? "Hide Answer" : "Show Answer"}
      </button>

      {showAnswer && (
        <div className="space-y-6">
          <div className="bg-slate-950 rounded-2xl p-6">
            <h3 className="text-white text-xl font-bold mb-4">Code</h3>
            <pre className="overflow-x-auto text-sm text-slate-100 leading-7">
              <code>{problem.code}</code>
            </pre>
          </div>

          <div className="bg-white border rounded-2xl p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-3">Summary</h3>
            <p className="text-slate-700 leading-7">
              {problem.summary || "No summary available."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 border rounded-xl p-5">
              <p className="text-slate-500 text-sm">Time Complexity</p>
              <p className="text-2xl font-bold text-slate-900">
                {problem.time_complexity || "Not available"}
              </p>
            </div>

            <div className="bg-slate-50 border rounded-xl p-5">
              <p className="text-slate-500 text-sm">Space Complexity</p>
              <p className="text-2xl font-bold text-slate-900">
                {problem.space_complexity || "Not available"}
              </p>
            </div>
          </div>

          <div className="bg-white border rounded-2xl p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-3">
              Interview Explanation
            </h3>
            <p className="text-slate-700 whitespace-pre-wrap leading-7">
              {problem.interview_explanation ||
                "No interview explanation available."}
            </p>
          </div>
        </div>
      )}

      <RevisionNavigation goToPrevious={goToPrevious} goToNext={goToNext} />
    </div>
  );
}

function KnowledgeRevisionCard({
  item,
  showAnswer,
  setShowAnswer,
  goToNext,
  goToPrevious,
}) {
  const note = item.raw;

  return (
    <div className="bg-white rounded-2xl shadow border p-8">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold">
          Knowledge Note
        </span>

        <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-sm font-semibold">
          {note.note_type}
        </span>

        <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-sm font-semibold">
          {note.skill_level}
        </span>
      </div>

      <h2 className="text-3xl font-bold text-slate-900 mb-2">{note.title}</h2>

      <p className="text-slate-500 mb-6">{note.category}</p>

      <div className="bg-slate-50 border rounded-xl p-5 mb-6">
        <h3 className="font-bold text-slate-900 mb-2">Prompt</h3>
        <p className="text-slate-700 whitespace-pre-wrap leading-7">
          {note.description}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {note.tags?.map((tag) => (
          <span
            key={tag}
            className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold"
          >
            {tag}
          </span>
        ))}
      </div>

      <button
        onClick={() => setShowAnswer(!showAnswer)}
        className="bg-slate-950 text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-800 mb-6"
      >
        {showAnswer ? "Hide Note" : "Show Note"}
      </button>

      {showAnswer && (
        <div className="space-y-6">
          {note.code_snippet && (
            <div className="bg-slate-950 rounded-2xl p-6">
              <h3 className="text-white text-xl font-bold mb-4">
                Code / Logic
              </h3>
              <pre className="overflow-x-auto text-sm text-slate-100 leading-7">
                <code>{note.code_snippet}</code>
              </pre>
            </div>
          )}

          <div className="bg-white border rounded-2xl p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-3">
              Explanation
            </h3>
            <p className="text-slate-700 whitespace-pre-wrap leading-7">
              {note.explanation || "No explanation added."}
            </p>
          </div>
        </div>
      )}

      <RevisionNavigation goToPrevious={goToPrevious} goToNext={goToNext} />
    </div>
  );
}

function RevisionNavigation({ goToPrevious, goToNext }) {
  return (
    <div className="flex justify-between mt-8 pt-6 border-t">
      <button
        onClick={goToPrevious}
        className="bg-white border px-6 py-3 rounded-xl font-semibold hover:bg-slate-100"
      >
        Previous
      </button>

      <button
        onClick={goToNext}
        className="bg-slate-950 text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-800"
      >
        Next
      </button>
    </div>
  );
}

export default RevisionMode;