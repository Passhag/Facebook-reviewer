import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/timer';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/scan';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/operator/debounce';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/startWith';
import './styles/index.scss';

declare const window: any;

const isFbSdkReady = (): Promise<void> => new Promise((resolve, reject) => {
  if (window.FB) {
    resolve();
  } else {
    const sdkSrc: any = document.getElementById('facebook-jssdk');

    sdkSrc.onload = () => resolve();
    sdkSrc.onerror = () => reject(
      new Error('something went wrong during the loading of the FbJsSdk.')
    );
  }
});

const startReactApp = (): void => {
  ReactDOM.render(
    <App />,
    document.getElementById('root') as HTMLElement
  );
  registerServiceWorker();
};

isFbSdkReady()
  .then(() => {
    startReactApp();
  })
  .catch((e: Error) => {
    throw e;
  });
