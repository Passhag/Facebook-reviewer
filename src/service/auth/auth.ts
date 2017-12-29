import { Observable } from 'rxjs/Observable';

export interface Auth {
  authChange$: Observable<boolean | null>;
  login: (scope: string) => Promise<any>;
  apiCall: (path: string, id?: string) => Promise<any>;
}
