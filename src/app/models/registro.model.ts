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
}

export interface Tarifas {
  Carro: number;
  Moto: number;
  Bicicleta: number;
}

export interface Cuenta {
  usuario: string;
  clave: string;
}