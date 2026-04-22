import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

import { Platform, ModalController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { BehaviorSubject } from 'rxjs';
import { OrderService } from './services/order.service';
import { OrderModalComponent } from './pages/store/order-modal/order-modal.component';
import { TranslateService } from '@ngx-translate/core';
import { SwUpdate } from '@angular/service-worker';
import { OrderType } from './models/interfaces';
import { fromEvent } from 'rxjs/internal/observable/fromEvent';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit {

  orderItemCount$: BehaviorSubject<number>;
  orderType$: BehaviorSubject<OrderType>;

  @ViewChild('cart', { static: true }) fab: ElementRef;

  public selectedIndex = 0;
  // backbuttonSubscription: any;

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private orderService: OrderService,
    private translate: TranslateService,
    private swUpdate: SwUpdate,
    public modalController: ModalController,
  ) {
    this.initializeApp();

    this.swUpdate.available.subscribe(event => {
      if (confirm('Güncelleme Mevcut. Lütfen sayfayı yenileyin.')) {
        window.location.reload();
      } else {
        console.log('Eski Versiyon İle Devam Ediliyor...');
      }
    });

    setInterval(() => {
      try {
        if (this.swUpdate.isEnabled) {
          this.swUpdate.checkForUpdate();
        }
      } catch (e) {
        // service worker dev mode'da disabled — sessizce geç
      }
    }, 10000);
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.orderItemCount$ = this.orderService.getOrderItemCount();
      this.orderType$ = this.orderService.getOrderType();
    });
  }

  ngOnInit() {
    this.translate.addLangs(['en', 'tr', 'fr', 'ja']);
    // this.translate.setDefaultLang('tr');
    const browserLang = this.translate.getBrowserLang();
    this.translate.use(browserLang.match(/en|tr|fr/) ? browserLang : 'en');

    // const event = fromEvent(window, 'popstate');
    // this.backbuttonSubscription = event.subscribe(async () => {
    //   try {
    //     let isModalHidden = (await this.modalController.getTop()).hidden;

    //     if (isModalHidden) {

    //     } else {
    //       const modal = await this.modalController.getTop();
    //       if (modal) {
    //         modal.dismiss();
    //       }
    //     }
    //   } catch (error) {
    //     const modal = await this.modalController.getTop();
    //     if (modal) {
    //       modal.dismiss();
    //     }
    //   }
    // });
  }

  async openCart() {
    const modal = await this.modalController.create({
      component: OrderModalComponent,
      swipeToClose: true,
      backdropDismiss: true
    });

    modal.onWillDismiss().then(() => {
      // this.fab.nativeElement.classList.remove('animated', 'bounceOutLeft');
      // this.animateCSS('bounceInLeft');
    });
    modal.present();
  }
}
