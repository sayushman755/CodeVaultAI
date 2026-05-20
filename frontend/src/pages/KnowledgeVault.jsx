import { useEffect, useState } from "react";
import API from "../api/api";

function KnowledgeVault() {
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");

  const [editingId, setEditingId] = useState(null);

  const emptyForm = {
    title: "",
    category: "",
    note_type: "Code Snippet",
    description: "",
    code_snippet: "",
    explanation: "",
    tags: "",
    skill_level: "Beginner",
  };

  const [formData, setFormData] = useState(emptyForm);

  const fetchNotes = async () => {
    try {
      const response = await API.get("/api/knowledge/");
      const data = response.data.notes || [];
      setNotes(data);
      setFilteredNotes(data);
    } catch (error) {
      console.error("Fetch knowledge notes error:", error);
      setMessage("Failed to load knowledge notes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    let result = [...notes];

    if (search.trim() !== "") {
      result = result.filter(
        (note) =>
          note.title.toLowerCase().includes(search.toLowerCase()) ||
          note.description.toLowerCase().includes(search.toLowerCase()) ||
          note.explanation.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (categoryFilter.trim() !== "") {
      result = result.filter((note) =>
        note.category.toLowerCase().includes(categoryFilter.toLowerCase())
      );
    }

    if (tagFilter.trim() !== "") {
      result = result.filter((note) =>
        note.tags?.some((tag) =>
          tag.toLowerCase().includes(tagFilter.toLowerCase())
        )
      );
    }

    setFilteredNotes(result);
  }, [search, categoryFilter, tagFilter, notes]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const preparePayload = () => {
    return {
      ...formData,
      tags: formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag !== ""),
    };
  };

  const createOrUpdateNote = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const payload = preparePayload();

      if (editingId) {
        await API.put(`/api/knowledge/${editingId}`, payload);
        setMessage("Knowledge note updated successfully.");
      } else {
        await API.post("/api/knowledge/", payload);
        setMessage("Knowledge note saved successfully.");
      }

      setFormData(emptyForm);
      setEditingId(null);
      fetchNotes();
    } catch (error) {
      console.error("Save knowledge note error:", error);
      setMessage(error.response?.data?.detail || "Failed to save knowledge note.");
    }
  };

  const startEdit = (note) => {
    setEditingId(note.id);

    setFormData({
      title: note.title || "",
      category: note.category || "",
      note_type: note.note_type || "Code Snippet",
      description: note.description || "",
      code_snippet: note.code_snippet || "",
      explanation: note.explanation || "",
      tags: note.tags?.join(", ") || "",
      skill_level: note.skill_level || "Beginner",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setMessage("Edit cancelled.");
  };

  const deleteNote = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this knowledge note?"
    );

    if (!confirmDelete) return;

    try {
      await API.delete(`/api/knowledge/${id}`);
      const updatedNotes = notes.filter((note) => note.id !== id);
      setNotes(updatedNotes);
      setFilteredNotes(updatedNotes);
      setMessage("Knowledge note deleted successfully.");
    } catch (error) {
      console.error("Delete knowledge note error:", error);
      setMessage("Failed to delete knowledge note.");
    }
  };

  const resetFilters = () => {
    setSearch("");
    setCategoryFilter("");
    setTagFilter("");
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-lg font-semibold">
        Loading knowledge vault...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900">Knowledge Vault</h1>
        <p className="text-slate-600 mt-2">
          Save reusable logic, new skills, project notes, and small code snippets for future revision.
        </p>
      </div>

      <form
        onSubmit={createOrUpdateNote}
        className="bg-white rounded-2xl shadow border p-8 mb-8 space-y-6"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h2 className="text-2xl font-bold text-slate-900">
            {editingId ? "Edit Knowledge Note" : "Add New Knowledge Note"}
          </h2>

          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="bg-slate-200 text-slate-800 px-5 py-2 rounded-xl font-semibold hover:bg-slate-300"
            >
              Cancel Edit
            </button>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Example: Convert comma-separated input into array"
            className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Category
            </label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              placeholder="React Logic, FastAPI, MongoDB"
              className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Note Type
            </label>
            <select
              name="note_type"
              value={formData.note_type}
              onChange={handleChange}
              className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option>Code Snippet</option>
              <option>Skill Learned</option>
              <option>Project Logic</option>
              <option>Bug Fix</option>
              <option>Command</option>
              <option>Interview Concept</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Skill Level
            </label>
            <select
              name="skill_level"
              value={formData.skill_level}
              onChange={handleChange}
              className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="3"
            placeholder="What is this note about?"
            className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Code / Logic Snippet
          </label>
          <textarea
            name="code_snippet"
            value={formData.code_snippet}
            onChange={handleChange}
            rows="6"
            placeholder="Paste reusable code, logic, command, or pattern..."
            className="w-full border rounded-xl px-4 py-3 font-mono text-sm outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Explanation / Revision Note
          </label>
          <textarea
            name="explanation"
            value={formData.explanation}
            onChange={handleChange}
            rows="4"
            placeholder="Explain why this is useful and how to use it later..."
            className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Tags
          </label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="React, JavaScript, Frontend"
            className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-900"
          />
          <p className="text-xs text-slate-500 mt-1">
            Separate tags with commas.
          </p>
        </div>

        <button
          type="submit"
          className={`px-8 py-3 rounded-xl font-semibold text-white ${
            editingId
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-slate-950 hover:bg-slate-800"
          }`}
        >
          {editingId ? "Update Knowledge Note" : "Save Knowledge Note"}
        </button>
      </form>

      {message && (
        <div className="mb-6 bg-slate-100 border rounded-xl p-4 font-semibold text-slate-800">
          {message}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow border p-6 mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">
          Search & Filter Notes
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search title, description, explanation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-900"
          />

          <input
            type="text"
            placeholder="Filter by category..."
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-900"
          />

          <input
            type="text"
            placeholder="Filter by tag..."
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className="border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div className="flex items-center justify-between mt-4">
          <p className="text-slate-600">
            Showing{" "}
            <span className="font-bold text-slate-900">
              {filteredNotes.length}
            </span>{" "}
            of <span className="font-bold text-slate-900">{notes.length}</span>{" "}
            notes
          </p>

          <button
            onClick={resetFilters}
            className="px-5 py-2 rounded-xl border font-semibold hover:bg-slate-100"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {filteredNotes.length === 0 ? (
        <div className="bg-white rounded-2xl shadow border p-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900">
            No knowledge notes found
          </h2>
          <p className="text-slate-600 mt-2">
            Add your first reusable logic or skill note.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className="bg-white rounded-2xl shadow border p-6 hover:shadow-lg transition"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {note.title}
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    {note.category}
                  </p>
                </div>

                <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold">
                  {note.note_type}
                </span>
              </div>

              <p className="text-slate-700 mt-4 whitespace-pre-wrap">
                {note.description}
              </p>

              {note.code_snippet && (
                <pre className="bg-slate-950 text-slate-100 rounded-xl p-4 mt-4 overflow-x-auto text-sm">
                  <code>{note.code_snippet}</code>
                </pre>
              )}

              {note.explanation && (
                <div className="mt-4 bg-slate-50 border rounded-xl p-4">
                  <h3 className="font-bold text-slate-900 mb-2">
                    Explanation
                  </h3>
                  <p className="text-slate-700 whitespace-pre-wrap">
                    {note.explanation}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-2 mt-4">
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-sm font-semibold">
                  {note.skill_level}
                </span>

                {note.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => startEdit(note)}
                  className="bg-blue-600 text-white px-5 py-2 rounded-xl font-semibold hover:bg-blue-700"
                >
                  Edit
                </button>

                <button
                  onClick={() => deleteNote(note.id)}
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

export default KnowledgeVault;