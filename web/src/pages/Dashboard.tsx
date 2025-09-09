import React, { useEffect, useState } from "react";
import { getEntries, createEntry, Entry } from "../api";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("account");

  useEffect(() => {
    (async () => {
      try {
        const data = await getEntries();
        setEntries(data.entries);
      } catch (err: any) {
        setError(err.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleCreate(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);
    try {
      await createEntry({ title: title.trim(), type });
      setTitle("");
      setType("account");
      const data = await getEntries();
      setEntries(data.entries);
    } catch (err: any) {
      setError(err.message || "Create failed");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="container">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Dashboard</h2>
          <p className="text-sm text-muted">
            Overview of your household entries
          </p>
        </div>
        <div className="text-sm text-muted">Quick actions</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card">
          <div className="text-sm text-muted">Total entries</div>
          <div className="text-2xl font-bold mt-2">{entries.length}</div>
        </div>
        <div className="card">
          <div className="text-sm text-muted">Recent uploads</div>
          <div className="text-2xl font-bold mt-2">—</div>
        </div>
        <div className="card">
          <div className="text-sm text-muted">Pending approvals</div>
          <div className="text-2xl font-bold mt-2">—</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium">Recent entries</h3>
              <button className="text-sm text-muted">View all</button>
            </div>

            {loading && <div className="text-muted">Loading…</div>}
            {error && <div className="text-red-600">{error}</div>}

            <div className="space-y-3 mt-3">
              {entries.length === 0 && !loading && (
                <div className="text-muted">No entries yet.</div>
              )}
              {entries.map((e) => (
                <div
                  key={e._id}
                  className="flex items-center justify-between bg-surface rounded-lg p-3 border border-gray-100"
                >
                  <div>
                    <div className="font-semibold">{e.title}</div>
                    <div className="text-sm text-muted">
                      {e.type} • {e.provider || "—"}
                    </div>
                  </div>
                  <div>
                    <Link
                      to={`/entry/${e._id}`}
                      className="text-brand hover:underline"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside>
          <div className="card">
            <h3 className="text-lg font-medium mb-2">Add entry</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-sm text-muted mb-1">Title</label>
                <input
                  className="w-full border rounded-lg px-3 py-2"
                  value={title}
                  onChange={(ev) => setTitle(ev.target.value)}
                  placeholder="e.g. NatWest - Joint Current Account"
                />
              </div>

              <div>
                <label className="block text-sm text-muted mb-1">Type</label>
                <select
                  value={type}
                  onChange={(ev) => setType(ev.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="account">Account</option>
                  <option value="utility">Utility</option>
                  <option value="policy">Policy</option>
                  <option value="provider">Provider</option>
                  <option value="note">Note</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button type="submit" className="btn" disabled={creating}>
                  {creating ? "Creating…" : "Create"}
                </button>
                <button
                  type="button"
                  className="btn bg-gray-200 text-black"
                  onClick={() => {
                    setTitle("");
                    setType("account");
                  }}
                >
                  Reset
                </button>
              </div>
            </form>
          </div>
        </aside>
      </div>
    </div>
  );
}
