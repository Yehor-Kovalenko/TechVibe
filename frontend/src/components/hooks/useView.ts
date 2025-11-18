import { useEffect } from 'react';
import { useBehaviorSubjectState } from './useBehaviourSubjectState.ts';
import { view$ } from '../context.ts';

export const useView = () => {
  const [view, setView] = useBehaviorSubjectState(view$);

  useEffect(() => {
    sessionStorage.setItem('view', view);
  }, [view]);

  return { view, setView };
};
