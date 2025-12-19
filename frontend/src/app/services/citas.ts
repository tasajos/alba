import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

export type CitaEstado = 'PROGRAMADA' | 'ATENDIDA' | 'CANCELADA';

export interface Cita {
  id: number;
  paciente_id: number;
  medico_id: number;
  fecha: string;
  motivo?: string | null;
  estado?: CitaEstado | null;
  created_at?: string;

  // vienen del JOIN del backend
  paciente_nombre?: string;
  medico_nombre?: string;
  medico_especialidad?: string;
}

export interface CitaCreate {
  paciente_id: number;
  medico_id: number;
  fecha: string; // 'YYYY-MM-DD HH:mm:ss'
  motivo?: string | null;
  estado?: CitaEstado;
}

@Injectable({ providedIn: 'root' })
export class Citas {
  private base = `${environment.apiUrl}/citas`;

  constructor(private http: HttpClient) {}

  listar(q = '', page = 1, limit = 20): Observable<any> {
    return this.http.get(this.base, { params: { q, page, limit } as any });
  }

  crear(payload: CitaCreate): Observable<any> {
    return this.http.post(this.base, payload);
  }

  actualizar(id: number, payload: CitaCreate): Observable<any> {
    return this.http.put(`${this.base}/${id}`, payload);
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.base}/${id}`);
  }
}
