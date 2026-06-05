import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
  IonList, IonItem, IonInput, IonButton, IonSelect, IonSelectOption, IonNote,
  ToastController
} from '@ionic/angular/standalone';
import { ParqueoService } from '../services/parqueo.service';
import { TipoVehiculo, Tarifas } from '../models/registro.model';

@Component({
  selector: 'app-registraringreso',
  templateUrl: './registraringreso.page.html',
  styleUrls: ['./registraringreso.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
    IonList, IonItem, IonInput, IonButton, IonSelect, IonSelectOption, IonNote,
    CommonModule, FormsModule
  ]
})
export class RegistraringresoPage {

  totalEspacios = 30;

  placa = '';
  tipoVehiculo: TipoVehiculo = 'Carro';
  espacio: number | null = null;

  tarifas: Tarifas = { Carro: 3000, Moto: 1500, Bicicleta: 800 };
  espaciosLibres: number[] = [];

  constructor(
    private parqueoService: ParqueoService,
    private toastCtrl: ToastController,
    private cdr: ChangeDetectorRef
  ) { }

  async ionViewWillEnter() {
    this.tarifas = await this.parqueoService.getTarifas();
    await this.cargarEspaciosLibres();
  }

  get tarifaActual(): number {
    return this.tarifas[this.tipoVehiculo];
  }

  // al cambiar el tipo: si es bici, el sistema asigna el código
  async onTipoChange() {
    if (this.tipoVehiculo === 'Bicicleta') {
      this.placa = await this.parqueoService.generarCodigoBici();
    } else {
      this.placa = '';
    }
    this.cdr.detectChanges();
  }

  async cargarEspaciosLibres() {
    const activos = await this.parqueoService.getActivos();
    const ocupados = activos.map(r => r.espacio);
    this.espaciosLibres = [];
    for (let i = 1; i <= this.totalEspacios; i++) {
      if (!ocupados.includes(i)) {
        this.espaciosLibres.push(i);
      }
    }
    this.cdr.detectChanges();
  }

  async registrar() {
    if (!this.placa.trim()) {
      this.mostrarMensaje('Ingresa la placa del vehículo.');
      return;
    }
    if (this.espacio === null) {
      this.mostrarMensaje('Selecciona un espacio.');
      return;
    }

    // RF-12: no permitir placa duplicada entre vehículos activos
    if (await this.parqueoService.existePlacaActiva(this.placa)) {
      this.mostrarMensaje(`Ya hay un vehículo activo con la placa ${this.placa.toUpperCase().trim()}.`);
      return;
    }

    await this.parqueoService.registrarIngreso({
      placa: this.placa,
      tipoVehiculo: this.tipoVehiculo,
      espacio: this.espacio,
      tarifaHora: this.tarifaActual,
    });

    this.mostrarMensaje(`Ingreso registrado: ${this.placa.toUpperCase()} en el espacio ${this.espacio}.`);

    this.placa = '';
    this.tipoVehiculo = 'Carro';
    this.espacio = null;
    await this.cargarEspaciosLibres();
  }

  private async mostrarMensaje(mensaje: string) {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 2000,
      position: 'bottom',
    });
    await toast.present();
  }
}