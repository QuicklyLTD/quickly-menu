import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../../services/order.service';
import { ModalController, AlertController, ToastController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-order-modal',
  templateUrl: './order-modal.component.html',
  styleUrls: ['./order-modal.component.scss'],
})
export class OrderModalComponent implements OnInit {

  orderList: Array<any> = [];
  orderTotal: number = 0;
  loading: Promise<HTMLIonLoadingElement>;

  constructor(
    private orderService: OrderService,
    private modalController: ModalController,
    private alertController: AlertController,
    private toastController: ToastController,
    private loadingController: LoadingController

  ) { 

    this.loading = this.loadingController.create({
      spinner: 'circular',
      message: 'Sipariş Gönderiliyor',
      mode:'ios',
      translucent: true,
      backdropDismiss: false,
    });

  }

  ngOnInit() {
    this.orderList = this.orderService.getOrder();
    this.orderList.map(obj => {
      obj.price = parseInt(obj.price);
      return obj;
    });
  }

  ngOnDestroy() {
    // if (this.unregisterBackAction) {
    //   this.unregisterBackAction();
    // }
  }

  async removeOrderItem(index: number) {
    const alert = await this.alertController.create({
      mode: 'ios',
      header: 'Dikkat!',
      message: `<b>${this.orderList[index].name}</b> <br> adlı ürün listeden çıkartılacak!`,
      buttons: [
        {
          text: 'İptal',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Onayla',
          cssClass: 'danger',
          handler: () => {
            this.orderService.removeProduct(index);
            if (this.orderList.length == 0) {
              this.presentToast('Sipariş Listesi Boş')
              this.modalController.dismiss();
            }
          }
        }
      ]
    });
    alert.present();
  }

  getTotal() {
    return this.orderList.reduce((sum, { price }) => sum + price, 0);
  }

  dismiss() {
    this.modalController.dismiss();
  }

  async presentToast(note: string) {
    const toast = await this.toastController.create({
      message: note,
      duration: 2000,
      mode: 'ios',
    });
    toast.present();
  }

  async checkOut() {
    (await this.loading).present();
    this.orderService.sendOrders().then(async res => {
      (await this.loading).dismiss();
      this.successMessage();
    }).catch(async err => {
      (await this.loading).dismiss();
      this.presentToast('Lütfen Tekrar Deneyin');
    })
  }

  async successMessage() {
    this.orderService.clearOrder();
    const alert = await this.alertController.create({
      mode: 'ios',
      header: 'Tebrikler! Sipariş Gönderildi.',
      message: 'En kısa sürede siparişinizi size ulaştıracağız.',
      buttons: ['Tamam']
    });
    alert.present().then(() => {
      this.modalController.dismiss();
    });
  }

}