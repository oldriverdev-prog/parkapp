import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { RegistroParqueo, TipoVehiculo, Tarifas } from '../models/registro.model';

@Injectable({ providedIn: 'root' })
export class ParqueoService {
  private listo = false;

  constructor(private storage: Storage) {}

  private async init() {
    if (!this.listo) {
      await this.storage.create();
      this.listo = true;
    }
  }

  async getRegistros(): Promise<RegistroParqueo[]> {
    await this.init();
    return (await this.storage.get('registros')) ?? [];
  }

  async getActivos(): Promise<RegistroParqueo[]> {
    const todos = await this.getRegistros();
    return todos.filter(r => !r.horaSalida);
  }

  async registrarIngreso(data: {
    placa: string; tipoVehiculo: TipoVehiculo; espacio: number; tarifaHora: number;
  }): Promise<RegistroParqueo> {
    const registros = await this.getRegistros();
    const nuevo: RegistroParqueo = {
      id: Date.now().toString(),
      placa: data.placa.toUpperCase().trim(),
      tipoVehiculo: data.tipoVehiculo,
      espacio: data.espacio,
      horaIngreso: new Date().toISOString(),
      tarifaHora: data.tarifaHora,
    };
    registros.push(nuevo);
    await this.storage.set('registros', registros);
    return nuevo;
  }

  async registrarSalida(id: string): Promise<RegistroParqueo | null> {
    const registros = await this.getRegistros();
    const reg = registros.find(r => r.id === id);
    if (!reg) return null;
    reg.horaSalida = new Date().toISOString();
    reg.total = this.calcularTotal(reg);
    await this.storage.set('registros', registros);
    return reg;
  }

  calcularTotal(reg: RegistroParqueo): number {
    const inicio = new Date(reg.horaIngreso).getTime();
    const fin = new Date(reg.horaSalida ?? new Date().toISOString()).getTime();
    const horas = Math.ceil((fin - inicio) / (1000 * 60 * 60));
    return Math.max(1, horas) * reg.tarifaHora;
  }

  // Tarifas por tipo de vehículo
  async getTarifas(): Promise<Tarifas> {
    await this.init();
    return (await this.storage.get('tarifas')) ?? { Carro: 3000, Moto: 1500 };
  }

  async setTarifas(tarifas: Tarifas): Promise<void> {
    await this.init();
    await this.storage.set('tarifas', tarifas);
  }
}