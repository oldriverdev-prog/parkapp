import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
  IonList, IonItem, IonInput, IonButton, IonSelect, IonSelectOption, IonNote,
  ToastController
} from '@ionic/angular/standalone';
import { ParqueoService } from '../services/parqueo.service';
import { TipoVehiculo } from '../models/registro.model';

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
export class RegistraringresoPage implements OnInit {

  totalEspacios = 20;

  // datos del formulario
  placa = '';
  tipoVehiculo: TipoVehiculo = 'Carro';
  espacio: number | null = null;
  tarifaHora = 3000;

  espaciosLibres: number[] = [];

  constructor(
    private parqueoService: ParqueoService,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() { }

  // se ejecuta cada vez que entras a la página
  async ionViewWillEnter() {
    await this.cargarEspaciosLibres();
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
  }

  async registrar() {
    if (!this.placa.trim()) {
      return this.mostrarMensaje('Ingresa la placa del vehículo.');
    }
    if (this.espacio === null) {
      return this.mostrarMensaje('Selecciona un espacio.');
    }
    if (!this.tarifaHora || Number(this.tarifaHora) <= 0) {
      return this.mostrarMensaje('Ingresa una tarifa válida.');
    }

    await this.parqueoService.registrarIngreso({
      placa: this.placa,
      tipoVehiculo: this.tipoVehiculo,
      espacio: this.espacio,
      tarifaHora: Number(this.tarifaHora),
    });

    this.mostrarMensaje(`Ingreso registrado: ${this.placa.toUpperCase()} en el espacio ${this.espacio}.`);

    // limpiar y recargar
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