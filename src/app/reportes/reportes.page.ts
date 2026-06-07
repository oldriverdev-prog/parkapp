import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
  IonItem, IonInput, IonList, IonLabel, IonButton, IonNote
} from '@ionic/angular/standalone';
import { ParqueoService } from '../services/parqueo.service';
import { TipoVehiculo } from '../models/registro.model';
import { jsPDF } from 'jspdf';

interface FilaTipo {
  tipo: TipoVehiculo;
  cantidad: number;
  ingresos: number;
}

@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.page.html',
  styleUrls: ['./reportes.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
    IonItem, IonInput, IonList, IonLabel, IonButton, IonNote,
    CommonModule, FormsModule
  ]
})
export class ReportesPage {

  fecha = '';
  cantidad = 0;
  total = 0;
  porTipo: FilaTipo[] = [];

  constructor(
    private parqueoService: ParqueoService,
    private cdr: ChangeDetectorRef
  ) { }

  async ionViewWillEnter() {
    this.fecha = this.fechaLocal(new Date().toISOString());
    await this.cargar();
  }

  async cargar() {
    const todos = await this.parqueoService.getRegistros();
    const cerradosDelDia = todos.filter(r => r.horaSalida && this.fechaLocal(r.horaSalida) === this.fecha);

    this.cantidad = cerradosDelDia.length;
    this.total = cerradosDelDia.reduce((s, r) => s + (r.total ?? 0), 0);

    const tipos: TipoVehiculo[] = ['Carro', 'Moto', 'Bicicleta'];
    this.porTipo = tipos.map(tipo => {
      const delTipo = cerradosDelDia.filter(r => r.tipoVehiculo === tipo);
      return {
        tipo,
        cantidad: delTipo.length,
        ingresos: delTipo.reduce((s, r) => s + (r.total ?? 0), 0),
      };
    });

    this.cdr.detectChanges();
  }

  exportarPDF() {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('ParkApp - Reporte de turno', 14, 20);
    doc.setFontSize(11);
    doc.text(`Fecha: ${this.fecha}`, 14, 30);

    let y = 46;
    doc.text('Tipo', 14, y);
    doc.text('Cantidad', 70, y);
    doc.text('Ingresos', 120, y);
    y += 8;
    this.porTipo.forEach(f => {
      doc.text(f.tipo, 14, y);
      doc.text(`${f.cantidad}`, 70, y);
      doc.text(`$${f.ingresos.toLocaleString('es-CO')}`, 120, y);
      y += 8;
    });

    y += 8;
    doc.text(`Total vehiculos: ${this.cantidad}`, 14, y);
    y += 8;
    doc.text(`Ingresos totales: $${this.total.toLocaleString('es-CO')}`, 14, y);

    doc.save(`reporte-${this.fecha}.pdf`);
  }

  exportarCSV() {
    const filas: string[][] = [
      ['ParkApp - Reporte de turno'],
      ['Fecha', this.fecha],
      [],
      ['Tipo', 'Cantidad', 'Ingresos'],
      ...this.porTipo.map(f => [f.tipo, `${f.cantidad}`, `${f.ingresos}`]),
      [],
      ['Total vehiculos', `${this.cantidad}`],
      ['Ingresos totales', `${this.total}`],
    ];
    const csv = filas.map(f => f.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-${this.fecha}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  private fechaLocal(iso: string): string {
    const d = new Date(iso);
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const dd = d.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${dd}`;
  }
}