import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { StoreComponent } from './pages/store/store.component';
import { LoadingComponent } from './loading/loading.component';
import { CheckComponent } from './pages/check/check.component';
import { WalletComponent } from './pages/wallet/wallet.component';
import { BasketComponent } from './pages/basket/basket.component';
// import { ProfileComponent } from './pages/profile/profile.component';
// import { MapComponent } from './pages/map/map.component';
// import { SearchComponent } from './pages/search/search.component';
// import { BasketComponent } from './pages/basket/basket.component';

const routes: Routes = [
  {
    path: 'wallet', component: WalletComponent
  },
  {
    path: 'check', component: CheckComponent
  },
  {
    path: 'basket', component: BasketComponent
  },
  {
    path: 'store', component: StoreComponent
  },
  {
    path: ':slug', component: LoadingComponent
  },
  {
    path: ':slug/:check_no', component: LoadingComponent
  },
  {
    path: '**', component: LoadingComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})

export class AppRoutingModule { }
