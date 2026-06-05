import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonList, IonItem, IonInput, IonButton, IonInputPasswordToggle, ToastController } from '@ionic/angular/standalone';
import { RouterLink, Router } from '@angular/router';
import { ParqueoService } from '../services/parqueo.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonContent, IonList, IonItem, IonInput, IonButton, IonInputPasswordToggle, CommonModule, FormsModule, RouterLink]
})
export class LoginPage {

  usuario = '';
  clave = '';

  constructor(
    private parqueoService: ParqueoService,
    private router: Router,
    private toastCtrl: ToastController
  ) { }

  async login() {
    if (!this.usuario.trim() || !this.clave) {
      this.mostrarMensaje('Ingresa usuario y contraseña.');
      return;
    }
    const valido = await this.parqueoService.validarLogin(this.usuario, this.clave);
    if (valido) {
      this.usuario = '';
      this.clave = '';
      this.router.navigateByUrl('/tabsmenu/dashboard');
    } else {
      const cuenta = await this.parqueoService.getCuenta();
      if (!cuenta) {
        this.mostrarMensaje('No hay ninguna cuenta registrada. Crea una primero.');
      } else {
        this.mostrarMensaje('Usuario o contraseña incorrectos.');
      }
    }
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