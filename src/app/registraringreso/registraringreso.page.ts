import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton, 
  IonList, IonItem, IonInput, IonButton, IonDatetime, IonSelect, IonSelectOption, IonTextarea } from '@ionic/angular/standalone';

@Component({
  selector: 'app-registraringreso',
  templateUrl: './registraringreso.page.html',
  styleUrls: ['./registraringreso.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButtons, IonBackButton, 
    IonList, IonItem, IonInput, IonButton, IonDatetime, IonSelect, IonSelectOption, IonTextarea]
})
export class RegistraringresoPage implements OnInit {

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



 

  


