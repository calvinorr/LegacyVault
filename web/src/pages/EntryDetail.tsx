import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getEntry, updateEntry, deleteEntry, Entry } from "../api";

export default function EntryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [entry, setEntry] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!id) return;
      try {
        const res = await getEntry(id);
        setEntry(res.entry);
        setTitle(res.entry.title);
        setNotes(res.entry.notes || "");
      } catch (err: any) {
        setError(err.message || "Failed to load entry");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  async function save() {
    if (!id) return;
    try {
      const res = await updateEntry(id, { title, notes });
      setEntry(res.entry);
      setEditing(false);
    } catch (err: any) {
      setError(err.message || "Failed to save");
    }
  }

  async function remove() {
    if (!id) return;
    try {
      await deleteEntry(id);
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Failed to delete");
    }
  }

  if (loading) return <div className="container">Loading…</div>;
  if (error) return <div className="container text-red-600">{error}</div>;
  if (!entry) return <div className="container">Not found</div>;

  return (
    <div className="container">
      <div className="card flex items-center justify-between">
        {!editing ? (
          <h2 className="text-xl font-semibold">{entry.title}</h2>
        ) : (
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border rounded-lg px-3 py-2 w-full"
          />
        )}
        <div className="flex items-center gap-2">
          {!editing ? (
            <button onClick={() => setEditing(true)} className="btn">
              Edit
            </button>
          ) : (
            <button onClick={save} className="btn">
              Save
            </button>
          )}
          <button onClick={remove} className="btn bg-gray-200 text-black">
            Delete
          </button>
        </div>
      </div>

      <div className="mt-4 text-muted">
        {entry.type} • {entry.provider}
      </div>

      <section className="card mt-4">
        <h3 className="text-lg font-medium">Notes</h3>
        {!editing ? (
          <div className="text-muted">{entry.notes || <em>No notes</em>}</div>
        ) : (
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={6}
            className="w-full border rounded-lg p-2"
          />
        )}
      </section>

      <section className="mt-4">
        <div className="text-sm text-muted mb-2">Account details</div>
        <pre className="card bg-surface p-3 rounded-lg border">
          {JSON.stringify(entry.accountDetails || {}, null, 2)}
        </pre>
      </section>
    </div>
  );
}
