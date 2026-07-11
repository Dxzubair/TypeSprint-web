import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star, MessageSquare, Send, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { submitFeedback } from '../utils/feedback';
import { useAuth } from '../context/AuthContext';
import { UserProfile, KeyboardSettings } from '../types';

interface BetaFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  settings: KeyboardSettings;
}

export const BetaFeedbackModal: React.FC<BetaFeedbackModalProps> = ({ isOpen, onClose, profile, settings }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [category, setCategory] = useState('General Feedback');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    'Bug Report',
    'Feature Request',
    'General Feedback',
    'Performance Issue',
    'Keyboard Compatibility Issue',
    'Other'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please provide a rating.');
      return;
    }
    if (!message.trim()) {
      setError('Please provide a detailed message.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const userAgent = navigator.userAgent;
    const isAndroid = /Android/i.test(userAgent);
    const androidVersionMatch = userAgent.match(/Android\s([0-9.]*)/);
    const androidVersion = isAndroid && androidVersionMatch ? androidVersionMatch[1] : 'N/A';
    
    // Simplistic device extraction
    const deviceMatch = userAgent.match(/\(([^)]+)\)/);
    const device = deviceMatch ? deviceMatch[1] : 'Unknown';

    try {
      await submitFeedback({
        userId: user?.uid || 'anonymous',
        username: profile.name || 'Anonymous',
        rating,
        category,
        message,
        device,
        androidVersion,
        appVersion: '1.0.0-beta',
        keyboardType: profile.typingMode,
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setRating(0);
        setCategory('General Feedback');
        setMessage('');
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit feedback.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-lg bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-400" />
              Beta Feedback
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto">
            {success ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4"
                >
                  <CheckCircle2 className="w-8 h-8 text-green-400" />
                </motion.div>
                <h3 className="text-xl font-bold text-white mb-2">Thank You!</h3>
                <p className="text-gray-400">Your feedback helps us improve TypeSprint.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Overall Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        onClick={() => setRating(star)}
                        className="focus:outline-none transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            star <= (hoveredRating || rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'fill-transparent text-gray-600'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label htmlFor="feedback-category" className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                  <select
                    id="feedback-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Detailed Feedback</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us what you think, report a bug, or suggest a feature..."
                    rows={5}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors resize-none"
                  />
                </div>

                {/* System Info Note */}
                <div className="bg-gray-800/50 rounded-lg p-3 text-xs text-gray-400 flex items-start gap-2">
                  <Info className="w-4 h-4 shrink-0 mt-0.5 text-gray-500" />
                  <p>
                    For debugging purposes, your device info (Android version, device model, and keyboard type) will be automatically included with your submission.
                  </p>
                </div>

                {error && (
                  <div className="bg-red-900/30 border border-red-800 rounded-lg p-3 flex items-start gap-2 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <p>{error}</p>
                  </div>
                )}

                {/* Submit */}
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit Feedback
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
