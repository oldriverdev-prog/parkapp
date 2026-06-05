export type TipoVehiculo = 'Carro' | 'Moto';

export interface RegistroParqueo {
  id: string;
  placa: string;
  tipoVehiculo: TipoVehiculo;
  espacio: number;
  horaIngreso: string;
  horaSalida?: string;
  tarifaHora: number;
  total?: number;
}

export interface Tarifas {
  Carro: number;
  Moto: number;
}

export interface Cuenta {
  usuario: string;
  clave: string;
}