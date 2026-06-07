import { RouterLink, Router } from '@angular/router';
import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton } from '@ionic/angular/standalone';
import { ParqueoService } from '../services/parqueo.service';

@Component({
  selector: 'app-dashboardadmin',
  templateUrl: './dashboardadmin.page.html',
  styleUrls: ['./dashboardadmin.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButton, CommonModule, RouterLink]
})
export class DashboardadminPage {

  totalEspacios = 30;

  nombreUsuario = '';
  ingresosHoy = 0;
  vehiculosDentro = 0;
  ocupacion = 0;
  tiempoPromedio = '0min';

  constructor(
    private parqueoService: ParqueoService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { }

  async ionViewWillEnter() {
    const sesion = await this.parqueoService.getSesion();
    this.nombreUsuario = sesion?.usuario ?? '';
    await this.cargarResumen();
  }

  async cargarResumen() {
    const todos = await this.parqueoService.getRegistros();
    const activos = todos.filter(r => !r.horaSalida);
    const cerrados = todos.filter(r => r.horaSalida);

    const salidasHoy = cerrados.filter(r => this.esHoy(r.horaSalida!));
    this.ingresosHoy = salidasHoy.reduce((sum, r) => sum + (r.total ?? 0), 0);

    this.vehiculosDentro = activos.length;
    this.ocupacion = Math.round((activos.length / this.totalEspacios) * 100);

    if (cerrados.length > 0) {
      const totalMin = cerrados.reduce((sum, r) => {
        const min = (new Date(r.horaSalida!).getTime() - new Date(r.horaIngreso).getTime()) / 60000;
        return sum + min;
      }, 0);
      this.tiempoPromedio = this.formatearDuracion(Math.round(totalMin / cerrados.length));
    } else {
      this.tiempoPromedio = '0min';
    }

    this.cdr.detectChanges();
  }

  private esHoy(iso: string): boolean {
    const f = new Date(iso);
    const hoy = new Date();
    return f.getFullYear() === hoy.getFullYear()
      && f.getMonth() === hoy.getMonth()
      && f.getDate() === hoy.getDate();
  }

  private formatearDuracion(min: number): string {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return h > 0 ? `${h}h ${m}min` : `${m}min`;
  }

  async cerrarSesion() {
    await this.parqueoService.cerrarSesion();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}