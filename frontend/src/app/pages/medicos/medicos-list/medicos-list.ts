import { Component, Inject, OnInit, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Medicos, Medico } from '../../../services/medicos';
import { MedicosForm } from '../medicos-form/medicos-form';
import { SuccessModal } from '../../../shared/success-modal/success-modal';



@Component({
  selector: 'app-medicos-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MedicosForm, SuccessModal],
  templateUrl: './medicos-list.html',
  styleUrl: './medicos-list.scss',
})
export class MedicosList implements OnInit {
  q = '';
  loading = false;
  data: Medico[] = [];

  // ✅ modal
  modalOpen = false;
  editing: Medico | null = null;

  // ✅ success modal
  successOpen = false;
  successMessage = 'Médico registrado correctamente';

  constructor(
  private medicos: Medicos,
  @Inject(PLATFORM_ID) private platformId: object,
  private cdr: ChangeDetectorRef
) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.buscar();
    }
  }

  buscar() {
    this.loading = true;

    this.medicos.listar(this.q).subscribe({
      next: (r) => {
        console.log('RESP /medicos (browser) =>', r);
        this.data = Array.isArray(r?.data) ? r.data : [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('ERROR /medicos =>', err);
        this.data = [];
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  // ✅ modal actions
  openNew() {
    this.editing = null;
    this.modalOpen = true;
    this.cdr.detectChanges();
  }

  openEdit(m: Medico) {
    this.editing = m;
    this.modalOpen = true;
    this.cdr.detectChanges();
  }

  closeModal() {
    this.modalOpen = false;
    this.cdr.detectChanges();
  }

  refresh() {
    this.modalOpen = false;
    this.successOpen = true;
    this.buscar();
  }

  eliminar(m: Medico) {
    if (!confirm(`¿Eliminar a ${m.nombre} ${m.apellido}?`)) return;

    this.medicos.eliminar(m.id).subscribe({
      next: () => this.buscar(),
      error: () => alert('No se pudo eliminar.'),
    });
  }
}
