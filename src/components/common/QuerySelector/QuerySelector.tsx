import * as React from 'react';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

import { KeyCodes } from './constants';
import {
  clickOutsideChanges$,
  visibleLimits$,
} from './utils';

import './styles.scss';

export interface QSItemBase {
  id: number;
  content: string;
}

export interface QSItemMedia extends QSItemBase {
  icon?: string;
}

export type QSItem = QSItemBase | QSItemMedia;

interface Props {
  items: QSItem[] | null;
  loadItems: (input: string) => Promise<any>;
  scrolledUp?: () => void;
  selectItem?: (item: QSItem) => void;
  autofocus?: boolean;
  debounce?: number;
  placeholder?: string;
  noItemsText?: string;
  loadingText?: string;
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
    noItemsText: 'No results',
    loadingText: 'Loading...',
  };

  private _currentItemIdx: number;
  private _inputRef: HTMLInputElement;
  private _qsWrapperRef: HTMLElement;
  private _qsListRef: HTMLElement;
  private _itemsChanges$ = new Subject<QSItem[]>();

  constructor(props: Props) {
    super(props);

    this.state = {
      showList: true,
      loading: false,
    };

    this.onQsItemSelect = this.onQsItemSelect.bind(this);
  }

  componentDidMount() {
    this._initInputListener();
    this._initClickOutsideListener();
    this._initKeysNavigation();
  }

  componentWillUpdate(nextProps: Props, nextState: State) {
    if (nextState.showList !== this.state.showList ||
      nextState.loading !== this.state.loading ||
      nextProps.items !== this.props.items) {
      if (this._isItemSelected()) {
        this._resetCurrentItem();
      }
    }
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (prevProps.items !== this.props.items) {
      requestAnimationFrame(() => {
        this._itemsChanges$.next(this.props.items);
      });
    }
  }

  onQsItemSelect(event: React.MouseEvent<HTMLElement>, index: number): void {
    const { selectItem, items } = this.props;

    event.stopPropagation();

    if (selectItem) {
      const qsItem = items[index];

      selectItem(qsItem);
    }
  }

  _initInputListener(): void {
    const { loadItems } = this.props;

    Observable.fromEvent(this._inputRef, 'input')
      .map((event: React.ChangeEvent<HTMLInputElement>) => event.target.value)
      .distinctUntilChanged()
      .do(_ => this.setState(() => ({ loading: true })))
      .debounce(_ => Observable.timer(this.props.debounce))
      .switchMap(input => Observable.fromPromise(loadItems(input)))
      .do(_ => this.setState(() => ({ loading: false })))
      .subscribe();
  }

  _initKeysNavigation(): void {
    let visibleLimits;

    this._itemsChanges$
      .filter(_ => this._isItems())
      .switchMap(_items => visibleLimits$(this._qsListRef, _items.length))
      .subscribe(v => visibleLimits = v);

    Observable.fromEvent(this._inputRef, 'keydown')
      .filter((event: React.KeyboardEvent<HTMLInputElement>) =>
        this._isItems() && (event.key === KeyCodes.ARROW_DOWN || event.key === KeyCodes.ARROW_UP))
      .do((event: React.KeyboardEvent<HTMLInputElement>) => {
        event.preventDefault();
      })
      .map((event: React.KeyboardEvent<HTMLInputElement>) =>
        event.key === KeyCodes.ARROW_DOWN ? 1 : -1)
      .map((succ: number) =>
        this._currentItemIdx !== undefined ? this._currentItemIdx + succ : 0)
      .filter((nextItemIdx: number) =>
        nextItemIdx >= 0 && nextItemIdx < this.props.items.length)
      .subscribe((nextItemIdx: number) => {
        const nextElement = this._getItemElement(nextItemIdx);

        if (this._currentItemIdx !== undefined) {
          const currentElement = this._getItemElement(this._currentItemIdx);

          currentElement.classList.remove('active');
          nextElement.classList.add('active');
        } else {
          nextElement.classList.add('active');
        }
        this._currentItemIdx = nextItemIdx;

        if (visibleLimits && nextItemIdx <= visibleLimits.from || nextItemIdx >= visibleLimits.to) {
          nextElement.scrollIntoView();
        }
      });
  }

  _initClickOutsideListener(): void {
    clickOutsideChanges$(this._qsWrapperRef)
      .distinctUntilChanged()
      .subscribe((isOutside: boolean) => {
        const showList = isOutside ? false : true;

        this.setState({
          showList,
        });
      });
  }

  _resetCurrentItem(): void {
    const currentElement = this._getItemElement(this._currentItemIdx);

    currentElement.classList.remove('active');
    this._currentItemIdx = undefined;
  }

  _isItemSelected(): boolean {
    return this._currentItemIdx !== undefined;
  }

  _isItems(): boolean {
    const { items } = this.props;

    return items && items.length >= 0;
  }

  _getItemElement(itemIdx: number): Element {
    const { items } = this.props;
    const anItem = items[itemIdx];
    const anElement = this._qsListRef.querySelector(`#list-group-item-${anItem.id}`);

    return anElement;
  }

  render(): JSX.Element {
    const {
      items,
      selectItem,
      autofocus,
      placeholder,
      noItemsText,
      loadingText,
     } = this.props;
    const {
      showList,
      loading,
    } = this.state;
    const renderItem = (item: QSItem, idx: number) => (
      <li
        id={`list-group-item-${item.id}`}
        className="list-group-item"
        key={idx}
        onClick={event => this.onQsItemSelect(event, idx)}
      >
        <span>{item.content}</span>
      </li>
    );

    return (
      <div
        className="qs-wrapper"
        ref={qsWrapperRef => this._qsWrapperRef = qsWrapperRef}
      >
        <div className="qs-input-container">
          <input
            type="text"
            className="form-control"
            autoFocus={autofocus}
            placeholder={placeholder}
            ref={inputRef => this._inputRef = inputRef}
          />
        </div>
        <div
          className={`qs-list-container${showList ? ' show' : ' hide'}`}
          ref={qsListRef => this._qsListRef = qsListRef}
        >
          {items && items.length === 0 && !loading &&
            <div className="qs-list-empty card text-center">
              <div className="card-body">
                <p className="card-text">
                  {noItemsText}
                </p>
              </div>
            </div>}
          {items && items.length > 0 && !loading &&
            <div className="qs-list">
              <ul className="list-group">
                {items.map(renderItem)}
              </ul>
            </div>}
          {loading &&
            <div className="qs-list-loading card text-center">
              {loadingText}
            </div>}
        </div>
      </div>
    );
  }
}
