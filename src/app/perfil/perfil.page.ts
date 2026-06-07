import { Router } from '@angular/router';
import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton } from '@ionic/angular/standalone';
import { ParqueoService } from '../services/parqueo.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButton, CommonModule]
})
export class PerfilPage {

  nombreUsuario = '';
  esAdmin = false;

  constructor(
    private parqueoService: ParqueoService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { }

  async ionViewWillEnter() {
    const sesion = await this.parqueoService.getSesion();
    this.nombreUsuario = sesion?.usuario ?? '';
    this.esAdmin = sesion?.rol === 'admin';
    this.cdr.detectChanges();
  }

  async cerrarSesion() {
    await this.parqueoService.cerrarSesion();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}