import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonSearchbar, IonButton, IonCard, IonCardContent, IonBackButton, IonButtons, IonCol, IonGrid, IonRow,
  IonCardHeader, IonCardSubtitle, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-registrarsalida',
  templateUrl: './registrarsalida.page.html',
  styleUrls: ['./registrarsalida.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonSearchbar, IonButton, IonCard, IonBackButton, IonButtons, IonCol, IonGrid, IonRow,
    IonCardHeader, IonCardContent, IonCardSubtitle, CommonModule, FormsModule]
})
export class RegistrarsalidaPage implements OnInit {

  placa_vehiculo:any = 'ABC123';
  tipo_vehiculo:any = 'Carro';
  hora_ingreso:any = '08:00AM';
  hora_salida:any = '10:00AM';
  tarifa:any = '3500';
  total_cobro:any = '7500';

  constructor() { }

  ngOnInit() {
  }

}
