import { Component, EventEmitter, Input, Output, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Medicos, Medico } from '../../services/medicos';

@Component({
  selector: 'app-medicos-especialidad-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './medicos-especialidad-modal.html',
  styleUrl: './medicos-especialidad-modal.scss',
})
export class MedicosEspecialidadModal implements OnChanges {
  @Input() open = false;
  @Input() especialidad = '';

  @Output() closed = new EventEmitter<void>();

  loading = false;
  data: Medico[] = [];

  constructor(private medicos: Medicos) {}

  ngOnChanges(): void {
    if (this.open && this.especialidad) {
      this.cargar();
    }
  }

  cargar() {
    this.loading = true;
    this.medicos.listarPorEspecialidad(this.especialidad).subscribe({
      next: (r: any) => {
        this.data = Array.isArray(r?.data) ? r.data : [];
        this.loading = false;
      },
      error: (e: any) => {
        console.error(e);
        this.data = [];
        this.loading = false;
      },
    });
  }

  close() {
    this.closed.emit();
  }
}
