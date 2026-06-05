import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
  IonList, IonItem, IonInput, IonButton, IonNote,
  ToastController
} from '@ionic/angular/standalone';
import { ParqueoService } from '../services/parqueo.service';

@Component({
  selector: 'app-tarifas',
  templateUrl: './tarifas.page.html',
  styleUrls: ['./tarifas.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
    IonList, IonItem, IonInput, IonButton, IonNote,
    CommonModule, FormsModule
  ]
})
export class TarifasPage {

  tarifaCarro = 0;
  tarifaMoto = 0;

  constructor(
    private parqueoService: ParqueoService,
    private toastCtrl: ToastController,
    private cdr: ChangeDetectorRef
  ) { }

  async ionViewWillEnter() {
    const t = await this.parqueoService.getTarifas();
    this.tarifaCarro = t.Carro;
    this.tarifaMoto = t.Moto;
    this.cdr.detectChanges();
  }

  async guardar() {
    if (Number(this.tarifaCarro) <= 0 || Number(this.tarifaMoto) <= 0) {
      this.mostrarMensaje('Las tarifas deben ser mayores a 0.');
      return;
    }
    await this.parqueoService.setTarifas({
      Carro: Number(this.tarifaCarro),
      Moto: Number(this.tarifaMoto),
    });
    this.mostrarMensaje('Tarifas guardadas correctamente.');
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
