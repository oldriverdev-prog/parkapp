export type TipoVehiculo = 'Carro' | 'Moto';

export interface RegistroParqueo {
  id: string;
  placa: string;
  tipoVehiculo: TipoVehiculo;
  espacio: number;
  horaIngreso: string;   // fecha ISO
  horaSalida?: string;   // se llena al salir
  tarifaHora: number;
  total?: number;        // se calcula al salir
}