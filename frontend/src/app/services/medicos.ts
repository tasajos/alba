import { Injectable } from '@angular/core';
import { Api } from './api';

export interface Medico {
  id: number;
  nombre: string;
  apellido: string;
  ci?: string;
  especialidad: string;
  telefono?: string;
  email?: string;
  created_at?: string;
}

export type MedicoCreate = Omit<Medico, 'id' | 'created_at'>;
export type MedicoUpdate = Partial<MedicoCreate>;

@Injectable({ providedIn: 'root' })
export class Medicos {
  constructor(private api: Api) {}

  listar(q?: string) {
    return this.api.get<{ ok: boolean; data: Medico[] }>('/medicos', q ? { q } : undefined);
  }

  crear(payload: MedicoCreate) {
    return this.api.post<{ ok: boolean; id: number }>('/medicos', payload);
  }

  actualizar(id: number, payload: MedicoUpdate) {
    return this.api.put<{ ok: boolean }>(`/medicos/${id}`, payload);
  }

  eliminar(id: number) {
    return this.api.delete<{ ok: boolean }>(`/medicos/${id}`);
  }
}
