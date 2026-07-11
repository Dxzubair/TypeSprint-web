import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X, Send, CheckCircle2 } from 'lucide-react';
import { submitParagraphReport } from '../utils/feedback';
import { UserProfile, KeyboardSettings } from '../types';

interface ReportParagraphSheetProps {
  isOpen: boolean;
  onClose: () => void;
  paragraph: { id: string; title: string; category: string; difficulty: string };
  profile: UserProfile;
  settings: KeyboardSettings;
}

const REPORT_TYPES = [
  'Spelling Mistake', 'Grammar Mistake', 'Punctuation Error', 'Formatting Issue',
  'Wrong Difficulty', 'Wrong Category', 'Duplicate Paragraph', 'Inappropriate Content',
  'Too Easy', 'Too Hard', 'Other'
];

export const ReportParagraphSheet: React.FC<ReportParagraphSheetProps> = ({
  isOpen, onClose, paragraph, profile, settings
}) => {
  const [reportType, setReportType] = useState(REPORT_TYPES[0]);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await submitParagraphReport({
        paragraphId: paragraph.id,
        paragraphTitle: paragraph.title,
        category: paragraph.category,
        difficulty: paragraph.difficulty,
        reportType,
        comment,
        userId: profile.username || 'guest',
        username: profile.name || 'Guest',
        deviceModel: navigator.platform,
        androidVersion: 'Unknown', // Placeholder
        appVersion: '1.0.0', // Placeholder
        keyboardType: settings.keyboardType || 'none',
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setComment('');
      }, 2000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex items-end justify-center z-50">
          <div className="absolute inset-0" onClick={onClose} />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="relative w-full max-h-[85%] bg-white dark:bg-zinc-950 border-t border-slate-200 dark:border-zinc-900 rounded-t-[32px] shadow-2xl flex flex-col z-10"
          >
            <div className="flex justify-center py-2.5">
              <div className="w-12 h-1 bg-slate-300 dark:bg-zinc-800 rounded-full" />
            </div>

            <div className="flex items-center justify-between px-6 pb-4 border-b border-slate-100 dark:border-zinc-900/60">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                Report Paragraph
              </h3>
              <button onClick={onClose} className="p-1.5 rounded-full bg-slate-100 dark:bg-zinc-900 text-slate-500 dark:text-zinc-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto px-6 py-6 flex flex-col gap-5">
              {success ? (
                <div className="flex flex-col items-center justify-center py-10 gap-4">
                  <CheckCircle2 className="w-16 h-16 text-emerald-500" />
                  <h4 className="font-bold text-lg text-emerald-500">Report Submitted!</h4>
                  <p className="text-sm text-slate-400">Thank you for helping improve TypeSprint.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Reason</label>
                    <select
                      value={reportType}
                      onChange={(e) => setReportType(e.target.value)}
                      className="w-full bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3 text-sm text-slate-900 dark:text-zinc-100"
                    >
                      {REPORT_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Comments (optional)</label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3 text-sm text-slate-900 dark:text-zinc-100"
                      rows={3}
                    />
                  </div>
                  {error && <p className="text-xs text-rose-500">{error}</p>}
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full py-4 bg-emerald-500 text-white rounded-xl font-black text-sm uppercase shadow-sm hover:bg-emerald-600 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Report'}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
