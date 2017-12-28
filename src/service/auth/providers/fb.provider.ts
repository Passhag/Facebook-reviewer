import { injectable } from 'inversify';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { Auth } from '../auth';

declare const FB: any;

export const AuthStatusEvents = {
  AUTH_LOGIN: 'auth.login',
  AUTH_LOGOUT: 'auth.logout',
  AUTH_AUTH_RESPONSE_CHANGE: 'auth.authResponseChange',
  AUTH_STATUS_CHANGE: 'auth.statusChange',
};

@injectable()
export class FbProvider implements Auth {
  private _authChange$ = new BehaviorSubject<boolean | null>(null);

  constructor() {
    FB.getLoginStatus((response) => {
      if (response.status === 'connected') {
        this._authChange$.next(true);
      } else {
        this._authChange$.next(false);
      }
    });

    FB.Event.subscribe(AuthStatusEvents.AUTH_STATUS_CHANGE, (response) => {
      if (response.status === 'connected') {
        this._authChange$.next(true);
      } else {
        this._authChange$.next(false);
      }
    });
  }

  get authChange$(): Observable<boolean | null> {
    return this._authChange$.asObservable();
  }

  login(scope: string): Promise<void> {
    return new Promise((resolve, reject) => {
      FB.login((response) => {
        if (response.status === 'connected') {
          resolve();
        } else {
          reject();
        }
      }, {
          scope,
        });
    });
  }
}
