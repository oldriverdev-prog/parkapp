import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
  IonList, IonItem, IonInput, IonSelect, IonSelectOption, IonButton, IonLabel, IonBadge, IonNote,
  ToastController
} from '@ionic/angular/standalone';
import { ParqueoService } from '../services/parqueo.service';
import { Usuario, Rol } from '../models/registro.model';

@Component({
  selector: 'app-gestionusuarios',
  templateUrl: './gestionusuarios.page.html',
  styleUrls: ['./gestionusuarios.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
    IonList, IonItem, IonInput, IonSelect, IonSelectOption, IonButton, IonLabel, IonBadge, IonNote,
    CommonModule, FormsModule
  ]
})
export class GestionusuariosPage {

  usuarios: Usuario[] = [];

  nuevoUsuario = '';
  nuevaClave = '';
  nuevoRol: Rol = 'operador';

  constructor(
    private parqueoService: ParqueoService,
    private toastCtrl: ToastController,
    private cdr: ChangeDetectorRef
  ) { }

  async ionViewWillEnter() {
    await this.cargar();
  }

  async cargar() {
    this.usuarios = await this.parqueoService.getUsuarios();
    this.cdr.detectChanges();
  }

  async crear() {
    if (!this.nuevoUsuario.trim() || !this.nuevaClave) {
      this.mostrarMensaje('Ingresa usuario y contraseña.');
      return;
    }
    if (this.nuevaClave.length < 4) {
      this.mostrarMensaje('La contraseña debe tener al menos 4 caracteres.');
      return;
    }
    const resultado = await this.parqueoService.crearUsuario(this.nuevoUsuario, this.nuevaClave, this.nuevoRol);
    if (resultado === 'existe') {
      this.mostrarMensaje('Ya existe un usuario con ese nombre.');
      return;
    }
    this.mostrarMensaje('Usuario creado correctamente.');
    this.nuevoUsuario = '';
    this.nuevaClave = '';
    this.nuevoRol = 'operador';
    await this.cargar();
  }

  private async mostrarMensaje(mensaje: string) {
    const toast = await this.toastCtrl.create({ message: mensaje, duration: 2000, position: 'bottom' });
    await toast.present();
  }
}