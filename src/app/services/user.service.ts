import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from '../models/interfaces';


@Injectable({
  providedIn: 'root'
})
export class UserService {

  user: BehaviorSubject<User>;

  constructor() {

    let userId = localStorage.getItem('userId');
    let userName = localStorage.getItem('userName');
    let userSurname = localStorage.getItem('userSurname');
    let userPhone = localStorage.getItem('userPhone');
    let userAddress = localStorage.getItem('userAddress');

    this.user = new BehaviorSubject({ id: userId, name: userName, surname: userSurname, phone: userPhone, address: userAddress });
  }

  setUser(user: any) {
    localStorage.setItem('userId', user.id);
    localStorage.setItem('userName', user.name);
    localStorage.setItem('userSurname', user.surname);
    localStorage.setItem('userPhone', user.phone_number);
    localStorage.setItem('userAddress', user.address);
    this.user.next(user);
  }

  getUser() {
    return this.user.value;
  }


}
