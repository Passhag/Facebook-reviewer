import * as React from 'react';
import { LoginFbBtnContainer } from '../../containers/LoginFbBtn';

interface Props {
  history: any;
  afterLoginPath: string;
}

export const LoginPage: React.SFC<Props> = ({ history, afterLoginPath }): JSX.Element => {
  return (
    <div className="row login-wrapper">
      <LoginFbBtnContainer
        onLogin={() => history.replace(afterLoginPath)}
      />
    </div>
  );
};
