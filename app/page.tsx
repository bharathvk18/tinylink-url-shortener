'use client';

import { useEffect, useState } from 'react';

type Link = {
  code: string;
  targetUrl: string;
  clickCount: number;
  lastClickedAt: string | null;
  createdAt: string;
};

export default function HomePage() {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [url, setUrl] = useState('');
  const [code, setCode] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const [filter, setFilter] = useState('');

  async function fetchLinks() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/links');
      if (!res.ok) throw new Error('Failed to load links');
      const data = await res.json();
      setLinks(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLinks();
  }, []);

  function validateCodeFormat(value: string) {
    if (!value) return true;
    return /^[A-Za-z0-9]{6,8}$/.test(value);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);

    if (!url.trim()) {
      setSubmitError('URL is required');
      return;
    }
    if (code && !validateCodeFormat(code)) {
      setSubmitError('Code must be 6–8 letters/numbers');
      return;
    }

    setSubmitLoading(true);
    try {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url.trim(),
          code: code.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          setSubmitError('Code already exists');
        } else {
          setSubmitError(data.error || 'Failed to create link');
        }
        return;
      }

      setSubmitSuccess(`Short link created: /${data.code}`);
      setUrl('');
      setCode('');
      fetchLinks();
    } catch {
      setSubmitError('Something went wrong');
    } finally {
      setSubmitLoading(false);
    }
  }

  async function handleDelete(code: string) {
    if (!confirm(`Delete link /${code}?`)) return;
    await fetch(`/api/links/${code}`, {
      method: 'DELETE',
    });
    fetchLinks();
  }

  const filteredLinks = links.filter((l) => {
    const search = filter.toLowerCase();
    return (
      l.code.toLowerCase().includes(search) ||
      l.targetUrl.toLowerCase().includes(search)
    );
  });

  function formatDate(value: string | null) {
    if (!value) return 'Never';
    return new Date(value).toLocaleString();
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3-2xl font-bold mb-6">TinyLink Dashboard</h1>

        {/* Create Link Form */}
        <section className="mb-10 bg-slate-900 p-5 rounded-xl border border-slate-800">
          <h2 className="text-xl font-semibold mb-3">Create a short link</h2>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-sm">Long URL</label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700"
              />
            </div>

            <div>
              <label className="text-sm">Custom Code (optional)</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="6–8 characters"
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700"
              />
            </div>

            {submitError && (
              <p className="text-sm text-red-400">{submitError}</p>
            )}
            {submitSuccess && (
              <p className="text-sm text-emerald-400">{submitSuccess}</p>
            )}

            <button
              type="submit"
              disabled={submitLoading}
              className="bg-sky-600 px-4 py-2 rounded-lg hover:bg-sky-500 disabled:opacity-50"
            >
              {submitLoading ? 'Creating...' : 'Create Link'}
            </button>
          </form>
        </section>

        {/* Filter */}
        <input
          type="text"
          placeholder="Search links..."
          className="w-full px-3 py-2 mb-4 rounded-lg bg-slate-900 border border-slate-700"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />

        {/* Links Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-900">
              <tr>
                <th className="px-3 py-2 text-left">Code</th>
                <th className="px-3 py-2 text-left">Target URL</th>
                <th className="px-3 py-2 text-left">Clicks</th>
                <th className="px-3 py-2 text-left">Last Click</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredLinks.map((l) => (
                <tr key={l.code} className="border-t border-slate-800">
                  <td className="px-3 py-2">
                    <a
                      href={`/code/${l.code}`}
                      className="text-sky-400 hover:underline"
                    >
                      {l.code}
                    </a>
                  </td>
                  <td className="px-3 py-2 max-w-sm truncate">{l.targetUrl}</td>
                  <td className="px-3 py-2">{l.clickCount}</td>
                  <td className="px-3 py-2">{formatDate(l.lastClickedAt)}</td>
                  <td className="px-3 py-2 text-right">
                    <button
                      onClick={() => handleDelete(l.code)}
                      className="px-2 py-1 bg-red-600 rounded-lg text-xs hover:bg-red-500"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
