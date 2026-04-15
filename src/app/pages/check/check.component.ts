import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DatabaseService } from 'src/app/services/database.service';
import { ToastController, AlertController } from '@ionic/angular';
import { UserService } from 'src/app/services/user.service';
import { Order, User, Receipt, ReceiptStatus, ReceiptType, ReceiptMethod, OrderStatus } from 'src/app/models/interfaces';
import { OrderService } from 'src/app/services/order.service';
import { CheckService } from 'src/app/services/check.service';

@Component({
  selector: 'app-check',
  templateUrl: './check.component.html',
  styleUrls: ['./check.component.scss'],
})
export class CheckComponent implements OnInit {

  check: any;

  checkTotal: number;
  checkItems: Array<Order> = [];
  checkView: Array<any>;

  payedView: Array<any>;
  payedTotal: number;

  receipts: Receipt[];
  receiptsView: Receipt[];

  user: User
  userTotal: number;
  userItems: Array<Order> = [];

  isLoaded: boolean;

  selectedSegment: string;

  constructor(
    private router: Router,
    private db: DatabaseService,
    private userService: UserService,
    private orderService: OrderService,
    private checkService: CheckService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    this.isLoaded = false;
    this.user = this.userService.getUser();
    this.check = this.checkService.getCheck();
    if (!this.check) {
      this.router.navigate(['error']);
    }
    this.selectedSegment = 'orders';
  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.fillData();
  }

  async removeOrder(order: Order) {
    const alert = await this.alertController.create({
      mode: 'ios',
      header: 'Dikkat!',
      message: `Seçtiğiniz sipariş İptal edilecek.`,
      buttons: [
        {
          text: 'Vazgeç',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Tamam',
          cssClass: 'danger',
          handler: () => {
            order.status = OrderStatus.CANCELED;
            this.db.Database.put(order).then(res => {
              this.presentToast('Sipariş İptal Edildi!');
              this.fillData();
            }).catch(err => {
              this.presentToast('Lütfen Tekrar Deneyin');
            })
          }
        }
      ]
    });
    alert.present();
  }

  orderTotal(order: Order): number {
    return order.items.reduce((sum, { price }) => sum + price, 0);
  }

  async repeatOrder(Order: Order) {
      const alert = await this.alertController.create({
        mode: 'ios',
        header: 'Dikkat !',
        message: `<b>Sipariş Tekrar Gönderilecek</b> <br> Ne Yapmak İstersiniz?`,
        buttons: [
          {
            text: 'Vazgeç',
            role: 'cancel',
            cssClass: 'secondary'
          },
          {
            text: 'Siparişi Gönder',
            cssClass: 'danger',
            handler: () => {
              Order.items.forEach(item => {
                this.orderService.addOrder(item);
              })
              this.orderService.sendOrders().then(isOK => {
                this.orderService.clearOrder();
                this.fillData();
              });
            }
          }
        ]
      });
      alert.present();
  }

  statusNote(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.WAITING:
        return "Onay Bekliyor";
      case OrderStatus.PREPARING:
        return "Hazırlanıyor";
      case OrderStatus.APPROVED:
        return "Onaylandı";
      case OrderStatus.CANCELED:
        return "İptal Edildi";
      case OrderStatus.PAYED:
        return "Ödeme Yapıldı";
      default:
        break;
    }
  }

  async callForCheck() {
    const alert = await this.alertController.create({
      mode: 'ios',
      header: 'Hesap mı? Hemen!',
      message: `Sadece Kendi hesabını mı ödemek istersin yoksa hepsini mi?`,
      buttons: [
        {
          text: 'Vazgeçtim',
          role: 'cancel',
          cssClass: 'secondary'
        },

        {
          text: 'Sadece Kendi Hesabımı',
          cssClass: 'danger',
          handler: () => {
            if (this.userTotal > 0) {
              this.presentToast('Hesap Hazırlanıyor...');
              const newReceipt: Receipt = {
                db_name: 'receipts',
                user: this.user,
                check: this.check,
                orders: this.userItems.filter(order => order.status == OrderStatus.APPROVED),
                total: this.userTotal,
                discount: 0,
                type: ReceiptType.USER,
                status: ReceiptStatus.REQUESTED,
                method: ReceiptMethod.UNDEFINED,
                timestamp: Date.now()
              }
              this.db.Database.post(newReceipt).then(receipt_res => {
                this.router.navigate(['wallet'], { queryParams: { receipt: receipt_res.id } });
              }).catch(err => {
                this.presentToast('Lütfen tekrar deneyiniz!');
              })
            } else {
              if (this.userItems.filter(order => order.status == OrderStatus.WAITING).length > 0) {
                this.presentToast('Siparişleriniz onaylanmasını bekleyin !');
              } else {
                this.presentToast('Size ait onaylanan sipariş bulunamadı !');
              }
            }
          }
        },

        {
          text: 'Patron Benim!',
          cssClass: 'danger',
          handler: () => {
            this.presentToast('Büyüksün Patron!')

            const newReceipt: Receipt = {
              db_name: 'receipts',
              user: this.user,
              check: this.check,
              orders: this.checkItems.filter(order => order.status == OrderStatus.APPROVED),
              total: this.checkTotal,
              discount: 0,
              type: ReceiptType.ALL,
              status: ReceiptStatus.REQUESTED,
              method: ReceiptMethod.UNDEFINED,
              timestamp: Date.now()
            }

            this.db.Database.post(newReceipt).then(receipt_res => {
              this.router.navigate(['wallet'], { queryParams: { receipt: receipt_res.id } });
            }).catch(err => {
              this.presentToast('Lütfen tekrar deneyiniz!');
            })
          }
        }
      ]
    });
    alert.present();
  }

  async presentToast(note: string) {
    const toast = await this.toastController.create({
      message: note,
      duration: 2000,
      mode: 'ios',
    });
    toast.present();
  }

  paymentNote(status: ReceiptMethod): string {
    switch (status) {
      case ReceiptMethod.CASH:
        return "Nakit";
      case ReceiptMethod.CARD:
        return "Kredi Kartı";
      case ReceiptMethod.COUPON:
        return "Yemek Kartı - Kupon";
      case ReceiptMethod.MOBILE:
        return "Mobil Ödeme";
      case ReceiptMethod.CRYPTO:
        return "Bitcoin";
      default:
        break;
    }
  }

  segmentChanged(event: any) {
    this.selectedSegment = event.detail.value;
  }

  fillData() {
    this.orderService.getOrders().then((orders_data: any) => {
      this.userItems = orders_data.user_orders;
      this.userTotal = orders_data.user_total;

      this.checkItems = orders_data.all_orders;
      this.checkTotal = orders_data.all_total;
      this.checkView = this.orderService.compactList(this.checkItems.filter(order => order.status == OrderStatus.APPROVED));

      this.payedView = this.orderService.compactList(this.checkItems.filter(order => order.status == OrderStatus.PAYED));
      this.payedTotal = this.payedView.map(obj => obj.price * obj.count).reduce((a, b) => a + b, 0);
      setTimeout(() => this.isLoaded = true, 1000);
    }).catch(err => {
      console.log(err);
      this.presentToast('Lütfen tekrar deneyiniz!');
    })

    this.db.Database.find({ selector: { db_name: 'receipts' } }).then((res: any) => {
      this.receipts = res.docs;
      this.receiptsView = this.receipts.filter(payment => payment.status == ReceiptStatus.APPROVED);
    })
  }

}
