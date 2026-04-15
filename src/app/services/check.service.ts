import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpService } from './http.service';
import { DatabaseService } from './database.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class CheckService {

  private check: BehaviorSubject<any>;

  private userItems: Array<any>;
  private checkItems: Array<any>;

  constructor(private httpService: HttpService, private db: DatabaseService, private userService: UserService) {
    this.check = new BehaviorSubject(null);
  }

  setCheck(check: any) {
    this.check.next(check);
  }

  getCheck() {
    return this.check.value;
  }

}
