import * as React from 'react';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { clickOutsideChanges$ } from '../../../utils/click-outside';
import { visibleLimits$ } from '../../../utils/scoll-spy';

export interface QlItem {
  id: string;
  content: string;
}

const KeyCodes = {
  ARROW_DOWN: 'ArrowDown',
  ARROW_UP: 'ArrowUp',
};

interface Props {
  items: QlItem[] | null;
  loadItems: (input: string) => void;
  // selectItem: (item: QlItem) => void;
  autofocus?: boolean;
  debounce?: number;
  placeholder?: string;
}

interface State {
  showList: boolean;
  loading: boolean;
}

export class QuerySelector extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {
    autofocus: true,
    debounce: 250,
    placeholder: '',
  };

  private _input: HTMLInputElement;
  private _qsWrapper: HTMLElement;
  private _qsList: HTMLElement;
  private _items$ = new Subject<QlItem[]>();

  constructor(props: Props) {
    super(props);

    this.state = {
      showList: true,
      loading: false,
    };
  }

  componentDidMount() {
    let visibleLimits;
    const keyDown$ = Observable.fromEvent(this._input, 'keydown');
    const activeItem$ = new BehaviorSubject<number | null>(null);
    this._items$
      .do(_ => activeItem$.next(null))
      .filter((items: any) => items && items.length)
      .switchMap(items => visibleLimits$(this._qsList, items.length))
      .subscribe(v => visibleLimits = v);

    clickOutsideChanges$(this._qsWrapper)
      .distinctUntilChanged()
      .subscribe((isOutside: boolean) => {
        const showList = isOutside ? false : true;

        this.setState({
          showList,
        });
      });

    Observable.fromEvent(this._input, 'input')
      .do((event: React.ChangeEvent<HTMLInputElement>) => {
        event.stopPropagation();
      })
      .map((event: React.ChangeEvent<HTMLInputElement>) => event.target.value)
      .distinctUntilChanged()
      .do(_ => this.setState({ loading: true }))
      .debounce(_ => Observable.timer(this.props.debounce))
      .switchMap(input => Observable.of(this.props.loadItems(input)))
      .subscribe();

    activeItem$
      .scan((acc: { currIdx: number | null, nextIdx: number | null }, nextIdx: number | null) => {
        return nextIdx === null ?
          { currIdx: null, nextIdx: null } :
          { currIdx: acc.nextIdx, nextIdx };
      }, {})
      .subscribe(({ currIdx, nextIdx }: any) => {
        let nextEl: Element;
        let currEl: Element;

        if (nextIdx !== null && currIdx === null) {
          nextEl = document.querySelectorAll(`[data-uid='${this.props.items[nextIdx].id}']`)[0];
          nextEl.classList.add('active');
        } else if (nextIdx !== null && currIdx !== null) {
          nextEl = document.querySelectorAll(`[data-uid='${this.props.items[nextIdx].id}']`)[0];
          currEl = document.querySelectorAll(`[data-uid='${this.props.items[currIdx].id}']`)[0];
          nextEl.classList.add('active');
          currEl.classList.remove('active');

          if (visibleLimits && nextIdx >= visibleLimits.to) {
            currEl.scrollIntoView();
          } else if (visibleLimits && nextIdx <= visibleLimits.from) {
            nextEl.scrollIntoView();
          }
        }
      });

    keyDown$
      .filter((event: React.KeyboardEvent<HTMLInputElement>) =>
        event.key === KeyCodes.ARROW_DOWN || event.key === KeyCodes.ARROW_UP)
      .do((event: React.KeyboardEvent<HTMLInputElement>) => {
        event.stopPropagation();
        event.preventDefault();
      })
      .map((event: React.KeyboardEvent<HTMLInputElement>) => event.key === KeyCodes.ARROW_UP ? 1 : -1)
      .map((incr: number) => activeItem$.value !== null ? activeItem$.value + incr : 0)
      .filter((nextIdx: number) => this.props.items ? nextIdx >= 0 && nextIdx < this.props.items.length : false)
      .subscribe((nextIdx: number) => {
        activeItem$.next(nextIdx);
      });
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.items !== this.props.items) {
      this._items$.next(this.props.items);
    }
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
        <div
          className={`qs-list ${showList ? 'show' : 'hide'}`}
          ref={(qsList) => this._qsList = qsList}
        >
          {items && items.length === 0 && <div className="qs-list-empty card text-center">
            <div className="card-body">
              <p className="card-text">
                {'No results'}
              </p>
            </div>
          </div>}
          {items && items.length > 0 &&
            <div className="qs-list-content">
              <ul className="list-group">
                {items.map((item, idx) => (
                  <li
                    className="list-group-item"
                    key={idx}
                    data-uid={item.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      
                    }}
                  >
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
