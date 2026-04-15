import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-language',
  templateUrl: './language.component.html',
  styleUrls: ['./language.component.scss'],
})

export class LanguageComponent implements OnInit {

  langs: Array<any>;

  constructor(private translate: TranslateService, private popoverController: PopoverController) {

    this.langs = [
      { name: 'Türkçe', icon: '/assets/flags/tr.png', code: 'tr' },
      { name: 'English', icon: '/assets/flags/en.png', code: 'en' },
      { name: 'Francais', icon: '/assets/flags/fr.png', code: 'fr' },
      { name: 'Español', icon: '/assets/flags/es.png', code: 'es' },
      { name: 'Deutsche', icon: '/assets/flags/de.png', code: 'de' },
      { name: 'Pусский', icon: '/assets/flags/ru.png', code: 'ru' },
      { name: '日本人', icon: '/assets/flags/ja.png', code: 'ja' }
    ]

  }


  

  ngOnInit() { }


  changeLang(code: string) {
    this.translate.use(code);
    this.popoverController.dismiss();
  }

}
