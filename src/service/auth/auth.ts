import { Observable } from 'rxjs/Observable';

export interface Auth {
  authChange$: Observable<boolean | null>;
  login: (scope: string) => Promise<void>;
}
