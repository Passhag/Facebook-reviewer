import { Observable } from 'rxjs/Observable';

export const clickOutsideChanges$ = (element: HTMLElement): Observable<boolean> => (
  Observable.fromEvent(document, 'click')
    .map((event: any) => {
      const isChild = element.contains(event.target);
      const isSelf = element === event.target;

      event.stopPropagation();

      return !(isChild || isSelf) ? true : false;
    })
);
