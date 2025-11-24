import { useEffect } from 'react';
import { useBehaviorSubjectState } from './useBehaviourSubjectState';
import { view$ } from '../context';

export const useView = () => {
  const [view, setView] = useBehaviorSubjectState(view$);

  useEffect(() => {
    sessionStorage.setItem('view', view);
  }, [view]);

  return { view, setView };
};
