import { useCallback, useMemo, useReducer } from 'react';
import { getCardIds, getSpread } from '@tarot/content';
import { canReveal, createReading, filledCount, readingReducer } from './reducer';

const SPREAD_ID = 'past-present-future';

export function useReading() {
  const spread = getSpread(SPREAD_ID);
  if (!spread) throw new Error(`Spread "${SPREAD_ID}" missing from @tarot/content`);

  const init = useCallback(() => createReading(getCardIds(), spread.positions.length), [spread]);
  const [state, dispatch] = useReducer(readingReducer, undefined, init);

  const actions = useMemo(
    () => ({
      pick: (id: string) => dispatch({ type: 'pick', id }),
      unslot: (index: number) => dispatch({ type: 'unslot', index }),
      reveal: () => dispatch({ type: 'reveal' }),
      newReading: () => dispatch({ type: 'reset', state: init() }),
    }),
    [init],
  );

  return {
    state,
    spread,
    filled: filledCount(state),
    canReveal: canReveal(state),
    ...actions,
  };
}
