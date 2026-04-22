import { environment } from '../environments/environment';

import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { HttpClientModule, HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

///// Components
import { AppComponent } from './app.component';
import { WalletComponent } from './pages/wallet/wallet.component';
// import { ProfileComponent } from './pages/profile/profile.component';
import { LoadingComponent } from './loading/loading.component';
import { StoreComponent } from './pages/store/store.component';
import { MenuComponent } from './pages/store/menu/menu.component';
// import { CategoryComponent } from './pages/store/category/category.component';
import { InfoComponent } from './pages/store/info/info.component';
import { CommentsComponent } from './pages/store/comments/comments.component';
import { ProductModalComponent } from './pages/store/product-modal/product-modal.component';
import { OrderModalComponent } from './pages/store/order-modal/order-modal.component';
import { CheckComponent } from './pages/check/check.component';
import { BasketComponent } from './pages/basket/basket.component';

//// 3rd Party Modules
import { ServiceWorkerModule } from '@angular/service-worker';
import { RecaptchaModule } from 'ng-recaptcha';
import { StarRatingModule } from 'ionic5-star-rating';
import { NgxMaskModule } from 'ngx-mask';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
// import { WebBluetoothModule } from '@manekinekko/angular-web-bluetooth';
// import { AgmCoreModule } from '@agm/core';

/// Pipes
import { CurrencyPipe } from './pipes/currency.pipe';
import { PricePipe } from './pipes/price.pipe';
import { LanguageComponent } from './language/language.component';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { TimeAgoPipe } from './pipes/timeago.pipe';
import { ReservationComponent } from './pages/store/reservation/reservation.component';

// import { CalendarModule } from 'ion2-calendar';

export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient);
}
// export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
//   return new TranslateHttpLoader(http, './assets/i18n/', '.json');
// }

@NgModule({
  declarations: [
    AppComponent,
    LoadingComponent,
    WalletComponent,
    BasketComponent,
    // ProfileComponent,
    CheckComponent,
    StoreComponent,
    MenuComponent,
    ProductModalComponent,
    OrderModalComponent,
    InfoComponent,
    // CategoryComponent,
    ReservationComponent,
    CommentsComponent,
    LanguageComponent,
    CurrencyPipe,
    PricePipe,
    TimeAgoPipe
  ],
  entryComponents: [ProductModalComponent, OrderModalComponent, LanguageComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicModule.forRoot(), // { mode: 'md' }
    FormsModule,
    AppRoutingModule,
    StarRatingModule,
    // CalendarModule,
    // AgmCoreModule.forRoot({
    //   apiKey: 'AIzaSyC179lrS0-Evp3HKuAUUppBRn0B2qJsrK4'
    // }),
    // WebBluetoothModule.forRoot({
    //   enableTracing: true // or false, this will enable logs in the browser's console
    // }),
    NgxMaskModule.forRoot(),
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    RecaptchaModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent]
})
export class AppModule { }
