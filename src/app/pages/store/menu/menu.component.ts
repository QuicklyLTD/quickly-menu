import { Component, OnInit, Input, ViewChild, } from '@angular/core';
import { IonContent, Platform, ModalController } from '@ionic/angular';
import { MenuCategory, MenuItem } from 'src/app/models/interfaces';
import { ProductModalComponent } from '../product-modal/product-modal.component';
import { fromEvent } from 'rxjs/internal/observable/fromEvent';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'store-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {
  selectedCategory: any;
  slideOpts: any;

  private backbuttonSubscription: Subscription;

  @Input('content') content: IonContent;
  @Input('menu') menu: any;
  @Input('theme') theme: { actionbar: string, greetings: string, fonts?: string, segment?: string, buttons?: string };

  constructor(public platform: Platform, public modalController: ModalController) {
    this.slideOpts = {
      initialSlide: 0,
      speed: 400,
      autoplay: true
    };
  }

  ngOnInit() {
    const event = fromEvent(window, 'popstate');
    this.backbuttonSubscription = event.subscribe(async () => {
      try {
        let isModalHidden = (await this.modalController.getTop()).hidden;
        if (isModalHidden) {
          if (window.location.pathname == '/store/category') {
            this.selectedCategory = undefined;
          } else {
            this.selectedCategory = undefined;
            history.pushState(null, null, window.location.pathname);
          }
        } else {
          history.pushState(null, null, window.location.pathname + '/category');
          const modal = await this.modalController.getTop();
          if (modal) {
            modal.dismiss();
          }
        }
      } catch (error) {
        this.selectedCategory = undefined;
      }
    });
  }

  ngOnDestroy() {
    this.backbuttonSubscription.unsubscribe();
  }

  scrollTo(element: string) {
    let yOffset = document.getElementById(element).offsetTop;
    if (this.platform.is('android')) {
      this.content.scrollToPoint(0, yOffset + 1240, 666)
    } else {
      this.content.scrollToPoint(0, yOffset, 1000)
    }
  }

  selectCategory(item: MenuCategory) {
    if (window.location.pathname !== '/store/category') {
      history.pushState(null, null, window.location.pathname + '/category');
    }
    setTimeout(() => {
      this.selectedCategory = item;
      this.content.scrollToPoint(0, 0, 666);
    }, 100);
  }

  unselectCategory() {
    if (window.location.pathname == '/store/category') {
      history.replaceState(null, null, '/store');
    }
    this.selectedCategory = undefined;
  }


  async productDetail(item: MenuItem) {
    const modal = await this.modalController.create({
      component: ProductModalComponent,
      swipeToClose: true,
      backdropDismiss: true,
      componentProps: {
        product: item,
        slug: this.menu.slug
      }
    });
    return await modal.present();
  }

}
