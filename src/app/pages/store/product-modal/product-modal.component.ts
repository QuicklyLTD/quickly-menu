import { Component, OnInit, Input } from '@angular/core';
import { ModalController, AlertController, ToastController, LoadingController } from '@ionic/angular';
import { OrderService } from 'src/app/services/order.service';
import { StoreService } from 'src/app/services/store.service';
import { UserService } from 'src/app/services/user.service';
import { CheckService } from 'src/app/services/check.service';
import { OrderType } from 'src/app/models/interfaces';
import { Router } from '@angular/router';

import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-product-modal',
  templateUrl: './product-modal.component.html',
  styleUrls: ['./product-modal.component.scss'],
})
export class ProductModalComponent implements OnInit {

  @Input() product: any;
  @Input() slug: string;
  orderPrice: number;
  orderCount: number = 1;
  orderNote: string = '';
  selectedType: string = '';

  isOrderOpen: boolean;
  isPreOrderOpen: boolean;

  allergenics: Array<{ code: string, name: string, icon: string, color: string }>;
  productTranslate: any;
  loading: Promise<HTMLIonLoadingElement>;


  constructor(
    private router: Router,
    private translate: TranslateService,
    private orderService: OrderService,
    private storeService: StoreService,
    private userService: UserService,
    private checkService: CheckService,
    public modalController: ModalController,
    public alertController: AlertController,
    public toastController: ToastController,
    public loadingController: LoadingController
  ) {
    this.isOrderOpen = this.storeService.isOrderOpen() && this.checkService.getCheck() && (this.orderService.getOrderType().value == OrderType.INSIDE);
    this.isPreOrderOpen = this.storeService.isPreOrderOpen() && (this.orderService.getOrderType().value == OrderType.OUTSIDE);

    this.allergenics = [
      { code: "ALCOHOL", name: 'ALERGENICS.ALCOHOL', icon: 'alcohol.jpg', color: "warning" },
      { code: "GLUTEN", name: 'ALERGENICS.GLUTEN', icon: 'gluten.jpg', color: "warning" },
      { code: "NUT", name: 'ALERGENICS.NUT', icon: 'nuts.jpg', color: "warning" },
      { code: "EGG", name: 'ALERGENICS.EGG', icon: 'egg.jpg', color: "warning" },
      { code: "SEAFOOD", name: 'ALERGENICS.SEAFOOD', icon: 'fish.jpg', color: "secondary" },
      { code: "LUPINS", name: 'ALERGENICS.LUPINS', icon: 'lupins.jpg', color: "warning" },
      { code: "LAKTOSE", name: 'ALERGENICS.LAKTOSE', icon: 'milk.jpg', color: "secondary" },
      { code: "MUSHROOM", name: 'ALERGENICS.MUSHROOM', icon: 'mushroom.png', color: "warning" },
      { code: "PORK", name: 'ALERGENICS.PORK', icon: 'pork.jpg', color: "danger" },
      { code: "SOYBEAN", name: 'ALERGENICS.SOYBEAN', icon: 'soy.jpg', color: "success" },
      { code: "SUGAR", name: 'ALERGENICS.SUGAR', icon: 'sugar.jpg', color: "danger" },
      { code: "MUSTARD", name: 'ALERGENICS.MUSTARD', icon: 'mustard.jpg', color: "warning" },
      { code: "PEANUTS", name: 'ALERGENICS.PEANUTS', icon: 'peanuts.jpg', color: "warning" },
      { code: "SULFURDIOXIDE", name: 'ALERGENICS.SULFURDIOXIDE', icon: 'sulphite.jpg', color: "secondary" },
      { code: "TRANSFAT", name: 'ALERGENICS.TRANSFAT', icon: 'transfat.jpg', color: "success" },
      { code: "CELERY", name: 'ALERGENICS.CELERY', icon: 'celery.jpg', color: "success" },
      { code: "CRUSTACEOUS", name: 'ALERGENICS.CRUSTACEOUS', icon: 'crustacean.jpg', color: "danger" },
      // { code:"PORK", name: 'ALERGENICS.CRUSTACEOUS', icon: 'molluscs.jpg', color:"warning" },
      // { code:"PORK", name: 'ALERGENICS.MEAT', icon: 'meat.jpg', color:"warning" },
      // { code:"PORK", name: 'ALERGENICS.CORN', icon: 'corn.jpg', color:"warning" },
    ]

    this.translate.get('PRODUCT').subscribe(res => {
      this.productTranslate = res;
    })

    this.loading = this.loadingController.create({
      spinner: 'circular',
      message: 'Sipariş Gönderiliyor',
      mode:'ios',
      translucent: true,
      backdropDismiss: false,
    });


  }

