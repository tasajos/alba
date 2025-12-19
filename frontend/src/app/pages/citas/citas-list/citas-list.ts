import { Component, ChangeDetectorRef, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Citas, Cita } from '../../../services/citas';
import { CitasForm } from '../citas-form/citas-form';
import { SuccessModal } from '../../../shared/success-modal/success-modal';

@Component({
  selector: 'app-citas-list',
  standalone: true,
  imports: [CommonModule, FormsModule, CitasForm, SuccessModal],
  templateUrl: './citas-list.html',
  styleUrl: './citas-list.scss',
})
export class CitasList implements OnInit {
  q = '';
  loading = false;
  data: Cita[] = [];

  modalOpen = false;
  editing: Cita | null = null;

  successOpen = false;
  successMessage = 'Cita registrada correctamente';

  constructor(
    private citas: Citas,
    @Inject(PLATFORM_ID) private platformId: object,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) this.buscar();
  }

  buscar() {
    this.loading = true;

    this.citas.listar(this.q).subscribe({
      next: (r) => {
        this.data = Array.isArray(r?.data) ? r.data : [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.data = [];
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  openNew() {
    this.editing = null;
    this.modalOpen = true;
  }

  openEdit(c: Cita) {
    this.editing = c;
    this.modalOpen = true;
  }

  closeModal() {
    this.modalOpen = false;
  }

  refresh() {
    this.modalOpen = false;
    this.successOpen = true;
    this.buscar();
  }

  eliminar(c: Cita) {
    if (!confirm(`¿Eliminar la cita #${c.id}?`)) return;

    this.citas.eliminar(c.id).subscribe({
      next: () => this.buscar(),
      error: () => alert('No se pudo eliminar.'),
    });
  }
}
