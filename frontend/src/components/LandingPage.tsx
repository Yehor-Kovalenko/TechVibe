import React, { useState } from 'react';

type LandingPageProps = { onSubmit?: (query: string) => void };

const LandingPage: React.FC<LandingPageProps> = ({ onSubmit }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = query.trim();
    if (!value) return;
    setLoading(true);
    onSubmit?.(value);
  };

  return (
    <main className="min-h-screen grid place-items-center px-6">
      <div className="max-w-2xl w-full text-center space-y-8">
        <h1 className="text-4xl font-semibold tracking-tight">
          TechVibe Review Summaries
        </h1>
        <p className="text-muted-foreground">
          Paste a product name or link to aggregate multiple video reviews and receive a concise summary that speeds up product selection.
        </p>
        <form onSubmit={handleSubmit} className="flex gap-3 max-w-2xl mx-auto">
          <input
            type="text"
            aria-label="Product name or URL"
            placeholder="e.g. Sony WH‑1000XM5 or product URL"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 px-4 py-3 rounded-md bg-card text-card-foreground border focus:ring-2 focus:ring-ring outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-3 rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Working…' : 'Generate'}
          </button>
        </form>
        <div className="text-sm text-muted-foreground">
          The tool integrates reviews from multiple platforms and distills hours of content into key pros, cons, and takeaways.
        </div>
      </div>
    </main>
  );
};

export default LandingPage;
