import * as rxjs from 'rxjs';

export const jobId$ = new rxjs.BehaviorSubject<string>(sessionStorage.getItem('jobId') || '');
