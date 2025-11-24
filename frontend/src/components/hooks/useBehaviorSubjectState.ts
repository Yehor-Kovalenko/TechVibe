import React from 'react';
import * as rxjs from 'rxjs';

/**
 * Use an rxjs BehaviorSubject to read and write state for a React component.
 *
 * @param behaviorSubject The behavior subject whose state is read/write from/to.
 * @returns A tuple, like React.useState, with current state and a callback to set the state.
 */
export const useBehaviorSubjectState = <T>(
  behaviorSubject: rxjs.BehaviorSubject<T>
): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [state, setState] = React.useState<T>(behaviorSubject.value);

  React.useEffect(() => {
    const subscription = behaviorSubject.subscribe(setState);
    return () => subscription.unsubscribe();
  }, [behaviorSubject]);

  const setInternalState = React.useCallback(
    (value: React.SetStateAction<T>) => {
      if (typeof value === 'function') {
        behaviorSubject.next(
          (value as (prevState: T) => T)(behaviorSubject.value)
        );
      } else {
        behaviorSubject.next(value);
      }
    },
    [behaviorSubject]
  );

  return [state, setInternalState];
};
