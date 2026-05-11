import localforage from 'localforage';
import { getHistory, toggleHabit as toggleHabitAction } from '@/actions';

// Initialize stores
export const habitStore = localforage.createInstance({ name: "beast_mode", storeName: "habits" });
export const syncQueueStore = localforage.createInstance({ name: "beast_mode", storeName: "sync_queue" });

export interface SyncQueueItem {
  id: string;
  type: 'TOGGLE_HABIT';
  payload: {
    dateId: string;
    habitKey: string;
  };
}

// Offline-first getHistory
export async function getOfflineHistory() {
  try {
    // 1. Try local first
    const local = await habitStore.getItem<Record<string, Record<string, boolean>>>('history');
    
    // 2. Fire and forget fetch from server to update local cache in background
    getHistory().then(async (serverData) => {
      if (serverData && Object.keys(serverData).length > 0) {
        await habitStore.setItem('history', serverData);
      }
    }).catch(() => console.log('Offline: Could not fetch from server'));

    if (local) return local;
    
    // If no local data, wait for server
    const serverData = await getHistory();
    await habitStore.setItem('history', serverData);
    return serverData;
  } catch (error) {
    console.error("LocalForage error", error);
    return {};
  }
}

// Offline-first toggleHabit
export async function toggleOfflineHabit(dateId: string, habitKey: string) {
  // 1. Update local cache immediately
  const history = await habitStore.getItem<Record<string, Record<string, boolean>>>('history') || {};
  if (!history[dateId]) history[dateId] = {};
  history[dateId][habitKey] = !history[dateId][habitKey];
  await habitStore.setItem('history', history);

  // 2. Attempt server action
  try {
    const res = await toggleHabitAction(dateId, habitKey);
    if (!res.success) throw new Error("Server action returned false");
  } catch {
    // 3. If offline/failed, push to sync queue
    console.log("Offline mode: Queuing habit toggle");
    const queue = await syncQueueStore.getItem<SyncQueueItem[]>('queue') || [];
    queue.push({
      id: Date.now().toString(),
      type: 'TOGGLE_HABIT',
      payload: { dateId, habitKey }
    });
    await syncQueueStore.setItem('queue', queue);
  }
}

// Flush Sync Queue (call this periodically or when app becomes visible)
export async function flushSyncQueue() {
  if (typeof window === 'undefined' || !navigator.onLine) return; 

  const queue = await syncQueueStore.getItem<SyncQueueItem[]>('queue') || [];
  if (queue.length === 0) return;

  const newQueue = [...queue];

  for (let i = 0; i < queue.length; i++) {
    const item = queue[i];
    try {
      if (item.type === 'TOGGLE_HABIT') {
        const res = await toggleHabitAction(item.payload.dateId, item.payload.habitKey);
        if (res.success) {
          newQueue.splice(newQueue.findIndex(q => q.id === item.id), 1);
        }
      }
    } catch {
      console.log('Sync failed for item', item);
      break; // Stop flushing if one fails
    }
  }

  await syncQueueStore.setItem('queue', newQueue);
}

// ════════════════════════════════════════════
// WEIGHT (Naïve offline implementations)
// ════════════════════════════════════════════

import { getWeightEntries as serverGetWeight, addWeightEntry as serverAddWeight, deleteWeightEntry as serverDeleteWeight, type WeightEntry } from '@/actions';
export const weightStore = localforage.createInstance({ name: "beast_mode", storeName: "weight" });

export async function getOfflineWeightEntries() {
  try {
    const local = await weightStore.getItem<WeightEntry[]>('entries');
    serverGetWeight().then(async (serverData) => {
      if (serverData && serverData.length > 0) {
        await weightStore.setItem('entries', serverData);
      }
    }).catch(() => {});
    
    if (local) return local;
    const serverData = await serverGetWeight();
    await weightStore.setItem('entries', serverData);
    return serverData;
  } catch {
    return [];
  }
}

export async function addOfflineWeightEntry(date: string, value: number) {
  const current = await weightStore.getItem<WeightEntry[]>('entries') || [];
  const fakeId = Date.now();
  current.unshift({ id: fakeId, date, value });
  await weightStore.setItem('entries', current);

  try {
    await serverAddWeight(date, value);
  } catch {
    console.log("Weight sync failed, queued locally");
  }
}

export async function deleteOfflineWeightEntry(id: number) {
  const current = await weightStore.getItem<WeightEntry[]>('entries') || [];
  await weightStore.setItem('entries', current.filter(e => e.id !== id));
  
  try {
    await serverDeleteWeight(id);
  } catch {
    console.log("Weight delete failed");
  }
}
