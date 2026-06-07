export type TipoVehiculo = 'Carro' | 'Moto' | 'Bicicleta';

export interface RegistroParqueo {
  id: string;
  placa: string;
  tipoVehiculo: TipoVehiculo;
  espacio: number;
  horaIngreso: string;
  horaSalida?: string;
  tarifaHora: number;
  total?: number;
  mensualidad?: boolean;
}

export interface Tarifas {
  Carro: number;
  Moto: number;
  Bicicleta: number;
}

export type Rol = 'admin' | 'operador';

export interface Usuario {
  usuario: string;
  salt: string;
  hash: string;
  rol: Rol;
}

export interface Sesion {
  usuario: string;
  rol: Rol;
  inicio: number;
}

export interface Mensualidad {
  id: string;
  placa: string;
  tipoVehiculo: TipoVehiculo;
  valorMensual: number;
  fechaInicio: string;
  fechaFin: string;
}