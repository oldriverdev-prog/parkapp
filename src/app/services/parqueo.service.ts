import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { RegistroParqueo, TipoVehiculo, Tarifas, Usuario, Sesion, Rol, Mensualidad } from '../models/registro.model';

@Injectable({ providedIn: 'root' })
export class ParqueoService {
  private listo = false;
  private readonly SESION_MAX_MS = 8 * 60 * 60 * 1000; // 8 horas

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
    const conMensualidad = await this.tieneMensualidadVigente(reg.placa);
    reg.mensualidad = conMensualidad;
    reg.total = conMensualidad ? 0 : this.calcularTotal(reg);
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
    const minutos = Math.ceil((fin - inicio) / (1000 * 60));
    // RF-07: cobro por fracción de 15 min, mínimo 1 fracción (primeros 15 min)
    const fracciones = Math.max(1, Math.ceil(minutos / 15));
    const tarifaFraccion = tarifa / 4; // 15 min = 1/4 de la tarifa por hora
    return Math.round(fracciones * tarifaFraccion);
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

  // ---- Usuarios (RF-01, RF-02, RNF-04) ----
  async getUsuarios(): Promise<Usuario[]> {
    await this.init();
    return (await this.storage.get('usuarios')) ?? [];
  }

  // siembra un admin por defecto si todavía no hay usuarios
  async sembrarAdminSiHaceFalta(): Promise<void> {
    const usuarios = await this.getUsuarios();
    if (usuarios.length === 0) {
      const salt = this.generarSalt();
      const hash = await this.hashClave('admin123', salt);
      const admin: Usuario = { usuario: 'admin', salt, hash, rol: 'admin' };
      await this.storage.set('usuarios', [admin]);
    }
  }

  async crearUsuario(usuario: string, clave: string, rol: Rol): Promise<'ok' | 'existe'> {
    const usuarios = await this.getUsuarios();
    const nombre = usuario.trim();
    if (usuarios.some(u => u.usuario.toLowerCase() === nombre.toLowerCase())) {
      return 'existe';
    }
    const salt = this.generarSalt();
    const hash = await this.hashClave(clave, salt);
    usuarios.push({ usuario: nombre, salt, hash, rol });
    await this.storage.set('usuarios', usuarios);
    return 'ok';
  }

  async validarLogin(usuario: string, clave: string): Promise<Usuario | null> {
    const usuarios = await this.getUsuarios();
    const nombre = usuario.trim();
    const u = usuarios.find(x => x.usuario.toLowerCase() === nombre.toLowerCase());
    if (!u) {
      return null;
    }
    const hash = await this.hashClave(clave, u.salt);
    return u.hash === hash ? u : null;
  }

  // ---- Sesión (RF-13, RNF-04) ----
  async iniciarSesion(u: Usuario): Promise<void> {
    await this.init();
    const sesion: Sesion = { usuario: u.usuario, rol: u.rol, inicio: Date.now() };
    await this.storage.set('sesion', sesion);
  }

  async getSesion(): Promise<Sesion | null> {
    await this.init();
    const sesion: Sesion | null = (await this.storage.get('sesion')) ?? null;
    if (!sesion) {
      return null;
    }
    if (Date.now() - sesion.inicio > this.SESION_MAX_MS) {
      await this.cerrarSesion();
      return null;
    }
    return sesion;
  }

  async cerrarSesion(): Promise<void> {
    await this.init();
    await this.storage.remove('sesion');
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

  async eliminarUsuario(usuario: string): Promise<'ok' | 'ultimo-admin' | 'no-encontrado'> {
    const usuarios = await this.getUsuarios();
    const u = usuarios.find(x => x.usuario === usuario);
    if (!u) {
      return 'no-encontrado';
    }
    if (u.rol === 'admin') {
      const admins = usuarios.filter(x => x.rol === 'admin');
      if (admins.length <= 1) {
        return 'ultimo-admin';
      }
    }
    const restantes = usuarios.filter(x => x.usuario !== usuario);
    await this.storage.set('usuarios', restantes);
    return 'ok';
  }

  // RF-10: Mensualidades
  async getMensualidades(): Promise<Mensualidad[]> {
    await this.init();
    return (await this.storage.get('mensualidades')) ?? [];
  }

  async crearMensualidad(data: {
    placa: string; tipoVehiculo: TipoVehiculo; valorMensual: number; fechaInicio: string; fechaFin: string;
  }): Promise<void> {
    const lista = await this.getMensualidades();
    lista.push({
      id: Date.now().toString(),
      placa: data.placa.toUpperCase().trim(),
      tipoVehiculo: data.tipoVehiculo,
      valorMensual: data.valorMensual,
      fechaInicio: data.fechaInicio,
      fechaFin: data.fechaFin,
    });
    await this.storage.set('mensualidades', lista);
  }

  async eliminarMensualidad(id: string): Promise<void> {
    const lista = await this.getMensualidades();
    const restantes = lista.filter(m => m.id !== id);
    await this.storage.set('mensualidades', restantes);
  }

  async tieneMensualidadVigente(placa: string): Promise<boolean> {
    const lista = await this.getMensualidades();
    const p = placa.toUpperCase().trim();
    const d = new Date();
    const hoy = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
    return lista.some(m => m.placa === p && m.fechaFin >= hoy);
  }
}
