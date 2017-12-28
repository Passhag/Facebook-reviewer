import * as React from 'react';
import {
  BrowserRouter,
  Route,
  RouteProps,
  Redirect,
  Switch,
} from 'react-router-dom';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/skipWhile';
import { Types, inject, container } from './utils/inversify/inversify.config';
import { Auth, ProviderTypes } from './service/auth';
import { LoginPage } from './pages/Login';
import { MainPage } from './pages/Main';

interface PrivateRouteProps extends RouteProps {
  component: React.ComponentClass<any> | React.SFC<any>;
  show: boolean;
  redirectPath: string;
}

const PrivateRoute: React.SFC<PrivateRouteProps> =
  ({ component: Component, show, redirectPath, ...routeProps }): JSX.Element => (
    <Route
      {...routeProps}
      render={
        (props) => {
          return show ?
            <Component {...props} /> :
            <Redirect to={{ pathname: redirectPath, state: { from: props.location } }} />;
        }
      }
    />
  );

class App extends React.Component<any, any> {
  @inject(Types.AuthFactory)
  private _authFactory: (providerType: ProviderTypes) => Auth;
  private _auth: Auth;

  constructor(props: any) {
    super(props);
    this.state = {
      isAuth: null,
    };

    this._auth = this._authFactory(ProviderTypes.Facebook);
  }

  componentDidMount() {
    this._auth.authChange$
      .skipWhile(val => val === null)
      .distinctUntilChanged()
      .subscribe((isAuth: boolean) => {
        this.setState({
          isAuth,
        });
      });
  }

  render() {
    const { isAuth } = this.state;
    let output: any = null;

    if (this.state.isAuth === null) {
      output = 'Loading...';
    } else {
      output = (
        <BrowserRouter>
          <Switch>
            <PrivateRoute
              exact={true}
              path="/"
              component={MainPage}
              show={isAuth}
              redirectPath={'/login'}
            />
            <PrivateRoute
              exact={true}
              path="/login"
              component={LoginPage}
              show={!isAuth}
              redirectPath={'/'}
            />
          </Switch>
        </BrowserRouter>
      );
    }

    return (
      <div className="container">
        {output}
      </div>
    );
  }
}

export default App;
