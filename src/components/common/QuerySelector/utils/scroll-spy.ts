import { Observable } from 'rxjs/Observable';

export const visibleLimits$ =
  (scrollHost: HTMLElement, itemsLength: number): Observable<{ from: number, to: number }> => {
    const itemHeight = Math.floor(scrollHost.scrollHeight / itemsLength);
    const visibleElementsNumber = Math.floor(scrollHost.clientHeight / itemHeight);
    const initialLimits = {
      from: Math.floor(scrollHost.scrollTop / itemHeight),
      to: visibleElementsNumber + Math.floor(scrollHost.scrollTop / itemHeight),
    };

    return Observable.fromEvent(scrollHost, 'scroll')
      .startWith(initialLimits)
      .map(_ => {
        const from = Math.floor(scrollHost.scrollTop / itemHeight);
        const to = visibleElementsNumber + from;

        return {
          from,
          to,
        };
      });
  };
