import * as React from 'react';
import { Auth } from '../../service/auth';
import { QuerySelector, QSItem } from '../../components/common/QuerySelector';
import { Types, inject } from '../../utils/inversify/inversify.config';

export interface QlItem {
  id: string;
  content: string;
}

interface State {
  items: QSItem[] | null;
}

interface Props {
  type: string;
  queryParams?: string;
  mapper: (data: any) => QlItem;
}

class QuerySelectorContainer extends React.Component<Props, State> {
  @inject(Types.Auth)
  private _auth: Auth;

  constructor(props: Props) {
    super(props);

    this.state = {
      items: null,
    };

    this.loadItems = this.loadItems.bind(this);
  }

  shouldComponentUpdate(nextProps: {}, nextState: State) {
    if (this.state.items !== nextState.items) {
      return true;
    } else {
      return false;
    }
  }

  loadItems(input: string) {
    if (input.length !== 0) {
      const { type, queryParams, mapper } = this.props;

      return this._auth.apiCall(`/search?q=${input}&type=${type}${queryParams ? queryParams : ''}`)
        .then((response) => {
          const items = response.data.map(mapper);

          this.setState(() => ({
            items,
          }));
        });
    } else {
      this.setState({
        items: null,
      });

      return Promise.resolve();
    }
  }

  render() {
    const { items } = this.state;

    // const items = [
    //   { id: 1, content: 'Test1' }, 
    //   { id: 2, content: 'Test2' }, 
    //   { id: 3, content: 'Test3' }, 
    //   { id: 4, content: 'Test4' }
    // ];
    return (
      <QuerySelector
        items={items}
        loadItems={this.loadItems}
      />
    );
  }
}

export default QuerySelectorContainer;
