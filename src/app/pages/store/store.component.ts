import { Component, OnInit, Renderer2, ViewChild } from '@angular/core';
import { StoreService } from '../../services/store.service';
import { UserService } from '../../services/user.service';
import { CheckService } from 'src/app/services/check.service';

import { LanguageComponent } from '../../language/language.component';
import { PopoverController } from '@ionic/angular';
import { OrderType, User } from 'src/app/models/interfaces';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { OrderService } from 'src/app/services/order.service';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Component({
  selector: 'app-store',
  templateUrl: './store.component.html',
  styleUrls: ['./store.component.scss'],
})
export class StoreComponent implements OnInit {
  user: User;
  store: any;
  menu: any;
  table: any;
  selectedSegment: string = 'menu';
  theme: { actionbar: string, greetings: string, segment: string, fonts: string, buttons: string } = { actionbar: 'dark', greetings: 'light', segment: 'dark', fonts: 'warning', buttons: 'secondary' };

  selectedLang: string;

  isOrderOpen: boolean;
  isPreOrderOpen: boolean;
  orderItemCount$: BehaviorSubject<number>;

  @ViewChild("header", {static:true}) header: HTMLElement;

  constructor(
    private router: Router,
    private storeService: StoreService,
    private userService: UserService,
    private orderService: OrderService,
    private checkService: CheckService,
    private translate: TranslateService,
    public popoverController: PopoverController,
    public renderer: Renderer2
  ) {

    this.selectedLang = this.translate.getDefaultLang();
    this.user = this.userService.getUser();
    if (!this.storeService.getStore()) {
      this.router.navigate(['error']);
    }

  }



  goBasket() {
    if (window.location.pathname == '/store/category') {
      history.replaceState(null, null, '/store');
    }
    this.router.navigate(['/basket'])
  }

  goCheck() {
    if (window.location.pathname == '/store/category') {
      history.replaceState(null, null, '/store');
    }
    this.router.navigate(['/check'])
  }

  ngOnInit() {
    // this.storeService.changeMenuLang('tr');
    this.menu = this.storeService.getMenu();
    this.store = this.storeService.getStore();

    this.isOrderOpen = this.storeService.isOrderOpen() && this.checkService.getCheck() && (this.orderService.getOrderType().value == OrderType.INSIDE);
    this.isPreOrderOpen = this.storeService.isPreOrderOpen() && (this.orderService.getOrderType().value == OrderType.OUTSIDE);

    this.orderItemCount$ = this.orderService.getOrderItemCount();

    this.translate.onLangChange.subscribe(res => {
      this.selectedLang = res.lang;
    })
  }

  segmentChanged(event) {
    this.selectedSegment = event.detail.value;
  }


  ionViewWillEnter() {
    this.renderer.setStyle(this.header['el'], 'webkitTransition', 'top 175ms');
  }

  onContentScroll(event) {
    if (event.detail.scrollTop >= 50) {
      this.renderer.setStyle(this.header['el'], 'top', '-44px');
    } else {
      this.renderer.setStyle(this.header['el'], 'top', '0px');
    }
  }

  async selectLanguage(ev: any) {
    const popover = await this.popoverController.create({
      component: LanguageComponent,
      cssClass: 'my-custom-class',
      event: ev,
      translucent: false,
      mode: 'md'
    });
    return await popover.present();
  }

}
