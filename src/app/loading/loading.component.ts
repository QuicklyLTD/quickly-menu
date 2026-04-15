import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { DatabaseService } from '../services/database.service';
import { StoreService } from '../services/store.service';
import { CheckService } from '../services/check.service';
import { UserService } from '../services/user.service';
import { HttpService } from '../services/http.service';
import { OrderType } from '../models/interfaces';
import { OrderService } from '../services/order.service';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss'],
})
export class LoadingComponent implements OnInit {

  logo: number = 1;
  message: string;

  slug: string;
  token: string;

  isOrderOpen: boolean;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private db: DatabaseService,
    private userService: UserService,
    private httpService: HttpService,
    private checkService: CheckService,
    private storeService: StoreService,
    private orderService: OrderService,
    private translate: TranslateService,
    public toastController: ToastController,
    public alertController: AlertController
  ) {

    this.route.params.subscribe(res => { this.slug = res.slug; if (res.check_no) { this.token = res.check_no } });

    this.translate.get('GLOBAL.LOADING').subscribe((res: string) => {
      this.message = res;
    });

  }

  ngOnInit() {
    let loading = setInterval(() => {
      this.logo++
      if (this.logo == 11)
        this.logo = 1;
    }, 333)


    if (this.slug) {
      if (this.slug !== ('error' || 'check' || 'wallet' || 'store' || 'basket')) {
        // setTimeout(() => {
          this.storeService.setStore(this.slug).then(() => {
            if (this.token) {
              this.httpService.post('/menu/check/' + this.token).toPromise().then((res: any) => {
                this.orderService.setOrderType(res.type);
                clearTimeout(loading);
                switch (res.type) {
                  case OrderType.INSIDE:
                    this.orderService.setOrderType(OrderType.INSIDE);
                    this.checkService.setCheck(res.token);
                    this.db.setDatabase(res.token);
                    if (this.storeService.isOrderOpen() && this.checkService.getCheck()) {
                      this.isLoggedBefore();
                    } else {
                      this.router.navigate(['store'], { replaceUrl: true });
                    }
                    break;
                  case OrderType.OUTSIDE:
                    this.orderService.setOrderType(OrderType.OUTSIDE);
                    this.userService.setUser({ id: res.token, ...res.user });
                    this.router.navigate(['store'], { replaceUrl: true });
                    break;
                  case OrderType.TAKEAWAY:
                    break;
                  default:
                    break;
                }
              }).catch(err => {
                this.translate.get('GLOBAL.ERROR').subscribe((res: string) => {
                  this.message = res;
                });
                this.router.navigate(['store'], { replaceUrl: true });
              })
            } else {
              this.router.navigate(['store'], { replaceUrl: true });
            }
          }).catch(err => {
            this.translate.get('GLOBAL.ERROR').subscribe((res: string) => {
              this.message = res;
            });
          });
        // }, 1000)
      } else {
        this.translate.get('GLOBAL.ERROR').subscribe((res: string) => {
          this.message = res;
        });
      }
    } else {
      this.translate.get('GLOBAL.OOPS').subscribe((res: string) => {
        this.message = res;
      });
    }
  }

  isLoggedBefore() {
    const userID = this.userService.getUser().id;
    if (userID) {
      this.db.Database.get(userID).then(user => {
        if (this.token) {
          this.router.navigate(['store'], { replaceUrl: true });
        } else {
          this.router.navigate(['store'], { replaceUrl: true });
        }
      }).catch(err => {
        this.sendCheckRequest();
      });
    } else {
      this.sendCheckRequest();
    }
  }

  async presentToast(note: string) {
    const toast = await this.toastController.create({
      message: note,
      duration: 2000,
      mode: 'ios',
      position: 'top',
    });
    toast.present();
  }


  async sendCheckRequest() {
    let text: any;
    this.translate.get('LOADING').subscribe((res: string) => {
      text = res;
    });
    const alert = await this.alertController.create({
      header: text.WELCOME,
      message: text.ENTER_NAME,
      mode: 'ios',
      backdropDismiss: false,
      inputs: [
        {
          name: 'username',
          type: 'text',
          placeholder: text.INPUT_HOLDER,
        }
      ],
      buttons: [
        {
          text: text.OK,
          handler: async (value) => {
            this.translate.get('GLOBAL.PLEASE_WAIT').subscribe((res: string) => {
              this.message = res;
            });
            let user = value.username.trim();
            let is_exist = await this.db.Database.find({ selector: { name: value.username } });
            if (user && user !== '') {
              if (is_exist.docs.length == 0) {
                let newUser = await this.db.Database.post({ db_name: 'users', name: value.username });
                this.userService.setUser({ id: newUser.id, name: value.username, address: '', phone: null });
                if (this.token) {
                  this.router.navigate(['store'], { replaceUrl: true });
                } else {
                  this.router.navigate(['store'], { replaceUrl: true });
                }
              } else {
                this.presentToast('Aynı Masada Sadece Farklı İsimler Kullanılabilir!');
                this.sendCheckRequest();
              }
            } else {
              this.presentToast('İsim Boş Bırakılamaz!');
              this.sendCheckRequest();
            }
          }
        }
      ]
    });
    await alert.present();
  }

}
