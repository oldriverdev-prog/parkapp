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

  async ionViewWillEnter() {
    await this.parqueoService.sembrarAdminSiHaceFalta();
  }

  async login() {
    if (!this.usuario.trim() || !this.clave) {
      this.mostrarMensaje('Ingresa usuario y contraseña.');
      return;
    }
    const usuario = await this.parqueoService.validarLogin(this.usuario, this.clave);
    if (!usuario) {
      this.mostrarMensaje('Usuario o contraseña incorrectos.');
      return;
    }
    await this.parqueoService.iniciarSesion(usuario);
    this.usuario = '';
    this.clave = '';
    if (usuario.rol === 'admin') {
      this.router.navigateByUrl('/tabsmenu/perfil');
    } else {
      this.router.navigateByUrl('/tabsmenu/dashboard');
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