  ngOnInit() {
    if (!this.product.hasOwnProperty('price')) {
      this.orderPrice = this.product.options[0].price;
      this.selectedType = this.product.options[0].name;
    } else {
      this.orderPrice = this.product.price;
    }

    this.presentLoading();
  }

  productAllergenics(allergens_codes: Array<string>) {
    return this.allergenics.filter(alergen => allergens_codes.includes(alergen.code));
  }

  changeType(type: string) {
    let selection = this.product.options.find(obj => obj.name == type);
    this.orderPrice = selection.price;
  }

  decrementCount() {
    if (this.orderCount > 1) {
      this.orderCount = this.orderCount - 1;
    }
  }

  incrementCount() {
    if (this.orderCount < 10) {
      this.orderCount = this.orderCount + 1;
    } else {
        this.presentToast(this.productTranslate.LIMIT);
    }
  }

  async presentToast(note: string) {
    const toast = await this.toastController.create({
      message: note,
      duration: 2000,
      mode: 'ios',
    });
    toast.present();
  }

  async sendOrder() {
    if (this.orderCount == 0) {
      this.presentToast('Lütfen Sipariş Adedi Ekleyiniz.');
    } else {
      const alert = await this.alertController.create({
        mode: 'ios',
        header: this.productTranslate.CONFIRM,
        message: `<h5>${this.orderCount} ${this.productTranslate.QUANTITY} </h5> <h5> <u> ${this.product.name} ${this.selectedType}</u> </h5> ${this.productTranslate.TOTAL}: <h5>${(this.orderPrice * this.orderCount).toFixed(2)} TL</h5>`,
        buttons: [
          {
            text: this.productTranslate.CANCEL,
            role: 'cancel',
            cssClass: 'secondary',
            handler: (blah) => {
              console.log('Order Canceled');
            }
          },
          {
            text: this.productTranslate.ADD_LIST,
            handler: () => {
              this.orderService.addProduct(this.product, this.orderPrice, this.orderCount, this.orderNote, this.selectedType);
              this.dismiss();
            }
          },
          {
            text: this.productTranslate.SEND_NOW,
            handler: async () => {
              if (this.orderService.getOrderType().value == OrderType.INSIDE) {
                (await this.loading).present();
                let send = await this.orderService.sendOne(this.product, this.orderPrice, this.orderCount, this.orderNote, this.selectedType);
                if (send.ok) {
                  (await this.loading).dismiss();
                  const alert = await this.alertController.create({
                    mode: 'ios',
                    header: 'Tebrikler! Sipariş Gönderildi.',
                    message: 'En kısa sürede siparişinizi size ulaştıracağız.',
                    buttons: ['Tamam']
                  });
                  alert.present().then(() => {
                    this.dismiss();
                  });
                } else {
                  (await this.loading).dismiss();
                  this.presentToast('Hata Oluştu.. Tekrar Deneyin');
                }
              } else if (this.orderService.getOrderType().value == OrderType.OUTSIDE) {
                this.orderService.addProduct(this.product, this.orderPrice, this.orderCount, this.orderNote, this.selectedType);
                history.replaceState(null, null, '/store');
                this.router.navigate(['/basket']).then(() => {
                  setTimeout(() => {
                    this.dismiss();
                  }, 300)
                })
                // const alert = await this.alertController.create({
                //   mode: 'ios',
                //   header: 'Ürün Sepete Eklendi',
                //   message: 'Sepete Yönlendiriliyor...',
                //   buttons: ['Tamam']
                // });

              }
            }
          }
        ]
      });
      await alert.present();
    }
  }

  dismiss() {
    this.modalController.dismiss({
      'dismissed': true
    });
  }

  async presentLoading() {

    // await loading.present();

    // const { role, data } = await loading.onDidDismiss();
    // console.log('Loading dismissed with role:', role);
  }

}
