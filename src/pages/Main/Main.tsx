import * as React from 'react';
import { QuerySelectorContainer } from '../../containers/QuerySelector';

export const MainPage: React.SFC<any> = (): JSX.Element => (
  <div className="row">
    <QuerySelectorContainer />
  </div>
);
