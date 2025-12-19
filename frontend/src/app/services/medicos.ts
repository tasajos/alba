import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

/* =======================
   Interfaces
======================= */
export interface Medico {
  id: number;
  nombre: string;
  apellido: string;
  ci?: string | null;
  especialidad?: string | null;
  telefono?: string | null;
  email?: string | null;
  created_at?: string;
}

export interface MedicoCreate {
  nombre: string;
  apellido: string;
  ci: string;
  especialidad: string;
  telefono?: string | null;
  email?: string | null;
}

/* =======================
   Service
======================= */
@Injectable({ providedIn: 'root' })
export class Medicos {
  private baseUrl = environment.apiUrl; // ej: http://localhost:5000/api

  constructor(private http: HttpClient) {}

  listar(q = ''): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/medicos`, {
      params: { q },
    });
  }

  crear(payload: MedicoCreate): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/medicos`, payload);
  }

  actualizar(id: number, payload: MedicoCreate): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/medicos/${id}`, payload);
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/medicos/${id}`);
  }

  /* Dashboard */
  listarPorEspecialidad(especialidad: string): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/medicos/por-especialidad/${encodeURIComponent(especialidad)}`
    );
  }
}
