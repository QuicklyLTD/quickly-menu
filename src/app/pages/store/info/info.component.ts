import { Component, OnInit, Input } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';

@Component({
  selector: 'store-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.scss'],
})
export class InfoComponent implements OnInit {

  @Input('store') store: any;
  @Input('menu') menu: any;
  week: Array<string> = ['Pzt', 'Sa', 'Ça', 'Pe', 'Cu', 'Cmt', 'Pa'];

  days: any;

  constructor(private alertController: AlertController, public toastController: ToastController) {


  }

  ngOnInit() {
    this.days = this.store.settings.accesibilty.days;
  }

  async showWifi() {
    const alert = await this.alertController.create({
      mode: 'ios',
      header: 'WiFi bilgileri',
      message: `Wifi Adı: ${this.store.settings.accesibilty.wifi.ssid} <br> WiFi Şifresi: ${this.store.settings.accesibilty.wifi.password} `,
      buttons: ['Tamam']
    });

    alert.present().then(() => {
      // this.modalController.dismiss();
    });

  }

  async callWaiter() {
    const alert = await this.alertController.create({
      header: 'Garson Çağır',
      mode: 'ios',
      inputs: [
        {
          name: 'Mesajınız',
          type: 'text',
          placeholder: 'Mesajınızı yazabilirsiniz.'
        }
      ],
      buttons: [
        {
          text: 'İptal',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        },
        {
          text: 'Gönder',
          handler: () => {
            console.log('Confirm Ok');
          }
        }
      ]
    });
    await alert.present();
  }

  async presentToast(note: string) {
    const toast = await this.toastController.create({
      message: note,
      duration: 2000,
      mode: 'ios',
      // position: 'top',
    });
    toast.present();
  }

  openInMaps() {
    if
      ((navigator.platform.indexOf("iPhone") != -1) ||
      (navigator.platform.indexOf("iPad") != -1) ||
      (navigator.platform.indexOf("iPod") != -1))
      window.open(`maps://maps.google.com/maps?daddr=${this.store.address.cordinates.latitude},${this.store.address.cordinates.longitude}&amp;ll=`);
    else
      window.open(`https://maps.google.com/maps?daddr=${this.store.address.cordinates.latitude},${this.store.address.cordinates.longitude}&amp;ll=`);
  }

}
