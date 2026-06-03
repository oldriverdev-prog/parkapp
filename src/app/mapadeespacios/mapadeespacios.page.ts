import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonGrid, IonRow, IonCol, IonButton } from '@ionic/angular/standalone';

@Component({
  selector: 'app-mapadeespacios',
  templateUrl: './mapadeespacios.page.html',
  styleUrls: ['./mapadeespacios.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonGrid, IonRow, IonCol, IonButton, CommonModule, FormsModule]
})
export class MapadeespaciosPage implements OnInit {

  espacios = Array.from({ length: 20 }, (_, i) => ({
    numero: i + 1,
    estado: 'libre'
  }));
  
  constructor() { }

  ngOnInit() {
  }

  toggleEspacio(espacio: any) {
    espacio.ocupado = !espacio.ocupado;
  }

  cambiarEstado(espacio: any) {

    switch (espacio.estado) {
      case 'libre':
        espacio.estado = 'ocupado';
        break;

      case 'ocupado':
        espacio.estado = 'reservado';
        break;

      default:
        espacio.estado = 'libre';
    }
  }

}
