import * as React from 'react';
import { Types, inject } from '../../../utils/inversify/inversify.config';
import { Auth, ProviderTypes } from '../../../service/auth';

interface Props {
  onLoginClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export const LoginFbBtn: React.SFC<Props> = ({ onLoginClick }): JSX.Element => (
  <button type="button" className="btn btn-primary" onClick={onLoginClick}>
    Login with Facebook
  </button>
);
