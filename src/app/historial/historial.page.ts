import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
  IonList, IonItem, IonLabel, IonNote, IonBadge, IonSearchbar, IonInput, IonButton
} from '@ionic/angular/standalone';
import { ParqueoService } from '../services/parqueo.service';
import { RegistroParqueo } from '../models/registro.model';

interface RegistroVista extends RegistroParqueo {
  activo: boolean;
  entradaTexto: string;
  salidaTexto: string;
  tiempoTexto: string;
  cobro: number;
}

@Component({
  selector: 'app-historial',
  templateUrl: './historial.page.html',
  styleUrls: ['./historial.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
    IonList, IonItem, IonLabel, IonNote, IonBadge, IonSearchbar, IonInput, IonButton,
    CommonModule, FormsModule
  ]
})
export class HistorialPage {

  registros: RegistroVista[] = [];
  filtroPlaca = '';
  filtroFecha = '';

  constructor(
    private parqueoService: ParqueoService,
    private cdr: ChangeDetectorRef
  ) { }

  async ionViewWillEnter() {
    await this.cargarHistorial();
  }

  async cargarHistorial() {
    const todos = await this.parqueoService.getRegistros();

    // RF-09: solo los últimos 30 días
    const limite = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const recientes = todos.filter(r => new Date(r.horaIngreso).getTime() >= limite);

    // más recientes primero
    recientes.sort((a, b) =>
      new Date(b.horaIngreso).getTime() - new Date(a.horaIngreso).getTime()
    );

    this.registros = recientes.map(r => {
      const activo = !r.horaSalida;
      return {
        ...r,
        activo,
        entradaTexto: this.formatearFecha(r.horaIngreso),
        salidaTexto: r.horaSalida ? this.formatearFecha(r.horaSalida) : '',
        tiempoTexto: this.calcularTiempo(r.horaIngreso, r.horaSalida ?? new Date().toISOString()),
        cobro: r.total ?? this.parqueoService.calcularTotal(r),
      };
    });

    this.cdr.detectChanges();
  }

  get registrosFiltrados(): RegistroVista[] {
    const placa = this.filtroPlaca.trim().toUpperCase();
    return this.registros.filter(r => {
      const coincidePlaca = !placa || r.placa.includes(placa);
      const coincideFecha = !this.filtroFecha || this.fechaLocal(r.horaIngreso) === this.filtroFecha;
      return coincidePlaca && coincideFecha;
    });
  }

  get totalRecaudado(): number {
    return this.registrosFiltrados
      .filter(r => !r.activo)
      .reduce((sum, r) => sum + r.cobro, 0);
  }

  get dentroCount(): number {
    return this.registrosFiltrados.filter(r => r.activo).length;
  }

  private fechaLocal(iso: string): string {
    const d = new Date(iso);
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const dd = d.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${dd}`;
  }

  formatearFecha(iso: string): string {
    return new Date(iso).toLocaleString('es-CO', {
      day: '2-digit', month: '2-digit',
      hour: '2-digit', minute: '2-digit',
    });
  }

  calcularTiempo(ingreso: string, salida: string): string {
    const min = Math.floor((new Date(salida).getTime() - new Date(ingreso).getTime()) / 60000);
    const h = Math.floor(min / 60);
    const m = min % 60;
    return h > 0 ? `${h}h ${m}min` : `${m}min`;
  }
}