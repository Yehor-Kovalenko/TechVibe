import { useCallback, useEffect } from 'react';
import { useBehaviorSubjectState } from './useBehaviorSubjectState.ts';
import { type View, view$ } from '../context';

export const useView = () => {
  const [view, setView] = useBehaviorSubjectState<View>(view$);

  const setViewCallback = useCallback(
    (v: typeof view) => setView(v),
    [setView]
  );

  useEffect(() => {
    sessionStorage.setItem('view', view);
  }, [view]);

  return { view, setView: setViewCallback };
};
