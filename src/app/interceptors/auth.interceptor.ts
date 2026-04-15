import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StoreService } from '../services/store.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(private storeService: StoreService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        try {
            const StoreID = this.storeService.getMenu().store_id;
            if (StoreID) {
                request = request.clone({
                    setHeaders: {
                        Store: StoreID
                    }
                });
            }
        } catch (error) {

        }
        return next.handle(request);
    }
}