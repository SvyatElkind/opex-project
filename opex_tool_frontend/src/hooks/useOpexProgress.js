import { useState, useRef, useCallback } from 'react';

/**
 * useOpexProgress — manages WebSocket connection and OPEX export progress state.
 *
 * Exposes:
 *   startExport(projectData, includeLongTerm) — connects WS, fires API, tracks progress
 *   close() — disconnect WS, reset state
 *   phase, processedFiles, totalFiles, progressPercent, currentFile, failedFiles, messages
 */

// Build flat lookup: fileId → { fileName, recordTitle, itemNumber, itemTitle, inventoryNumber }
const buildFileLookupMap = (projectData, includeLongTerm) => {
  const map = {};
  const inventories = projectData?.institution?.fond?.inventories || [];

  for (const inventory of inventories) {
    if (!inventory.electronic) continue;
    if (!includeLongTerm && inventory.storage_term === 'Ilgstoši glabājamās lietas') continue;

    for (const item of (inventory.items || [])) {
      // Determine record arrays based on inventory type
      let recordArrays = [];
      if (inventory.type === 'Foto') recordArrays = [item.photo_records || []];
      else if (inventory.type === 'Skaņas') recordArrays = [item.audio_records || []];
      else if (inventory.type === 'Video') recordArrays = [item.video_records || []];
      else recordArrays = [item.records || []];

      for (const records of recordArrays) {
        for (const record of records) {
          for (const file of (record.files || [])) {
            map[file.id] = {
              fileId: file.id,
              fileName: file.original_name || `Fails ${file.id}`,
              recordTitle: record.title || 'Nav nosaukuma',
              itemNumber: item.number,
              itemTitle: item.title || 'Nav nosaukuma',
              inventoryNumber: inventory.number,
              inventoryType: inventory.type,
            };
          }
        }
      }
    }
  }
  return map;
};

