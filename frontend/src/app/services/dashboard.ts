import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export type DashboardResumen = {
  pacientes: number;
  medicos: number;
  citas_programadas: number;
  medicos_por_especialidad: { especialidad: string; total: number }[];
};

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private base = environment.apiUrl; // ej: http://localhost:5000/api

  constructor(private http: HttpClient) {}

  resumen() {
    return this.http.get<{ ok: boolean; data: DashboardResumen }>(
      `${this.base}/dashboard`
    );
  }
}
