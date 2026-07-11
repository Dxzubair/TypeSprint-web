import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { BetaFeedback, ParagraphReport } from '../types';

const LOCAL_STORAGE_KEY = 'typesprint_offline_feedback';
const LAST_SUBMISSION_KEY = 'typesprint_last_feedback_time';

export const submitFeedback = async (feedback: Omit<BetaFeedback, 'createdAt'>) => {
  const now = Date.now();
  const lastSubmission = localStorage.getItem(LAST_SUBMISSION_KEY);
  if (lastSubmission && now - parseInt(lastSubmission) < 60000) {
    throw new Error('Please wait a minute before submitting again.');
  }

  if (!feedback.message || feedback.message.trim() === '') {
    throw new Error('Message cannot be empty.');
  }

  try {
    if (navigator.onLine !== false) {
      // Online, send directly
      await addDoc(collection(db, 'beta_feedback'), {
        ...feedback,
        createdAt: serverTimestamp()
      });
      localStorage.setItem(LAST_SUBMISSION_KEY, now.toString());
    } else {
      // Offline, save locally
      saveOfflineFeedback({ ...feedback, createdAt: new Date().toISOString() });
      localStorage.setItem(LAST_SUBMISSION_KEY, now.toString());
    }
  } catch (error) {
    console.error('Error submitting feedback:', error);
    // Fallback to offline
    saveOfflineFeedback({ ...feedback, createdAt: new Date().toISOString() });
    localStorage.setItem(LAST_SUBMISSION_KEY, now.toString());
  }
};

export const submitParagraphReport = async (report: Omit<ParagraphReport, 'reportId' | 'createdAt' | 'status'>) => {
  const now = Date.now();
  const reportKey = `typesprint_report_${report.paragraphId}_${report.userId}`;
  const lastReport = localStorage.getItem(reportKey);

  if (lastReport && now - parseInt(lastReport) < 24 * 60 * 60 * 1000) {
    throw new Error('You have already reported this paragraph in the last 24 hours.');
  }

  try {
    const reportData: ParagraphReport = {
      ...report,
      reportId: crypto.randomUUID(),
      createdAt: serverTimestamp(),
      status: 'Pending',
    };

    if (navigator.onLine !== false) {
      await addDoc(collection(db, 'paragraph_reports'), reportData);
      localStorage.setItem(reportKey, now.toString());
    } else {
      // Offline, save locally
      saveOfflineReport(reportData);
      localStorage.setItem(reportKey, now.toString());
    }
  } catch (error) {
    console.error('Error submitting paragraph report:', error);
    saveOfflineReport({ ...report, reportId: crypto.randomUUID(), createdAt: new Date().toISOString(), status: 'Pending' });
    localStorage.setItem(reportKey, now.toString());
  }
};

export const saveOfflineReport = (report: any) => {
  const existing = JSON.parse(localStorage.getItem('typesprint_offline_reports') || '[]');
  existing.push(report);
  localStorage.setItem('typesprint_offline_reports', JSON.stringify(existing));
};

export const syncOfflineReports = async () => {
  if (navigator.onLine === false) return;
  const existing = JSON.parse(localStorage.getItem('typesprint_offline_reports') || '[]');
  if (existing.length === 0) return;

  const remaining = [];
  for (const report of existing) {
    try {
      const { createdAt, ...rest } = report;
      await addDoc(collection(db, 'paragraph_reports'), {
        ...rest,
        createdAt: createdAt ? new Date(createdAt) : serverTimestamp()
      });
    } catch (e) {
      remaining.push(report);
    }
  }
  localStorage.setItem('typesprint_offline_reports', JSON.stringify(remaining));
};

export const saveOfflineFeedback = (feedback: any) => {
  const existing = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
  existing.push(feedback);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(existing));
};

export const syncOfflineFeedback = async () => {
  if (navigator.onLine === false) return;
  const existing = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
  if (existing.length === 0) return;

  const remaining = [];
  for (const feedback of existing) {
    try {
      const { createdAt, ...rest } = feedback;
      await addDoc(collection(db, 'beta_feedback'), {
        ...rest,
        createdAt: createdAt ? new Date(createdAt) : serverTimestamp()
      });
    } catch (e) {
      remaining.push(feedback);
    }
  }
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(remaining));
};

// Start sync process on load and online
if (typeof window !== 'undefined') {
  window.addEventListener('online', syncOfflineFeedback);
  setTimeout(syncOfflineFeedback, 5000);
}
