import { useCallback, useMemo, useReducer, useRef } from 'react';
import { getCardIds, getSpread } from '@tarot/content';
import { canReveal, createReading, filledCount, readingReducer, type ReadingAction, type ReadingState } from './reducer';

const SPREAD_ID = 'past-present-future';

export function useReading() {
  const spread = getSpread(SPREAD_ID);
  if (!spread) throw new Error(`Spread "${SPREAD_ID}" missing from @tarot/content`);

  const init = useCallback(() => createReading(getCardIds(), spread.positions.length), [spread]);
  const [state, dispatch] = useReducer(readingReducer, undefined, init);

  // Mirror of the reducer state, updated synchronously on every action, so
  // `pick` can report which slot a card landed in even when several taps
  // arrive before React re-renders (needed to aim the fly-to-slot animation).
  const latest = useRef<ReadingState>(state);
  const send = useCallback((action: ReadingAction) => {
    latest.current = readingReducer(latest.current, action);
    dispatch(action);
  }, []);

  const actions = useMemo(
    () => ({
      /** Returns the slot index the card went into, or -1 if the pick was ignored. */
      pick: (id: string): number => {
        const before = latest.current;
        send({ type: 'pick', id });
        return before === latest.current ? -1 : latest.current.slots.indexOf(id);
      },
      unslot: (index: number) => send({ type: 'unslot', index }),
      reveal: () => send({ type: 'reveal' }),
      newReading: () => send({ type: 'reset', state: init() }),
    }),
    [init, send],
  );

  return {
    state,
    spread,
    filled: filledCount(state),
    canReveal: canReveal(state),
    ...actions,
  };
}
