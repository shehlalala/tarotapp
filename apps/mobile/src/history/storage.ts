import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCardIds } from '@tarot/content';
import { addReading, parseHistory, type SavedReading } from './model';

/** Readings stay on this device only. Bump the key if the stored shape changes. */
const KEY = 'readings.v1';

export async function loadHistory(): Promise<SavedReading[]> {
  try {
    return parseHistory(await AsyncStorage.getItem(KEY), new Set(getCardIds()));
  } catch {
    return [];
  }
}

export async function saveReading(reading: SavedReading): Promise<void> {
  try {
    const next = addReading(await loadHistory(), reading);
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage full or unavailable: the reading still shows; it just isn't kept.
  }
}

export async function clearHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {
    // Nothing to do; the next load falls back to empty.
  }
}
