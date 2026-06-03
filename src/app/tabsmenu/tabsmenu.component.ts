import { Component, OnInit } from '@angular/core';
import { IonIcon, IonTab, IonTabBar, IonTabButton, IonTabs, } from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { home, map, personCircle } from 'ionicons/icons';

@Component({
  selector: 'app-tabsmenu',
  templateUrl: './tabsmenu.component.html',
  styleUrls: ['./tabsmenu.component.scss'],
  standalone: true,
  imports:[IonIcon, IonTab, IonTabBar, IonTabButton, IonTabs]
})
export class TabsmenuComponent  implements OnInit {

  constructor() { 
    addIcons({ home, map, personCircle });
  }

  ngOnInit() {}

}
