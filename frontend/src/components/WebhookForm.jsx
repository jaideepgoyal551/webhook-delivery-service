import { useState } from "react";
import toast from "react-hot-toast";
import { availableEventTypes } from "../data/dummyData";

export default function WebhookForm({ onSubmit, onClose }) {
  const [url, setUrl] = useState("");
  const [eventType, setEventType] = useState(availableEventTypes[0]);
  const [submitting, setSubmitting] = useState(false);

  const generateSecret = () => {
    const chars = "abcdef0123456789";
    let secret = "whsec_";
    for (let i = 0; i < 24; i++) secret += chars[Math.floor(Math.random() * chars.length)];
    return secret;
  };

  const [secret, setSecret] = useState(generateSecret);
  const handleRegenerate = () => setSecret(generateSecret());
  const isValidUrl = (str) => str.startsWith("http://") || str.startsWith("https://");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url.trim()) { toast.error("Please enter a target URL."); return; }
    if (!isValidUrl(url.trim())) { toast.error("URL must start with http:// or https://"); return; }
    setSubmitting(true);
    onSubmit({ url: url.trim(), eventType, secret }, { setSubmitting });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl shadow-black/10 dark:bg-gray-900 dark:shadow-black/40 animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5 dark:border-gray-800">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Add Webhook</h2>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">Create a new webhook endpoint.</p>
          </div>
          <button onClick={onClose} disabled={submitting}
            className="rounded-lg p-1.5 text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Target URL</label>
            <input type="text" value={url} onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.example.com/webhooks/..."
              disabled={submitting}
              className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-400/20 disabled:bg-gray-50 dark:disabled:bg-gray-800/50" />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Event Type</label>
            <select value={eventType} onChange={(e) => setEventType(e.target.value)}
              disabled={submitting}
              className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-400/20 disabled:bg-gray-50 dark:disabled:bg-gray-800/50">
              {availableEventTypes.map((evt) => <option key={evt} value={evt}>{evt}</option>)}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Signing Secret</label>
            <div className="flex gap-2">
              <input type="text" value={secret} readOnly
                className="flex-1 rounded-xl border border-gray-300 bg-gray-50 px-3.5 py-2.5 text-xs font-mono text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400" />
              <button type="button" onClick={handleRegenerate} disabled={submitting}
                className="shrink-0 rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-600 transition-all hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 disabled:opacity-50">
                Regenerate
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-5 dark:border-gray-800">
            <button type="button" onClick={onClose} disabled={submitting}
              className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/20 transition-all hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100">
              {submitting && (
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {submitting ? "Creating..." : "Add Webhook"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
