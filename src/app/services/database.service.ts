import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpService } from './http.service';
import { ToastController } from '@ionic/angular';
import { UserService } from './user.service';
import { OrderStatus, ReceiptStatus } from '../models/interfaces';

PouchDB.plugin(PouchDBFind)

@Injectable({
  providedIn: 'root'
})

export class DatabaseService {

  public Database: PouchDB.Database;
  public Basket: PouchDB.Database;

  private DatabasePath: BehaviorSubject<string> = new BehaviorSubject(null);
  private Changes: PouchDB.Core.Changes<any>;

  constructor(private httpService: HttpService, private userService: UserService, private toastController: ToastController) {
    this.Basket = new PouchDB('basket', { adapter: 'idb' });
    this.DatabasePath.subscribe(res => {
      if (res !== null) {
        this.Database = new PouchDB(this.httpService.hostname + '/order/' + res, { name: res, adapter: 'http', skip_setup: false });
        if (this.Changes) {
          this.Changes.cancel();
        }
        this.Changes = this.Database.changes({ since: 'now', live: true, include_docs: true });
        this.Changes.on('change', async (res) => {
          // console.log(res);


          // let toast;
          // if (res.doc.db_name !== 'users') {
          //   if (res.doc.user.id !== this.userService.getUser().id) {
          //     switch (res.doc.db_name) {
          //       case 'orders':
          //         if (res.doc.status == OrderStatus.WAITING) {
          //           toast = await this.toastController.create(
          //             {
          //               message: `Yeni Sipariş Oluşturdu..`,
          //               duration: 2000,
          //               mode: 'ios',
          //               color: 'success',
          //               header: res.doc.user.name
          //             }
          //           )
          //         }
          //         break;
          //       case 'receipt':
          //         if (res.doc.status == ReceiptStatus.REQUESTED) {
          //           toast = await this.toastController.create(
          //             {
          //               message: `Hesap İstedi..`,
          //               duration: 2000,
          //               mode: 'ios',
          //               color: 'warning',
          //               header: res.doc.user.name
          //             }
          //           )
          //         }
          //         break;
          //       default:
          //         break;
          //     }
          //     await toast.present();
          //   }
          // } else {
          //   if (res.doc._id !== this.userService.getUser().id) {
          //     toast = await this.toastController.create(
          //       {
          //         message: 'Masaya Oturdu',
          //         duration: 2000,
          //         mode: 'ios',
          //         color: 'primary',
          //         header: res.doc.name
          //       })
          //     await toast.present();
          //   }
          // }
        });
      }
    })
  }

  setDatabase(database: string) {
    this.DatabasePath.next(database);
  }

}
