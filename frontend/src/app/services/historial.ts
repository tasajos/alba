import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

export interface HistorialResponse {
  paciente: any;
  resumen: {
    citas: { total: number; programadas: number; atendidas: number; noAsistio: number; canceladas: number; };
    recetas: number;
    consultas: number;
    examenes: number;
    ordenesLab: number;
  };
  data: {
    citas: any[];
    consultas: any[];
    recetas: any[];
    examenes: any[];
    ordenesLab: any[];
  };
}

@Injectable({ providedIn: 'root' })
export class HistorialService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getHistorialPorPaciente(pacienteId: number | string): Observable<HistorialResponse> {
    return this.http.get<HistorialResponse>(`${this.baseUrl}/historial/${pacienteId}`);
  }
}
