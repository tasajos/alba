import { Injectable } from '@angular/core';
import { Api } from './api';

export interface Paciente {
  id: number;
  nombre: string;
  apellido: string;
  ci?: string;
  fecha_nacimiento?: string;
  telefono?: string;
  direccion?: string;
  created_at?: string;
}

export type PacienteCreate = Omit<Paciente, 'id' | 'created_at'>;
export type PacienteUpdate = Partial<PacienteCreate>;

@Injectable({ providedIn: 'root' })
export class Pacientes {
  constructor(private api: Api) {}

  listar(q?: string) {
    return this.api.get<{ ok: boolean; data: Paciente[] }>('/pacientes', q ? { q } : undefined);
  }

  obtener(id: number) {
    return this.api.get<{ ok: boolean; data: Paciente }>(`/pacientes/${id}`);
  }

  crear(payload: PacienteCreate) {
    return this.api.post<{ ok: boolean; id: number }>('/pacientes', payload);
  }

  actualizar(id: number, payload: PacienteUpdate) {
    return this.api.put<{ ok: boolean }>(`/pacientes/${id}`, payload);
  }

  eliminar(id: number) {
    return this.api.delete<{ ok: boolean }>(`/pacientes/${id}`);
  }
}
