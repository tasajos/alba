import { Component, Inject, OnInit, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { DashboardService, DashboardResumen } from '../../services/dashboard';
import { MedicosEspecialidadModal } from '../../shared/medicos-especialidad-modal/medicos-especialidad-modal';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule,MedicosEspecialidadModal],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  loading = false;
  data?: DashboardResumen;
  espModalOpen = false;
  espSeleccionada = '';

  openEspecialidad(especialidad: string) {
    this.espSeleccionada = especialidad;
    this.espModalOpen = true;
  }

  closeEspecialidad() {
    this.espModalOpen = false;
  }

  constructor(
    private dash: DashboardService,
    @Inject(PLATFORM_ID) private platformId: object,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.cargar();
    }
  }

  cargar() {
    this.loading = true;

    this.dash.resumen().subscribe({
      next: (r) => {
        this.data = r.data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.data = undefined;
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }
}
