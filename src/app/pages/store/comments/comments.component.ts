import { Component, OnInit, NgZone } from '@angular/core';
import { HttpService } from 'src/app/services/http.service';
import { StoreService } from 'src/app/services/store.service';
import { UserService } from 'src/app/services/user.service';
import { AlertController, ToastController } from '@ionic/angular';

@Component({
  selector: 'store-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss'],
})
export class CommentsComponent implements OnInit {

  public comment: any;
  public isCommentSended: boolean = false;
  public captchaPassed: boolean = false;
  private captchaResponse: string;

  constructor(private zone: NgZone, private httpService: HttpService, private storeService: StoreService, private userService: UserService, private alertController: AlertController) {
    this.comment = { name: (this.userService.getUser().name || ''), phone: null, title: null, description: null };
  }

  ngOnInit() { }


  captchaResolved(response: string): void {
    this.zone.run(() => {
      this.captchaPassed = true;
      this.captchaResponse = response;
    });
  }

  sendForm(): void {
    let data = { captchaResponse: this.captchaResponse, store_id: this.storeService.getStore()._id, comment: this.comment };
    this.httpService.post('/menu/comment/new', data).toPromise().then((res: any) => {
      this.alertController.create({
        mode: 'ios',
        header: 'Tebrikler!',
        message: res.message,
        buttons: ['Tamam']
      }).then(alert => {
        alert.present();
      })
      this.isCommentSended = true;
    }).catch(err => {
      this.alertController.create({
        mode: 'ios',
        header: 'Hata!',
        message: 'Yorum İletilemedi..',
        buttons: ['Tamam']
      }).then(alert => {
        alert.present();
      })
      this.isCommentSended = false;
    })

  }

}
