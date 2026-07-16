import { useState } from "react";
import { availableEventTypes } from "../data/dummyData";

// Modal form for creating a new webhook.
// Props:
//   onSubmit – callback receiving the new webhook object
//   onClose  – callback to dismiss the modal
export default function WebhookForm({ onSubmit, onClose }) {
  // --- Form state -----------------------------------------------------------
  const [url, setUrl] = useState("");
  const [eventType, setEventType] = useState(availableEventTypes[0]);

  // Auto-generate a random secret on mount so the user doesn't have to think
  // about it.  The secret is prefixed with "whsec_" followed by 24 random hex
  // characters.
  const generateSecret = () => {
    const chars = "abcdef0123456789";
    let secret = "whsec_";
    for (let i = 0; i < 24; i++) {
      secret += chars[Math.floor(Math.random() * chars.length)];
    }
    return secret;
  };

  const [secret, setSecret] = useState(generateSecret);

  // --- Helpers --------------------------------------------------------------

  // Basic URL validation – just checks it starts with http:// or https://
  const isValidUrl = (str) =>
    str.startsWith("http://") || str.startsWith("https://");

  // Regenerate the secret when the user clicks "Regenerate"
  const handleRegenerate = () => {
    setSecret(generateSecret());
  };

  // --- Submit handler -------------------------------------------------------
  const handleSubmit = (e) => {
    e.preventDefault();

    // Simple client-side validation
    if (!url.trim()) {
      alert("Please enter a target URL.");
      return;
    }
    if (!isValidUrl(url.trim())) {
      alert("URL must start with http:// or https://");
      return;
    }

    // Build the new webhook object.  The parent (App) will assign a real id.
    onSubmit({
      url: url.trim(),
      eventType,
      secret,
      status: "active",
      lastDelivery: "—",
    });
  };

  // --- Render ---------------------------------------------------------------
  return (
    // Full-screen overlay with blurred backdrop
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl bg-white p-8 shadow-2xl">
        {/* Modal header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Add Webhook</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            {/* Simple X icon */}
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Target URL */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Target URL
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.example.com/webhooks/..."
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Event Type dropdown */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Event Type
            </label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {availableEventTypes.map((evt) => (
                <option key={evt} value={evt}>
                  {evt}
                </option>
              ))}
            </select>
          </div>

          {/* Auto-generated Secret */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Signing Secret
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={secret}
                readOnly
                className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-xs font-mono text-gray-600"
              />
              <button
                type="button"
                onClick={handleRegenerate}
                className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Regenerate
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              Add Webhook
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
