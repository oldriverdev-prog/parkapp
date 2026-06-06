import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { RegistroParqueo, TipoVehiculo, Tarifas, Cuenta } from '../models/registro.model';

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

  // RF-12: ¿ya hay un vehículo activo con esa placa?
  async existePlacaActiva(placa: string): Promise<boolean> {
    const activos = await this.getActivos();
    const normalizada = placa.toUpperCase().trim();
    return activos.some(r => r.placa === normalizada);
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
    const tarifa = Number(reg.tarifaHora);
    if (!tarifa || isNaN(tarifa)) {
      return 0;
    }
    const inicio = new Date(reg.horaIngreso).getTime();
    const fin = new Date(reg.horaSalida ?? new Date().toISOString()).getTime();
    const horas = Math.ceil((fin - inicio) / (1000 * 60 * 60));
    return Math.max(1, horas) * tarifa;
  }

  // Tarifas por tipo de vehículo
  async getTarifas(): Promise<Tarifas> {
    await this.init();
    const guardadas = await this.storage.get('tarifas');
    return { Carro: 3000, Moto: 1500, Bicicleta: 800, ...(guardadas ?? {}) };
  }

  async setTarifas(tarifas: Tarifas): Promise<void> {
    await this.init();
    await this.storage.set('tarifas', tarifas);
  }

  // Cuenta del operador (login offline)
  async getCuenta(): Promise<Cuenta | null> {
    await this.init();
    return (await this.storage.get('cuenta')) ?? null;
  }

  // RNF-04: crea la cuenta guardando un hash con salt (no la contraseña en texto plano)
  async crearCuenta(usuario: string, clave: string): Promise<void> {
    await this.init();
    const salt = this.generarSalt();
    const hash = await this.hashClave(clave, salt);
    await this.storage.set('cuenta', { usuario: usuario.trim(), salt, hash });
  }

  async validarLogin(usuario: string, clave: string): Promise<boolean> {
    const cuenta = await this.getCuenta();
    if (!cuenta) {
      return false;
    }
    const hash = await this.hashClave(clave, cuenta.salt);
    return cuenta.usuario === usuario.trim() && cuenta.hash === hash;
  }

  private generarSalt(): string {
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private async hashClave(clave: string, salt: string): Promise<string> {
    const data = new TextEncoder().encode(salt + clave);
    const buffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Código secuencial automático para bicicletas (B-001, B-002, ...)
  async generarCodigoBici(): Promise<string> {
    const todos = await this.getRegistros();
    const bicis = todos.filter(r => r.tipoVehiculo === 'Bicicleta');
    const siguiente = bicis.length + 1;
    return 'B-' + siguiente.toString().padStart(3, '0');
  }

  // RF-11: editar solo la placa de un vehículo activo (sin tocar la hora de entrada)
  async editarPlaca(id: string, nuevaPlaca: string): Promise<'ok' | 'duplicada' | 'no-encontrado'> {
    const registros = await this.getRegistros();
    const reg = registros.find(r => r.id === id);
    if (!reg || reg.horaSalida) {
      return 'no-encontrado';
    }
    const normalizada = nuevaPlaca.toUpperCase().trim();
    const duplicada = registros.some(r => r.id !== id && !r.horaSalida && r.placa === normalizada);
    if (duplicada) {
      return 'duplicada';
    }
    reg.placa = normalizada;
    await this.storage.set('registros', registros);
    return 'ok';
  }
}