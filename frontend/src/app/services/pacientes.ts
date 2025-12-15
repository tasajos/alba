import { Injectable } from '@angular/core';
import { Api } from './api';

export interface Paciente {
  id: number;
  nombre: string;
  apellido: string;
  ci?: string;
  telefono?: string;
}

@Injectable({ providedIn: 'root' })
export class Pacientes {
  constructor(private api: Api) {}

  listar(q?: string) {
    return this.api.get<{ ok: boolean; data: Paciente[] }>('/pacientes', q ? { q } : undefined);
  }
}
