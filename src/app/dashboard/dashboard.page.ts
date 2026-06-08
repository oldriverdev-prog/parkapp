import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonHeader, IonTitle, IonToolbar,
  IonGrid, IonRow, IonCol, IonButton, IonList, IonItem, IonLabel, IonNote
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { ParqueoService } from '../services/parqueo.service';
import { RegistroParqueo } from '../models/registro.model';

interface RegistroReciente extends RegistroParqueo {
  horaTexto: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonGrid, IonRow, IonCol, IonButton, IonList, IonItem, IonLabel, IonNote,
    CommonModule
  ]
})
export class DashboardPage {

  totalEspacios = 30;
  libresCount = 0;
  ultimos: RegistroReciente[] = [];

  constructor(
    private parqueoService: ParqueoService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  async ionViewWillEnter() {
    await this.cargar();
  }

  async cargar() {
    const todos = await this.parqueoService.getRegistros();
    const activos = todos.filter(r => !r.horaSalida);
    this.libresCount = this.totalEspacios - activos.length;

    // últimos 5 registros (más recientes primero)
    const ordenados = [...todos].sort((a, b) =>
      new Date(b.horaIngreso).getTime() - new Date(a.horaIngreso).getTime()
    );
    this.ultimos = ordenados.slice(0, 5).map(r => ({
      ...r,
      horaTexto: this.formatearHora(r.horaIngreso),
    }));

    this.cdr.detectChanges();
  }

  irAIngreso() {
    this.router.navigateByUrl('/registraringreso');
  }

  irASalida() {
    this.router.navigateByUrl('/registrarsalida');
  }

  irAHistorial() {
    this.router.navigateByUrl('/historial');
  }

  private formatearHora(iso: string): string {
    return new Date(iso).toLocaleString('es-CO', {
      day: '2-digit', month: '2-digit',
      hour: '2-digit', minute: '2-digit',
    });
  }
}