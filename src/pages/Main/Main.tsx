import * as React from 'react';

import { QuerySelectorContainer } from '../../containers/QuerySelector';

export const MainPage: React.SFC<any> = (): JSX.Element => (
  <div className="row">
    <QuerySelectorContainer
      type={'group'}
      mapper={(item: any) => ({ id: item.id, content: item.name })}
    />
  </div>
);

// this._auth.getGroupFeed('12440008769')
// .then((response) => {
//   console.log(response);
// });
