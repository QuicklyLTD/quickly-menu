import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DatabaseService } from 'src/app/services/database.service';
import { Receipt, Order, ReceiptStatus, ReceiptType, ReceiptMethod, OrderStatus, OrderType } from 'src/app/models/interfaces';
import { OrderService } from 'src/app/services/order.service';
import { ToastController, AlertController } from '@ionic/angular';
import { NgForm } from '@angular/forms';
import { HttpService } from 'src/app/services/http.service';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss'],
})
export class WalletComponent implements OnInit {
  receipt: Receipt;
  ordersWillPay: Array<any>;

  isLoading: boolean;
  errorReason: string;
  isContractReaded: boolean;

  cardNumber: string;

  messages = { validDate: 'SK\nTA', monthYear: 'AY/YIL' };
  placeholders = { number: '•••• •••• •••• ••••', expiry: '••/••', cvc: '•••' };
  timeout: number = 120000;

  private changeListener: any;
  timeoutInterval: NodeJS.Timer;
  countDown: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private db: DatabaseService,
    private httpService: HttpService,
    private orderService: OrderService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    this.isLoading = true;
    this.isContractReaded = false;
  }

  ngOnInit() {
    this.route.queryParams.subscribe((querys: any) => {
      if (querys.hasOwnProperty('receipt')) {
        if (this.db.Database) {
          this.db.Database.get(querys.receipt).then((res: any) => {
            this.receipt = res;
            this.ordersWillPay = this.orderService.compactList(this.receipt.orders);
            setTimeout(() => this.isLoading = false, 1000)
          }).catch(err => {
            this.router.navigate(['error']);
          })
        } else {
          this.db.Basket.get(querys.receipt).then((res: any) => {
            this.receipt = res;
            this.ordersWillPay = this.orderService.compactList(this.receipt.orders);

            this.receipt.status = ReceiptStatus.READY;
            this.receipt.method = ReceiptMethod.MOBILE;

            setTimeout(() => this.isLoading = false, 1000)
          }).catch(err => {
            this.router.navigate(['error']);
          })
        }
      } else {
        this.router.navigate(['error']);
      }
    })
  }

  ngOnDestroy() {
    if (this.changeListener) {
      this.changeListener.cancel();
    }
  }

  async callForCheck() {
    const alert = await this.alertController.create({
      mode: 'ios',
      header: 'Ödeme Yöntemi',
      message: `Ödemeyi Nasıl Yapmak İstersiniz ?`,
      cssClass: 'font-bold',
      inputs: [
        {
          name: 'method',
          type: 'radio',
          label: 'Mobil Ödeme',
          value: 4,
          checked: true
        },
        {
          name: 'method',
          type: 'radio',
          label: 'Nakit',
          value: 1,
        },
        {
          name: 'method',
          type: 'radio',
          label: 'Kart',
          value: 2,
        },
        {
          name: 'method',
          type: 'radio',
          label: 'Kupon - Yemek Kartı',
          value: 3,
        },
      ],
      buttons: [
        {
          text: 'İptal',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Tamam',
          handler: (value) => {
            this.receipt.method = value;
            this.receipt.status = ReceiptStatus.WAITING;
            this.db.Database.put(this.receipt).then(res => {
              this.receipt._rev = res.rev;
              this.approveListen();
            }).catch(err => {
              console.log(err)
            })
          }
        }
      ]
    });

    await alert.present();
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
        return "PAYMENT.MOBILE";
      case ReceiptMethod.CRYPTO:
        return "Bitcoin";
      default:
        break;
    }
  }

  // onBlur(event): any {
  //   console.log('Blurred ', event.target.name);
  // }
  // onInput(event): any {
  //   console.log('Input ', event.target.name, event.target.value);
  // }
  // onKeyDown(event): any {
  //   console.log('Input ', event.target.name, event.target.value);
  // }
  // onFocus(event): any {
  //   console.log('Input ', event.target.name, event.target.value);
  // }


  countDownTimer(){
    this.countDown = '';
    let countDownDate = Date.now() + this.timeout;
    this.timeoutInterval = setInterval(() => {
      // Find the distance between now and the count down date

      let now = new Date().getTime();
      let distance = countDownDate - now;

      // Time calculations for days, hours, minutes and seconds
      // var days = Math.floor(distance / (1000 * 60 * 60 * 24));
      // let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      let seconds = Math.floor((distance % (1000 * 60)) / 1000);

      // Display the result in the element with id="demo"
      this.countDown = minutes + "dk " + seconds + 's';

      // If the count down is finished, write some text
      if (distance < 0) {
        clearInterval(this.timeoutInterval);
        this.countDown = 'Süre Doldu';
      }
    }, 1000);
  }

  approveListen() {
    if(this.timeoutInterval){
      clearInterval(this.timeoutInterval);
      this.countDownTimer();
    }else{
      this.countDownTimer();
    }
    this.changeListener = this.db.Database.changes({ live: true, since: 'now', doc_ids: [this.receipt._id], include_docs: true, timeout:120000 }).on('change', (res: any) => {
      this.isLoading = true
      this.receipt = res.doc;
      if (this.receipt.status == ReceiptStatus.CANCELED) {
        this.errorReason = 'İşlem Personel tarafından reddedildi.'
        this.changeListener.cancel();
        clearInterval(this.timeoutInterval);
        this.countDown = '';
      }
      setTimeout(() => {
        this.changeListener.cancel();
        this.isLoading = false;
        if (this.receipt.status !== ReceiptStatus.APPROVED) {
          this.approveListen();
        }else{
          this.changeListener.cancel();
          clearInterval(this.timeoutInterval);
          this.countDown = 'Başarılı!';
        }
      }, 1000);
    }).on('error', (err: any) => {
      this.receipt.status = ReceiptStatus.CANCELED;
      this.db.Database.put(this.receipt).then(res => {
        this.errorReason = 'Süre Sınırı Aşıldı';
      }).catch(err => {
        console.log(err)
      })
    })
  }

  sendForm(form: NgForm) {
    this.isLoading = true;
    this.httpService.post('/menu/payment/' + this.receipt.check, { receipt: this.receipt, card: form.value }).toPromise().then((res: any) => {
      this.receipt = res.receipt;
      if (this.receipt.orders[0].type == OrderType.OUTSIDE) {
        this.db.Basket.put(this.receipt).then(res => {
          this.db.Basket.put(this.receipt.orders[0]).then(res => {
          }).catch(err => {
            console.log(err)
          })
        }).catch(err => {
          console.log(err)
        })
      }
      setTimeout(() => this.isLoading = false, 1000);
    }).catch(err => {
      this.errorReason = err.error.message;
      this.receipt.status = ReceiptStatus.CANCELED;

      clearInterval(this.timeoutInterval);
      this.countDown = '';
      
      if (this.receipt.orders[0].type == OrderType.OUTSIDE) {
        this.db.Basket.put(this.receipt).then(res => {
          this.receipt.orders[0].status = OrderStatus.CANCELED;
          this.db.Basket.put(this.receipt.orders[0]).then(res => {
          }).catch(err => {
            console.log(err)
          })
        }).catch(err => {
          console.log(err)
        })
      }
      setTimeout(() => this.isLoading = false, 1000);
    })
  }

  validateForm(form: NgForm) {
    const card = form.value.card;
    const name = form.value.name;
    const expiry = form.value.expiry;
  }

  endPayment() {
    this.router.navigate(['store'], { replaceUrl: true })
  }

}
