import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import api from '../api/api';

// ── Types ─────────────────────────────────────────────────────────────────────

type JobStatus = 'pending' | 'done' | 'error' | null;

interface ReportJob {
  jobId: string;
  boardName: string;
  status: JobStatus;
  error?: string;
}

interface ReportJobContextType {
  job: ReportJob | null;
  /** Call this right after the POST resolves with { jobId, boardName } */
  startJob: (jobId: string, boardName: string) => void;
  /** Dismiss the toast manually */
  clearJob: () => void;
}

// ── Context ───────────────────────────────────────────────────────────────────

const ReportJobContext = createContext<ReportJobContextType | null>(null);

const POLL_INTERVAL_MS = 4_000;

export function ReportJobProvider({ children }: { children: ReactNode }) {
  const [job, setJob] = useState<ReportJob | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const downloadingRef = useRef(false);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const clearJob = useCallback(() => {
    stopPolling();
    setJob(null);
    downloadingRef.current = false;
  }, [stopPolling]);

  const triggerDownload = useCallback(async (jobId: string, boardName: string) => {
    if (downloadingRef.current) return;
    downloadingRef.current = true;

    try {
      // Stream the PDF blob from the status endpoint (which serves the file when done)
      const { data } = await api.get(`/ai/jobs/${jobId}/status`, {
        responseType: 'blob',
      });

      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${boardName.replace(/\s+/g, '-')}-summary.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      // Show "done" briefly then clear
      setJob((prev) => prev ? { ...prev, status: 'done' } : null);
      setTimeout(clearJob, 3_000);
    } catch {
      setJob((prev) => prev ? { ...prev, status: 'error', error: 'Download failed.' } : null);
      setTimeout(clearJob, 5_000);
    }
  }, [clearJob]);

  // Polling loop — only active while a job is pending
  useEffect(() => {
    if (!job || job.status !== 'pending') return;

    intervalRef.current = setInterval(async () => {
      try {
        const { data } = await api.get<{
          status: 'pending' | 'done' | 'error';
          boardName: string;
          error?: string;
        }>(`/ai/jobs/${job.jobId}/status`);

        if (data.status === 'pending') return; // keep polling

        stopPolling();

        if (data.status === 'error') {
          setJob((prev) => prev
            ? { ...prev, status: 'error', error: data.error ?? 'Report generation failed.' }
            : null
          );
          setTimeout(clearJob, 5_000);
          return;
        }

        // status === 'done' — download the PDF
        if (data.status === 'done') {
          await triggerDownload(job.jobId, job.boardName);
        }
      } catch {
        // Network hiccup — keep polling, don't abort
      }
    }, POLL_INTERVAL_MS);

    return stopPolling;
  }, [job?.jobId, job?.status, stopPolling, clearJob, triggerDownload]);

  const startJob = useCallback((jobId: string, boardName: string) => {
    stopPolling();
    downloadingRef.current = false;
    setJob({ jobId, boardName, status: 'pending' });
  }, [stopPolling]);

  return (
    <ReportJobContext.Provider value={{ job, startJob, clearJob }}>
      {children}
    </ReportJobContext.Provider>
  );
}

export function useReportJob() {
  const ctx = useContext(ReportJobContext);
  if (!ctx) throw new Error('useReportJob must be used inside <ReportJobProvider>');
  return ctx;
}
