import { useState, lazy, Suspense } from 'react';
import { Cookie, ScanLine, ClipboardCopy, Check, AlertTriangle } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import RadarLoader from './RadarLoader';

// react-syntax-highlighter (+ Prism languages) is heavy — only pull it into
// the bundle once a submission has actually been scraped and needs rendering.
const CodeBlock = lazy(() => import('./CodeBlock.jsx'));

// The API doesn't pin down a response shape for /scraper/fetch-code, so this
// pulls the code out of whichever key the backend actually used instead of
// assuming one and breaking silently.
function extractCode(data) {
  if (typeof data === 'string') return data;
  return (
    data?.code ??
    data?.source_code ??
    data?.submission_code ??
    data?.solution ??
    JSON.stringify(data, null, 2)
  );
}

function guessLanguage(code) {
  if (/^\s*#include/.test(code)) return 'cpp';
  if (/^\s*(class\s+Solution|public\s+class)/.test(code) && /;\s*$/m.test(code)) return 'java';
  if (/def\s+\w+\(self/.test(code)) return 'python';
  if (/function\s+\w+\s*\(|=>\s*{/.test(code)) return 'javascript';
  return 'text';
}

export default function ScraperPanel() {
  const [url, setUrl] = useState('');
  const [headless, setHeadless] = useState(true);
  const [cookieStatus, setCookieStatus] = useState('idle'); // idle | loading | ready | error
  const [fetchStatus, setFetchStatus] = useState('idle'); // idle | loading | done | error
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleGenerateCookies = async () => {
    setCookieStatus('loading');
    setError('');
    try {
      await axiosClient.post(`/scraper/generate-cookies?headless=${headless}`);
      setCookieStatus('ready');
    } catch (err) {
      setCookieStatus('error');
      setError(err.response?.data?.detail || 'Could not generate a LeetCode session. Try again.');
    }
  };

  const handleFetchCode = async (event) => {
    event.preventDefault();
    if (!url.trim()) return;

    setFetchStatus('loading');
    setError('');
    setResult(null);
    try {
      const { data } = await axiosClient.post('/scraper/fetch-code', { url: url.trim(), headless });
      const code = extractCode(data);
      setResult({ code, language: guessLanguage(code) });
      setFetchStatus('done');
    } catch (err) {
      setFetchStatus('error');
      setError(err.response?.data?.detail || 'Could not scrape that submission. Check the URL and try again.');
    }
  };

  const handleCopy = async () => {
    if (!result?.code) return;
    await navigator.clipboard.writeText(result.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <section className="hud-panel p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-bright">Submission scraper</h3>
          <p className="eyebrow mt-0.5">pull code straight off a leetcode submission</p>
        </div>
        <ScanLine size={18} className="text-signal" />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleGenerateCookies}
          disabled={cookieStatus === 'loading'}
          className="flex items-center gap-2 rounded-md border border-void-border bg-void px-3 py-2 text-sm text-slate-text transition-colors hover:border-terminal/50 hover:text-terminal disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Cookie size={15} />
          {cookieStatus === 'loading' ? 'Starting session…' : 'Generate session cookies'}
        </button>

        {cookieStatus === 'ready' && (
          <span className="flex items-center gap-1 text-xs font-mono text-terminal">
            <Check size={13} /> session ready
          </span>
        )}

        <label className="ml-auto flex items-center gap-2 text-xs font-mono text-slate-text">
          <input
            type="checkbox"
            checked={headless}
            onChange={(e) => setHeadless(e.target.checked)}
            className="h-3.5 w-3.5 accent-signal"
          />
          headless
        </label>
      </div>

      <form onSubmit={handleFetchCode} className="flex flex-col gap-3 sm:flex-row">
        <input
          type="url"
          required
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://leetcode.com/submissions/detail/..."
          className="flex-1 rounded-md border border-void-border bg-void px-3 py-2 font-mono text-sm text-slate-bright placeholder:text-slate-text/60 focus:border-signal/60"
        />
        <button
          type="submit"
          disabled={fetchStatus === 'loading'}
          className="flex items-center justify-center gap-2 rounded-md bg-signal px-4 py-2 text-sm font-semibold text-void transition-colors hover:bg-signal-glow disabled:cursor-not-allowed disabled:opacity-60"
        >
          {fetchStatus === 'loading' ? 'Fetching…' : 'Fetch code'}
        </button>
      </form>

      {fetchStatus === 'loading' && <RadarLoader label="Scraping submission…" size={44} />}

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-md border border-signal/40 bg-signal/5 p-3 text-sm text-signal-glow">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="eyebrow">{result.language}</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs font-mono text-slate-text transition-colors hover:text-terminal"
            >
              {copied ? <Check size={13} /> : <ClipboardCopy size={13} />}
              {copied ? 'copied' : 'copy'}
            </button>
          </div>
          <div className="overflow-hidden rounded-md border border-void-border">
            <Suspense fallback={<pre className="p-4 font-mono text-xs text-slate-text">{result.code}</pre>}>
              <CodeBlock code={result.code} language={result.language} />
            </Suspense>
          </div>
        </div>
      )}
    </section>
  );
}
