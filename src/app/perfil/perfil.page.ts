import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCol, IonGrid, IonRow, IonButton  } from '@ionic/angular/standalone';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonCol, IonGrid, IonRow, IonButton ]
})
export class PerfilPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  datos = Array.from({ length: 5 }, (_, i) => {
    const valor = Math.floor(Math.random() * (250000 - 10000 + 1)) + 10000;

    return {
      dia: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'][i],
      valor,
      porcentaje: (valor / 250000) * 100
    };
  });

}
