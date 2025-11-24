import { useCallback, useEffect } from 'react';
import { useBehaviorSubjectState } from './useBehaviorSubjectState.ts';
import { view$ } from '../context';

export const useView = () => {
  const [view, setView] = useBehaviorSubjectState(view$);

  const setViewCallback = useCallback(
    (v: typeof view) => setView(v),
    [setView]
  );

  useEffect(() => {
    sessionStorage.setItem('view', view);
  }, [view]);

  return { view, setView: setViewCallback };
};
