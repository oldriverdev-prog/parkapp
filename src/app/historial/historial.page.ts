import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
  IonList, IonItem, IonLabel, IonNote, IonBadge
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
    IonList, IonItem, IonLabel, IonNote, IonBadge, CommonModule
  ]
})
export class HistorialPage {

  registros: RegistroVista[] = [];
  totalRecaudado = 0;
  dentroCount = 0;

  constructor(
    private parqueoService: ParqueoService,
    private cdr: ChangeDetectorRef
  ) { }

  async ionViewWillEnter() {
    await this.cargarHistorial();
  }

  async cargarHistorial() {
    const todos = await this.parqueoService.getRegistros();

    // más recientes primero (por hora de entrada)
    todos.sort((a, b) =>
      new Date(b.horaIngreso).getTime() - new Date(a.horaIngreso).getTime()
    );

    this.registros = todos.map(r => {
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

    this.totalRecaudado = todos
      .filter(r => r.horaSalida)
      .reduce((sum, r) => sum + (r.total ?? 0), 0);
    this.dentroCount = todos.filter(r => !r.horaSalida).length;

    this.cdr.detectChanges();
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