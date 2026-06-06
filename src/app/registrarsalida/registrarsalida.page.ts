import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
  IonSearchbar, IonList, IonItem, IonLabel, IonButton, IonNote,
  ToastController, AlertController
} from '@ionic/angular/standalone';
import { ParqueoService } from '../services/parqueo.service';
import { RegistroParqueo } from '../models/registro.model';

interface VehiculoActivo extends RegistroParqueo {
  cobroActual: number;
  tiempoTexto: string;
}

@Component({
  selector: 'app-registrarsalida',
  templateUrl: './registrarsalida.page.html',
  styleUrls: ['./registrarsalida.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
    IonSearchbar, IonList, IonItem, IonLabel, IonButton, IonNote,
    CommonModule, FormsModule
  ]
})
export class RegistrarsalidaPage {

  activos: VehiculoActivo[] = [];
  filtro = '';

  constructor(
    private parqueoService: ParqueoService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private cdr: ChangeDetectorRef
  ) { }

  async ionViewWillEnter() {
    await this.cargarActivos();
  }

  async cargarActivos() {
    const activos = await this.parqueoService.getActivos();
    this.activos = activos.map(r => ({
      ...r,
      cobroActual: this.parqueoService.calcularTotal(r),
      tiempoTexto: this.calcularTiempo(r.horaIngreso),
    }));
    this.cdr.detectChanges(); // fuerza el repintado de la lista
  }

  get activosFiltrados(): VehiculoActivo[] {
    const f = this.filtro.trim().toUpperCase();
    if (!f) {
      return this.activos;
    }
    return this.activos.filter(v => v.placa.includes(f));
  }

  calcularTiempo(horaIngreso: string): string {
    const min = Math.floor((Date.now() - new Date(horaIngreso).getTime()) / 60000);
    const h = Math.floor(min / 60);
    const m = min % 60;
    return h > 0 ? `${h}h ${m}min` : `${m}min`;
  }

  async confirmarSalida(vehiculo: VehiculoActivo) {
    const alert = await this.alertCtrl.create({
      header: 'Registrar salida',
      message: `Placa ${vehiculo.placa} · Espacio ${vehiculo.espacio}. Total a cobrar: $${vehiculo.cobroActual.toLocaleString('es-CO')}`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Confirmar', handler: () => { this.procesarSalida(vehiculo); } },
      ],
    });
    await alert.present();
  }

  async editarPlaca(vehiculo: VehiculoActivo) {
    const alert = await this.alertCtrl.create({
      header: 'Editar placa',
      message: `Espacio ${vehiculo.espacio} · ${vehiculo.tipoVehiculo}`,
      inputs: [
        { name: 'placa', type: 'text', value: vehiculo.placa, placeholder: 'Nueva placa' },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Guardar', handler: (data) => { this.procesarEdicion(vehiculo.id, data.placa); } },
      ],
    });
    await alert.present();
  }

  async procesarEdicion(id: string, nuevaPlaca: string) {
    if (!nuevaPlaca || !nuevaPlaca.trim()) {
      this.mostrarMensaje('La placa no puede estar vacía.');
      return;
    }
    const resultado = await this.parqueoService.editarPlaca(id, nuevaPlaca);
    if (resultado === 'duplicada') {
      this.mostrarMensaje('Ya hay otro vehículo activo con esa placa.');
    } else if (resultado === 'no-encontrado') {
      this.mostrarMensaje('No se encontró el vehículo.');
    } else {
      this.mostrarMensaje('Placa actualizada.');
    }
    await this.cargarActivos();
  }

  async procesarSalida(vehiculo: VehiculoActivo) {
    const cerrado = await this.parqueoService.registrarSalida(vehiculo.id);
    await this.cargarActivos();
    if (cerrado) {
      this.mostrarMensaje(`Salida registrada. Cobro: $${(cerrado.total ?? 0).toLocaleString('es-CO')}`);
    }
  }

  private async mostrarMensaje(mensaje: string) {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 2500,
      position: 'bottom',
    });
    await toast.present();
  }
}