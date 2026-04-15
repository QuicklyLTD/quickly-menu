import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController, AlertController, ToastController, Platform } from '@ionic/angular';
import { Menu, MenuItem, Order, OrderItem, OrderStatus, Receipt, ReceiptMethod, ReceiptStatus, ReceiptType, User } from 'src/app/models/interfaces';
import { DatabaseService } from 'src/app/services/database.service';
import { OrderService } from 'src/app/services/order.service';
import { StoreService } from 'src/app/services/store.service';
import { UserService } from 'src/app/services/user.service';
import { ProductModalComponent } from '../store/product-modal/product-modal.component';

@Component({
  selector: 'app-basket',
  templateUrl: './basket.component.html',
  styleUrls: ['./basket.component.scss'],
})
export class BasketComponent implements OnInit {

  user: User;
  menu: Menu;
  orderNote: string = '';
  orderList: Array<OrderItem> = [];
  checkItems: Array<Order> = [];
  selectedSegment: string = 'basket';

  currentTime: string;
  availableHours: Array<number>;

  constructor(
    private db: DatabaseService,
    private router: Router,
    private userService: UserService,
    private orderService: OrderService,
    private storeService: StoreService,
    private modalController: ModalController,
    private alertController: AlertController,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.user = this.userService.getUser();
    this.menu = this.storeService.getMenu();
    this.orderList = this.orderService.getOrder();
    if(this.orderList){
      this.router.navigate(['error']);
    }
  }

  segmentChanged(event: any) {
    this.selectedSegment = event.detail.value;
  }

  ionViewWillEnter() {
    this.user = this.userService.getUser();
    this.orderList = this.orderService.getOrder();
    this.pastOrders();

    this.currentTime = new Date().toISOString();
    this.availableHours = [];
    for (let i = new Date().getHours(); i < 24; i++) {
      this.availableHours.push(i);
    }
  }

  getTotal(): number {
    return this.orderList.reduce((sum, { price }) => sum + price, 0);
  }

  orderTotal(order: Order): number {
    return order.items.reduce((sum, { price }) => sum + price, 0);
  }

  dismiss() {
    this.modalController.dismiss();
  }

  async removeOrderItem(index: number) {
    const alert = await this.alertController.create({
      mode: 'ios',
      header: 'Dikkat!',
      message: `<b>${this.orderList[index].name}</b> <br> adlı ürün sepetten çıkartılacak!`,
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

  async addOrder(item: MenuItem) {
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


  async removeOrder(order: any) {
    const alert = await this.alertController.create({
      mode: 'ios',
      header: 'Dikkat!',
      message: `Seçtiğiniz sipariş silinecek.`,
      buttons: [
        {
          text: 'İptal',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Sil',
          cssClass: 'danger',
          handler: () => {
            this.db.Basket.remove(order).then(res => {
              this.presentToast('Sipariş Silindi!');
              this.pastOrders();
            }).catch(err => {
              this.presentToast('Lütfen Tekrar Deneyin');
            })
          }
        }
      ]
    });
    alert.present();
  }

  async repeatOrder(Order: Order) {
    if (this.orderList.length == 0) {
      Order.items.forEach(item => {
        this.orderService.addOrder(item);
      })
      this.selectedSegment = 'basket';
    } else {
      const alert = await this.alertController.create({
        mode: 'ios',
        header: 'Dikkat !',
        message: `<b>Sepenizde Ürünler Mevcut</b> <br> Ne yapmak istersiniz ?`,
        buttons: [
          {
            text: 'İptal',
            role: 'cancel',
            cssClass: 'secondary'
          },
          {
            text: 'Önceki Listeyi Boşalt',
            cssClass: 'danger',
            handler: () => {
              this.orderService.clearOrder();
              Order.items.forEach(item => {
                this.orderService.addOrder(item);
              })
              this.orderList = this.orderService.getOrder();
              this.selectedSegment = 'basket';
            }
          },
          {
            text: 'Üzerine Ekle',
            cssClass: 'danger',
            handler: () => {
              Order.items.forEach(item => {
                this.orderService.addOrder(item);
              })
              this.selectedSegment = 'basket';
            }
          }
        ]
      });
      alert.present();
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

  checkOut() {
    this.orderService.sendOrders().then(res => {
      this.db.Basket.get(res.id).then((order: any) => {
        this.callForCheck(order);
      }).catch(err => {
        console.log(err);
      })
    }).catch(err => {
      this.presentToast('Lütfen Tekrar Deneyin');
    })
  }

  async callForCheck(order: Order) {
    const alert = await this.alertController.create({
      mode: 'ios',
      header: 'Onaylıyor musunuz?',
      message: `Sepenizi son kez kontrol edin!`,
      buttons: [
        {
          text: 'İptal',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Onaylıyorum',
          cssClass: 'danger',

          handler: () => {
            this.presentToast('Hesap Hazırlanıyor...');

            const newReceipt: Receipt = {
              db_name: 'receipts',
              user: this.user,
              check: this.user.id,
              orders: [order],
              total: this.getTotal(),
              discount: 0,
              type: ReceiptType.USER,
              status: ReceiptStatus.REQUESTED,
              method: ReceiptMethod.MOBILE,
              timestamp: Date.now(),
              note: this.orderNote
            }

            this.db.Basket.post(newReceipt).then(receipt_res => {
              this.orderService.clearOrder();
              this.router.navigate(['wallet'], { queryParams: { receipt: receipt_res.id } });
            }).catch(err => {
              this.presentToast('Lütfen tekrar deneyiniz!');
            })

          }
        },
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
        return "Yolda";
      case OrderStatus.CANCELED:
        return "İptal Edildi";
      case OrderStatus.PAYED:
        return "Ödeme Yapıldı";
      default:
        break;
    }
  }

  pastOrders() {
    this.orderService.getOrders().then((orders_data: any) => {
      // this.userItems = orders_data.user_orders;
      // this.userTotal = orders_data.user_total;

      this.checkItems = orders_data.all_orders;
      // this.checkTotal = orders_data.all_total;
      // this.checkView = this.orderService.compactList(this.checkItems.filter(order => order.status == OrderStatus.APPROVED));

      // this.payedView = this.orderService.compactList(this.checkItems.filter(order => order.status == OrderStatus.PAYED));
      // this.payedTotal = this.payedView.map(obj => obj.price * obj.count).reduce((a, b) => a + b, 0);
      // setTimeout(() => this.isLoaded = true, 1000);
    }).catch(err => {
      this.checkItems = [];
      // console.log(err);
      this.presentToast('Lütfen tekrar deneyiniz!');
    })
  }

}
