import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonButton, IonList, IonNote, 
  IonItemOption, IonItemOptions, IonItemSliding, IonLabel } from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonButton, IonList, IonNote, 
    IonItemOption, IonItemOptions, IonItemSliding, IonLabel, CommonModule, FormsModule, RouterLink]
})
export class DashboardPage implements OnInit {
  
  //espacios disponibles
  public espacios:any = 0;
  //total de espacios parqueadero
  public total_espacios:any = 50;

  //Registro de Vehiculos en el parqueadero
  public vehiculos: any = {
        id:'',
        placaVehiculo:'',
        tipoVehiculo:'',
        fechaIngreso:'',
        horaIngreso:'',
        fechaSalida:'',
        horaSalida:''
      };

  constructor() { }

  ngOnInit() {
    //Cargo la lista de Vehiculos que han ingresado al parqueadero
    this.cargarListaDeVehiculos();
  }

  public cargarListaDeVehiculos(){
    this.vehiculos = [
      {
        id:'0',
        placaVehiculo:'ABC123',
        tipoVehiculo:'SUV',
        fechaIngreso:'02/06/2026',
        horaIngreso:'09:30am',
        fechaSalida:'00/00/0000',
        horaSalida:'00/00'
      },
      {
        id:'1',
        placaVehiculo:'DEF456',
        tipoVehiculo:'SPORT',
        fechaIngreso:'02/06/2026',
        horaIngreso:'10:27am',
        fechaSalida:'00/00/0000',
        horaSalida:'00/00'
      },
      {
        id:'2',
        placaVehiculo:'GHI789',
        tipoVehiculo:'MOTOCICLETA',
        fechaIngreso:'02/06/2026',
        horaIngreso:'10:29am',
        fechaSalida:'00/00/0000',
        horaSalida:'00/00'
      },
    ]
  }

  //Registro un ingreso de un vehiculo
  public registrarIngresoDeVehiculo(){

  }

  //Registro la Salida de un vehiculo
  public registrarSalidaDeVehiculo(){

  }

}