const useOpexProgress = () => {
  const [phase, setPhase] = useState('idle');
  const [totalFiles, setTotalFiles] = useState(0);
  const [processedFiles, setProcessedFiles] = useState(0);
  const [currentFile, setCurrentFile] = useState(null);
  const [failedFiles, setFailedFiles] = useState([]);
  const [messages, setMessages] = useState([]);
  const [recentFiles, setRecentFiles] = useState([]);       // last 5 processed files
  const [inventoryProgress, setInventoryProgress] = useState({}); // { invNumber: { total, done, errors } }
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);

  const wsRef = useRef(null);
  const fileLookupRef = useRef({});
  const inventoryStatsRef = useRef({});
  const fileTimestampsRef = useRef([]);  // timestamps of last N file events for ETA

  const addMessage = useCallback((msg) => {
    setMessages(prev => [...prev, { ...msg, _ts: new Date().toLocaleTimeString() }].slice(-500));
  }, []);

  const getFileInfo = useCallback((fileId) => {
    return fileLookupRef.current[fileId] || {
      fileId,
      fileName: `Nezinams fails (ID: ${fileId})`,
      recordTitle: '-',
      itemNumber: '-',
      itemTitle: '-',
      inventoryNumber: '-',
      inventoryType: '-',
    };
  }, []);

  const handleWsMessage = useCallback((data) => {
    addMessage(data);

    if (data.msg_level === 'file') {
      const info = getFileInfo(data.file);
      setCurrentFile(info);
      setProcessedFiles(prev => Math.min(prev + 1, fileLookupRef.current._total || Infinity));

      // Record timestamp for ETA calculation (keep last 20)
      fileTimestampsRef.current = [...fileTimestampsRef.current, Date.now()].slice(-20);

      // Track recent files (last 5)
      setRecentFiles(prev => [info, ...prev].slice(0, 5));

      // Track per-inventory progress
      const invNum = info.inventoryNumber;
      if (invNum && invNum !== '-') {
        const stats = inventoryStatsRef.current;
        if (!stats[invNum]) stats[invNum] = { total: 0, done: 0, errors: 0, type: info.inventoryType };
        stats[invNum].done++;
        if (data.status === 'copy_error') stats[invNum].errors++;
        setInventoryProgress({ ...stats });
      }

      if (data.status === 'copy_error') {
        setFailedFiles(prev => [...prev, info]);
      }
    }

    if (data.msg_level === 'project') {
      switch (data.status) {
        case 'opex_export_started':
          setPhase('exporting');
          setStartTime(Date.now());
          break;
        case 'opex_export_finished':
          setPhase('exported');
          break;
        case 'opex_zipping_started':
          setPhase('zipping');
          break;
        case 'opex_zipping_finished':
          setPhase('done');
          setEndTime(Date.now());
          break;
        case 'opex_folder_deleted':
          break;
        case 'deleting_opex_folder_failed':
          break;
        case 'opex_zipping_failed':
          setPhase('error');
          setEndTime(Date.now());
          break;
        default:
          break;
      }
    }
  }, [addMessage, getFileInfo]);

  const startExport = useCallback(async (projectData, includeLongTerm = true) => {
    // Build file lookup map
    const map = buildFileLookupMap(projectData, includeLongTerm);
    const total = Object.keys(map).length;
    map._total = total;
    fileLookupRef.current = map;

    // Build per-inventory totals
    const invTotals = {};
    for (const info of Object.values(map)) {
      if (info.inventoryNumber) {
        if (!invTotals[info.inventoryNumber]) invTotals[info.inventoryNumber] = { total: 0, done: 0, errors: 0, type: info.inventoryType };
        invTotals[info.inventoryNumber].total++;
      }
    }
    inventoryStatsRef.current = invTotals;

    // Reset state
    setPhase('connecting');
    setTotalFiles(total);
    setProcessedFiles(0);
    setCurrentFile(null);
    setFailedFiles([]);
    setMessages([]);
    setRecentFiles([]);
    setInventoryProgress({ ...invTotals });
    setStartTime(null);
    setEndTime(null);
    fileTimestampsRef.current = [];

    const projectId = projectData?.id;
    if (!projectId) {
      setPhase('error');
      addMessage({ msg_level: 'system', status: 'error', text: 'Nav projekta ID' });
      return;
    }

    // Connect WebSocket
    const host = window.location.hostname || 'localhost';
    const url = `ws://${host}:8000/ws/opex_progress/`;

    return new Promise((resolve) => {
      try {
        const ws = new WebSocket(url);

        ws.onopen = async () => {
          addMessage({ msg_level: 'system', status: 'connected', text: 'WebSocket savienots' });

          // Fire the export API
          try {
            const resp = await fetch(
              `/api/v1/project/${projectId}/export/opex_package/?long=${includeLongTerm}`,
              { method: 'GET', headers: { 'Content-Type': 'application/json' } }
            );
            if (resp.ok) {
              addMessage({ msg_level: 'system', status: 'started', text: 'Eksports uzsākts' });
            } else {
              const text = await resp.text();
              setPhase('error');
              addMessage({ msg_level: 'system', status: 'error', text: `API kļūda ${resp.status}: ${text}` });
            }
          } catch (err) {
            setPhase('error');
            addMessage({ msg_level: 'system', status: 'error', text: `Fetch kļūda: ${err.message}` });
          }
          resolve();
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            handleWsMessage(data);
          } catch {
            addMessage({ msg_level: 'system', status: 'error', text: 'Nevar parsēt ziņu' });
          }
        };

        ws.onerror = () => {
          setPhase('error');
          addMessage({ msg_level: 'system', status: 'error', text: 'WebSocket kļūda — pārliecinieties ka backend darbojas ar uvicorn' });
          resolve();
        };

        ws.onclose = () => {
          wsRef.current = null;
        };

        wsRef.current = ws;
      } catch (err) {
        setPhase('error');
        addMessage({ msg_level: 'system', status: 'error', text: `Savienojuma kļūda: ${err.message}` });
        resolve();
      }
    });
  }, [addMessage, handleWsMessage]);

  const close = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setPhase('idle');
  }, []);

  const progressPercent = totalFiles > 0
    ? Math.min(Math.round((processedFiles / totalFiles) * 100), 100)
    : 0;

  const elapsedMs = startTime
    ? (endTime || Date.now()) - startTime
    : 0;

  // ETA: rolling average of last N file processing intervals
  const estimatedRemainingMs = (() => {
    const ts = fileTimestampsRef.current;
    const remaining = totalFiles - processedFiles;
    if (remaining <= 0 || ts.length < 3) return null; // Need at least 3 samples

    // Calculate average interval from recent timestamps
    const windowSize = Math.min(ts.length, 15);
    const recentTs = ts.slice(-windowSize);
    const totalInterval = recentTs[recentTs.length - 1] - recentTs[0];
    const avgInterval = totalInterval / (recentTs.length - 1);

    return Math.round(avgInterval * remaining);
  })();

  return {
    phase,
    totalFiles,
    processedFiles,
    progressPercent,
    currentFile,
    failedFiles,
    messages,
    recentFiles,
    inventoryProgress,
    elapsedMs,
    estimatedRemainingMs,
    startExport,
    close,
  };
};

export default useOpexProgress;
