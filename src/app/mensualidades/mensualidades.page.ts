import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
  IonList, IonItem, IonInput, IonSelect, IonSelectOption, IonButton, IonLabel, IonBadge, IonNote,
  ToastController, AlertController
} from '@ionic/angular/standalone';
import { ParqueoService } from '../services/parqueo.service';
import { Mensualidad, TipoVehiculo } from '../models/registro.model';

interface MensualidadVista extends Mensualidad {
  vigente: boolean;
}

@Component({
  selector: 'app-mensualidades',
  templateUrl: './mensualidades.page.html',
  styleUrls: ['./mensualidades.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
    IonList, IonItem, IonInput, IonSelect, IonSelectOption, IonButton, IonLabel, IonBadge, IonNote,
    CommonModule, FormsModule
  ]
})
export class MensualidadesPage {

  placa = '';
  tipoVehiculo: TipoVehiculo = 'Carro';
  valorMensual: number | null = null;
  fechaInicio = '';
  fechaFin = '';

  lista: MensualidadVista[] = [];

  constructor(
    private parqueoService: ParqueoService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private cdr: ChangeDetectorRef
  ) { }

  async ionViewWillEnter() {
    if (!this.fechaInicio) {
      this.fechaInicio = this.hoyLocal();
    }
    await this.cargar();
  }

  async cargar() {
    const hoy = this.hoyLocal();
    const mensualidades = await this.parqueoService.getMensualidades();
    this.lista = mensualidades
      .sort((a, b) => b.fechaFin.localeCompare(a.fechaFin))
      .map(m => ({ ...m, vigente: m.fechaFin >= hoy }));
    this.cdr.detectChanges();
  }

  async registrar() {
    if (!this.placa.trim()) {
      this.mostrarMensaje('Ingresa la placa.');
      return;
    }
    if (!this.valorMensual || this.valorMensual <= 0) {
      this.mostrarMensaje('Ingresa un valor mensual válido.');
      return;
    }
    if (!this.fechaInicio || !this.fechaFin) {
      this.mostrarMensaje('Selecciona las fechas de inicio y fin.');
      return;
    }
    if (this.fechaFin < this.fechaInicio) {
      this.mostrarMensaje('La fecha de fin no puede ser anterior a la de inicio.');
      return;
    }
    await this.parqueoService.crearMensualidad({
      placa: this.placa,
      tipoVehiculo: this.tipoVehiculo,
      valorMensual: Number(this.valorMensual),
      fechaInicio: this.fechaInicio,
      fechaFin: this.fechaFin,
    });
    this.mostrarMensaje('Mensualidad registrada.');
    this.placa = '';
    this.tipoVehiculo = 'Carro';
    this.valorMensual = null;
    this.fechaInicio = this.hoyLocal();
    this.fechaFin = '';
    await this.cargar();
  }

  async confirmarEliminar(m: MensualidadVista) {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar mensualidad',
      message: `¿Eliminar la mensualidad de "${m.placa}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Eliminar', role: 'destructive', handler: () => { this.eliminar(m.id); } },
      ],
    });
    await alert.present();
  }

  async eliminar(id: string) {
    await this.parqueoService.eliminarMensualidad(id);
    this.mostrarMensaje('Mensualidad eliminada.');
    await this.cargar();
  }

  private hoyLocal(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const dd = d.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${dd}`;
  }

  private async mostrarMensaje(mensaje: string) {
    const toast = await this.toastCtrl.create({ message: mensaje, duration: 2000, position: 'bottom' });
    await toast.present();
  }
}