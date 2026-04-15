import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpService } from './http.service';
import { Menu } from '../models/interfaces';


@Injectable({
  providedIn: 'root'
})
export class StoreService {

  private menu: BehaviorSubject<Menu> = new BehaviorSubject(null);
  private store: BehaviorSubject<any> = new BehaviorSubject(null);

  constructor(private http: HttpService) { }

  getStore() {
    return this.store.value;
  }

  getMenu() {
    return this.menu.value;
  }

  changeMenuLang(lang: 'tr' | 'en' | 'ar') {
    let currentMenu = this.getMenu();
    // currentMenu.categories.map(obj => obj.name.split('|')[0]);
    // this.menu.next(currentMenu);
  }

  isOrderOpen(): boolean {
    return this.getStore().settings.order;
  }

  isPreOrderOpen(): boolean {
    return this.getStore().settings.preorder;
  }

  isReservationOpen(): boolean {
    return this.getStore().settings.reservation;
  }

  setStore(slug: string) {
    return this.http.get('/menu/slug/' + slug).toPromise().then((res: any) => {
      this.store.next(res.store);
      this.menu.next(res.menu);
      return res;
    });
  }
}