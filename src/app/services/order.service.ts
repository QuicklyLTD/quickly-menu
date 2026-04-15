import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { OrderItem, MenuItem, Order, OrderStatus, OrderType } from '../models/interfaces';
import { DatabaseService } from './database.service';
import { UserService } from './user.service';
import { CheckService } from './check.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  public order: Array<OrderItem> = [];
  public orderItemCount: BehaviorSubject<number> = new BehaviorSubject(0);

  private orderType: BehaviorSubject<OrderType> = new BehaviorSubject(OrderType.INSIDE);

  constructor(private db: DatabaseService, private userService: UserService, private checkService: CheckService) { }

  setOrderType(type: OrderType) {
    this.orderType.next(type)
  }

  getOrderType(): BehaviorSubject<OrderType> {
    return this.orderType;
  }

  getOrder(): Array<OrderItem> {
    return this.order;
  }

  getOrderItemCount(): BehaviorSubject<number> {
    return this.orderItemCount;
  }

  addProduct(menuItem: MenuItem, order_price: number, order_count: number, order_note: string, item_type?: string) {
    let newOrderItem: OrderItem = { product_id: menuItem.product_id, name: menuItem.name, price: order_price, note: order_note, type: (item_type || null) };
    for (let i = 0; i < order_count; i++) {
      this.order.push(newOrderItem)
      this.orderItemCount.next(this.orderItemCount.value + 1);
    }
  }

  addOrder(orderItem:OrderItem){
    this.order.push(orderItem)
    this.orderItemCount.next(this.orderItemCount.value + 1);
  }

  removeProduct(index) {
    this.order.splice(index, 1);
    this.orderItemCount.next(this.orderItemCount.value - 1);
  }

  decreaseProduct(index: number) {
    this.order.splice(index, 1);
    this.orderItemCount.next(this.orderItemCount.value - 1);
  }

  clearOrder() {
    this.order = [];
    this.orderItemCount.next(0);
  }

  sendOne(menuItem: MenuItem, order_price: number, order_count: number, order_note: string, item_type?: string) {
    let newOrderItem: OrderItem = { product_id: menuItem.product_id, name: menuItem.name, price: order_price, note: order_note, type: (item_type || null) };
    let newOrder: Order = { db_name: 'orders', check: this.checkService.getCheck(), user: this.userService.getUser(), items: [], status: OrderStatus.WAITING, type: this.orderType.value, timestamp: Date.now() }
    for (let index = 0; index < order_count; index++) { newOrder.items.push(newOrderItem) };
    return this.db.Database.post(newOrder);
  }

  sendOrders() {
    if (this.orderType.value == OrderType.INSIDE) {
      let newOrder: Order = { db_name: 'orders', check: this.checkService.getCheck(), user: this.userService.getUser(), items: this.order, status: OrderStatus.WAITING, type: this.orderType.value, timestamp: Date.now() }
      return this.db.Database.post(newOrder);
    } else {
      let newOrder: Order = { db_name: 'orders', check: this.userService.getUser().id, user: this.userService.getUser(), items: this.order, status: OrderStatus.WAITING, type: this.orderType.value, timestamp: Date.now() }
      return this.db.Basket.post(newOrder);
    }
  }

  getOrders() {
    const db: PouchDB.Database = (this.orderType.value == OrderType.INSIDE) ? this.db.Database : this.db.Basket;
    return db.find({ selector: { db_name: 'orders' } }).then((orders: any) => {
      let Orders = orders.docs;
      if (this.orderType.value == OrderType.INSIDE) {
        Orders.sort((a, b) => b.timestamp - a.timestamp);
        return { all_orders: Orders, user_orders: Orders.filter(order => order.user.id == this.userService.getUser().id), all_total: this.getTotal(Orders), user_total: this.userTotal(Orders.filter(order => order.user.id == this.userService.getUser().id)) };
      } else {
        Orders.sort((a, b) => b.timestamp - a.timestamp)
        return { all_orders: Orders, all_total: this.getTotal(Orders) };
      }
    }).catch(err => {
      console.log(err);
    })
  }

  userTotal(Orders: Array<Order>) {
    let i = 0;
    Orders.filter(order => order.status == OrderStatus.APPROVED).forEach(order => {
      i += order.items.reduce((sum, { price }) => sum + price, 0);
    });
    return i;
  }

  getTotal(Orders: Array<Order>) {
    let i = 0;
    Orders.filter(order => order.status == OrderStatus.APPROVED).forEach(order => {
      i += order.items.reduce((sum, { price }) => sum + price, 0);
    });
    return i;
  }

  compactList(Orders: Array<Order>) {
    let orderList = [];
    Orders.forEach(order => {
      order.items.forEach(product => {
        let contains = orderList.some(obj => obj.name == product.name && obj.type == product.type);
        if (contains) {
          let index = orderList.findIndex(obj => obj.name == product.name);
          orderList[index].count++;
        } else {
          let countObj = { product_id: product.product_id, name: product.name, count: 1, price: product.price, note: product.note, type: product.type };
          orderList.push(countObj);
        }
      })
    });
    return orderList.sort((a, b) => b.count - a.count);
  }

}