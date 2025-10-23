/**
 * Custom hook for managing AI system logs and status
 */

import { useState, useCallback } from 'react';
import { AI_MESSAGES } from '@/lib/constants';

export function useSystemLog() {
  const [systemStatus, setSystemStatus] = useState("Idle. Awaiting operator action...");
  const [aiLog, setAiLog] = useState<string[]>([AI_MESSAGES.SYSTEM_INITIALIZED]);

  const logAiMessage = useCallback((message: string) => {
    setAiLog(prev => [message, ...prev.slice(0, 4)]);
    setSystemStatus(message.replace(/\[(AI|OP)\] /g, ''));
  }, []);

  return {
    systemStatus,
    aiLog,
    logAiMessage,
  };
}
