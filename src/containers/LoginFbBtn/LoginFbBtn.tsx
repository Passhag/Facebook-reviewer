import * as React from 'react';
import { Types, inject } from '../../utils/inversify/inversify.config';
import { Auth, ProviderTypes } from '../../service/auth';
import { LoginFbBtn } from '../../components/common/LoginFbBtn';

interface Props {
  onLogin: () => void;
  scope?: string;
}

export class LoginFbBtnContainer extends React.Component<Props, {}> {
  static defaultProps: Partial<Props> = {
    scope: 'public_profile, email',
  };

  @inject(Types.Auth)
  private _auth: Auth;

  constructor(props: Props) {
    super(props);

    this.onLoginClick = this.onLoginClick.bind(this);
  }

  onLoginClick(event: React.MouseEvent<HTMLButtonElement>): void {
    const {
      onLogin,
      scope,
    } = this.props;

    event.stopPropagation();

    this._auth.login(scope as string)
      .then(() => onLogin())
      .catch((error: Error) => error);
  }

  render(): JSX.Element {
    return (
      <LoginFbBtn onLoginClick={this.onLoginClick} />
    );
  }
}
