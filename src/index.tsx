import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import './index.scss';

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
