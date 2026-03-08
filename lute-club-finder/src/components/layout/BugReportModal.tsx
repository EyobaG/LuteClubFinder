import { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';

interface BugReportModalProps {
  onClose: () => void;
}

export default function BugReportModal({ onClose }: BugReportModalProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high'>('medium');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setSubmitting(true);
    setError('');
    try {
      const reportData = {
        title: title.trim(),
        description: description.trim(),
        severity,
        page: window.location.pathname,
        reportedBy: user?.email ?? 'anonymous',
        userId: user?.uid ?? null,
        createdAt: serverTimestamp(),
        status: 'open',
      };

      // Save to Firestore (primary — must succeed)
      await addDoc(collection(db, 'bugReports'), reportData);

      // Send email notification — best-effort, don't fail submission if this errors
      fetch('https://formsubmit.co/ajax/eyob.menjigso@plu.edu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          _subject: `🐛 [${severity.toUpperCase()}] Bug Report: ${title.trim()}`,
          title: title.trim(),
          severity,
          description: description.trim(),
          page: window.location.pathname,
          reportedBy: user?.email ?? 'anonymous',
        }),
      }).catch(() => { /* email is non-critical */ });

      setSubmitted(true);
    } catch (err) {
      console.error('Bug report submission failed:', err);
      setError('Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-lg">🐛</span>
            <h2 className="text-lg font-extrabold text-plu-black">Report a Bug</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {submitted ? (
          <div className="px-6 py-10 text-center">
            <div className="text-4xl mb-3">✅</div>
            <h3 className="text-lg font-bold text-plu-black mb-1">Thanks for the report!</h3>
            <p className="text-sm text-gray-500 mb-6">We'll look into it as soon as possible.</p>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-plu-gold text-plu-black font-bold text-sm hover:bg-plu-gold-deep transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-plu-black mb-1.5">
                Bug Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Short description of the issue"
                required
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-plu-gold focus:border-transparent"
              />
            </div>

            {/* Severity */}
            <div>
              <label className="block text-sm font-semibold text-plu-black mb-1.5">Severity</label>
              <div className="flex gap-2">
                {(['low', 'medium', 'high'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSeverity(s)}
                    className={`flex-1 py-1.5 rounded-lg text-sm font-semibold border transition-colors capitalize
                      ${severity === s
                        ? s === 'high'
                          ? 'bg-red-500 border-red-500 text-white'
                          : s === 'medium'
                          ? 'bg-plu-gold border-plu-gold text-plu-black'
                          : 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-200 text-gray-500 hover:border-gray-400'
                      }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-plu-black mb-1.5">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Steps to reproduce, what you expected vs. what happened..."
                required
                rows={4}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-plu-gold focus:border-transparent"
              />
            </div>

            {/* Page (auto-filled) */}
            <p className="text-xs text-gray-400">
              Page: <span className="font-mono">{window.location.pathname}</span>
            </p>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 rounded-lg border border-gray-300 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !title.trim() || !description.trim()}
                className="flex-1 py-2 rounded-lg bg-plu-gold text-plu-black text-sm font-bold hover:bg-plu-gold-deep transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting…' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
