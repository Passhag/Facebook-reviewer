import * as React from 'react';
import { Observable } from 'rxjs/Observable';
import { clickOutsideChanges$ } from '../../../utils/click-outside';

interface Props {
  items: any[] | null;
  loadItems: (input: string) => void;
  autofocus?: boolean;
  debounce?: number;
  minQueryLen?: number;
  placeholder?: string;
}

interface State {
  showList: boolean;
  loading: boolean;
}

export class QuerySelector extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {
    autofocus: true,
    debounce: 150,
    minQueryLen: 2,
    placeholder: '',
  };

  private _input: HTMLInputElement;
  private _qsWrapper: HTMLElement;

  constructor(props: Props) {
    super(props);

    this.state = {
      showList: true,
      loading: false,
    };
  }

  componentDidMount() {
    const { debounce, loadItems } = this.props;

    clickOutsideChanges$(this._qsWrapper)
      .distinctUntilChanged()
      .subscribe((isOutside: boolean) => {
        const showList = isOutside ? false : true;

        this.setState({
          showList,
        });
      });

    Observable.fromEvent(this._input, 'input')
      .map((event: React.ChangeEvent<HTMLInputElement>) => {
        event.stopPropagation();

        return event.target.value;
      })
      .distinctUntilChanged()
      .do(_ => this.setState({ loading: true }))
      .debounce(_ => Observable.timer(debounce))
      .switchMap(input => Observable.of(loadItems(input)))
      .subscribe();
  }

  render(): JSX.Element {
    const {
      items,
      autofocus,
      placeholder,
     } = this.props;
    const {
      showList,
    } = this.state;

    return (
      <div className="qs-wrapper" ref={(qsWrapper) => this._qsWrapper = qsWrapper}>
        <div className="qs-input">
          <input
            type="text"
            className="form-control"
            autoFocus={autofocus}
            placeholder={placeholder}
            ref={(input) => this._input = input}
          />
        </div>
        <div className={`qs-list ${showList ? 'show' : 'hide'}`}>
          {items && items.length === 0 && <div className="qs-list-empty card text-center">
            <div className="card-body">
              <p className="card-text">
                {'No results'}
              </p>
            </div>
          </div>}
          {items && items.length > 0 && <div className="qs-list-content">
            <ul className="list-group">
              {items.map(item => (
                <li className="list-group-item" key={item.id}>
                  <span>{item.content}</span>
                </li>
              ))}
            </ul>
          </div>}
        </div>
      </div>
    );
  }
}
