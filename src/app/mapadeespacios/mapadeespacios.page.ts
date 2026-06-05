import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonGrid, IonRow, IonCol, IonButton,
  AlertController
} from '@ionic/angular/standalone';
import { ParqueoService } from '../services/parqueo.service';
import { RegistroParqueo, TipoVehiculo } from '../models/registro.model';

interface EspacioVista {
  numero: number;
  ocupado: boolean;
  placa?: string;
  tipoVehiculo?: TipoVehiculo;
  registro?: RegistroParqueo;
}

@Component({
  selector: 'app-mapadeespacios',
  templateUrl: './mapadeespacios.page.html',
  styleUrls: ['./mapadeespacios.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonGrid, IonRow, IonCol, IonButton,
    CommonModule, FormsModule
  ]
})
export class MapadeespaciosPage {

  totalEspacios = 30;
  espacios: EspacioVista[] = [];
  filtro: 'Todos' | 'Carro' | 'Moto' | 'Bicicleta' = 'Todos';

  constructor(
    private parqueoService: ParqueoService,
    private alertCtrl: AlertController,
    private cdr: ChangeDetectorRef
  ) { }

  async ionViewWillEnter() {
    await this.cargarMapa();
  }

  async cargarMapa() {
    const activos = await this.parqueoService.getActivos();
    this.espacios = [];
    for (let i = 1; i <= this.totalEspacios; i++) {
      const reg = activos.find(r => r.espacio === i);
      this.espacios.push({
        numero: i,
        ocupado: !!reg,
        placa: reg?.placa,
        tipoVehiculo: reg?.tipoVehiculo,
        registro: reg,
      });
    }
    this.cdr.detectChanges();
  }

  setFiltro(f: 'Todos' | 'Carro' | 'Moto' | 'Bicicleta') {
    this.filtro = f;
  }

  // si el espacio debe verse como ocupado según el filtro activo
  mostrarOcupado(e: EspacioVista): boolean {
    if (!e.ocupado) {
      return false;
    }
    if (this.filtro === 'Todos') {
      return true;
    }
    return e.tipoVehiculo === this.filtro;
  }

  get libresCount(): number {
    return this.espacios.filter(e => !e.ocupado).length;
  }

  async verEspacio(e: EspacioVista) {
    if (!e.ocupado || !e.registro) {
      return;
    }
    const reg = e.registro;
    const cobro = this.parqueoService.calcularTotal(reg);
    const alert = await this.alertCtrl.create({
      header: `Espacio ${e.numero}`,
      message: `Placa ${reg.placa} · ${reg.tipoVehiculo}. Cobro actual: $${cobro.toLocaleString('es-CO')}`,
      buttons: ['Cerrar'],
    });
    await alert.present();
  }
}
