import { Component, Inject, OnInit, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Pacientes, Paciente } from '../../../services/pacientes';
import { PacientesForm } from '../pacientes-form/pacientes-form';
import { SuccessModal } from '../../../shared/success-modal/success-modal';




@Component({
  selector: 'app-pacientes-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PacientesForm,SuccessModal],
  templateUrl: './pacientes-list.html',
  styleUrl: './pacientes-list.scss',
})
export class PacientesList implements OnInit {
  q = '';
  loading = false;
  data: Paciente[] = [];

  // ✅ modal
  modalOpen = false;
  editing: Paciente | null = null;
  successOpen = false;
successMessage = 'Paciente registrado correctamente';


  constructor(
    private pacientes: Pacientes,
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

    this.pacientes.listar(this.q).subscribe({
      next: (r) => {
        console.log('RESP /pacientes (browser) =>', r);
        this.data = Array.isArray(r?.data) ? r.data : [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('ERROR /pacientes =>', err);
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
  }

  openEdit(p: Paciente) {
    this.editing = p;
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

  eliminar(p: Paciente) {
    if (!confirm(`¿Eliminar a ${p.nombre} ${p.apellido}?`)) return;

    this.pacientes.eliminar(p.id).subscribe({
      next: () => this.buscar(),
      error: () => alert('No se pudo eliminar.'),
    });
  }

  
}

