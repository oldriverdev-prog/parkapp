import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
  IonList, IonItem, IonInput, IonButton, IonInputPasswordToggle,
  ToastController
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { ParqueoService } from '../services/parqueo.service';

@Component({
  selector: 'app-registroapp',
  templateUrl: './registroapp.page.html',
  styleUrls: ['./registroapp.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
    IonList, IonItem, IonInput, IonButton, IonInputPasswordToggle,
    CommonModule, FormsModule
  ]
})
export class RegistroappPage {

  usuario = '';
  clave = '';
  confirmar = '';

  constructor(
    private parqueoService: ParqueoService,
    private router: Router,
    private toastCtrl: ToastController
  ) { }

  async registrar() {
    if (!this.usuario.trim() || !this.clave) {
      this.mostrarMensaje('Completa usuario y contraseña.');
      return;
    }
    if (this.clave !== this.confirmar) {
      this.mostrarMensaje('Las contraseñas no coinciden.');
      return;
    }
    await this.parqueoService.crearCuenta(this.usuario, this.clave);
    this.mostrarMensaje('Cuenta creada. Ya puedes iniciar sesión.');
    this.usuario = '';
    this.clave = '';
    this.confirmar = '';
    this.router.navigateByUrl('/login');
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
