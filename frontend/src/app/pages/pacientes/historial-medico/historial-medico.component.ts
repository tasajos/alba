import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef, NgZone } from '@angular/core';
import { HistorialService, HistorialResponse } from '../../../services/historial';

type EstadoFiltro = 'TODAS' | 'PROGRAMADA' | 'ATENDIDA' | 'NO_ASISTIO' | 'CANCELADA';

@Component({
  selector: 'app-historial-medico',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './historial-medico.component.html',
  styleUrls: ['./historial-medico.component.scss']
})
export class HistorialMedicoComponent implements OnInit {
  pacienteId!: string;
  loading = true;

  historial?: HistorialResponse;

  tab: 'citas' | 'consultas' | 'recetas' | 'ordenesLab' = 'citas';
  filtroCitas: EstadoFiltro = 'TODAS';
  q = '';

 constructor(
  private route: ActivatedRoute,
  private historialService: HistorialService,
  private zone: NgZone,
  private cdr: ChangeDetectorRef
) {}

  ngOnInit(): void {
    this.pacienteId = this.route.snapshot.paramMap.get('id') || '';
    this.cargar();
  }

  cargar() {
  this.loading = true;

  this.historialService.getHistorialPorPaciente(this.pacienteId).subscribe({
    next: (resp: any) => {
      const payload = resp?.data && (resp?.ok === true || resp?.ok === false) ? resp.data : resp;

      const historialNormalizado = {
        paciente: payload?.paciente ?? null,
        resumen: payload?.resumen ?? {
          citas: { total: 0, programadas: 0, atendidas: 0, noAsistio: 0, canceladas: 0 },
          recetas: 0, consultas: 0, ordenesLab: 0, examenes: 0
        },
        data: {
          citas: payload?.data?.citas ?? [],
          consultas: payload?.data?.consultas ?? [],
          recetas: payload?.data?.recetas ?? [],
          ordenesLab: payload?.data?.ordenesLab ?? [],
          examenes: payload?.data?.examenes ?? []
        }
      };

      // ✅ fuerza el update de UI incluso si estás zoneless / withFetch()
      this.zone.run(() => {
        this.historial = historialNormalizado as any;
        this.loading = false;
        this.cdr.detectChanges();
      });

      console.log('✅ Historial asignado:', this.historial);
    },
    error: (err) => {
      console.error('❌ Error cargando historial:', err);
      this.zone.run(() => {
        this.loading = false;
        this.cdr.detectChanges();
      });
    }
  });
}

  get citasFiltradas() {
    if (!this.historial) return [];
    let data = [...this.historial.data.citas];

    if (this.filtroCitas !== 'TODAS') {
      data = data.filter(x => (x.estado_normalizado || '').toUpperCase() === this.filtroCitas);
    }

    if (this.q.trim()) {
      const s = this.q.toLowerCase();
      data = data.filter(x =>
        (x.medico || '').toLowerCase().includes(s) ||
        (x.motivo || '').toLowerCase().includes(s) ||
        (x.estado || '').toLowerCase().includes(s)
      );
    }
    return data;
  }
}
