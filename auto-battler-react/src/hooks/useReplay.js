import { useEffect } from 'react';
import { useGameStore } from '../store.js';

export function useReplay() {
  const {
    isReplaying,
    currentEventIndex,
    playbackSpeed,
    nextEvent,
    battleLog,
  } = useGameStore();

  useEffect(() => {
    if (!isReplaying) return;
    if (!battleLog?.events) return;
    if (currentEventIndex >= battleLog.events.length) {
      useGameStore.getState().pauseReplay();
      return;
    }
    const timer = setTimeout(nextEvent, playbackSpeed);
    return () => clearTimeout(timer);
  }, [isReplaying, currentEventIndex, playbackSpeed, battleLog?.events?.length, nextEvent]);
}
