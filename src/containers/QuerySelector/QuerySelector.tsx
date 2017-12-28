import * as React from 'react';
import { QuerySelector } from '../../components/common/QuerySelector';

interface State {
  items: any[] | null;
}

class QuerySelectorContainer extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props);

    this.state = {
      items: null,
    };

    this.loadItems = this.loadItems.bind(this);
  }

  loadItems(input: string): void {
    console.log(input);

    this.setState({
      items: [{ id: 1, content: input}],
    });
  }

  render() {
    const { items } = this.state;

    return (
      <QuerySelector
        items={items}
        loadItems={this.loadItems}
      />
    );
  }
}

export default QuerySelectorContainer;
