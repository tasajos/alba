import { Component, EventEmitter, Input, Output, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Medicos, Medico, MedicoCreate } from '../../../services/medicos';

@Component({
  selector: 'app-medicos-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './medicos-form.html',
  styleUrl: './medicos-form.scss',
})
export class MedicosForm implements OnChanges {
  @Input() open = false;
  @Input() editing: Medico | null = null;

  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  saving = false;
  form!: FormGroup; // 👈 se declara, no se inicializa aquí

  constructor(
    private fb: FormBuilder,
    private medicos: Medicos
  ) {
    // ✅ inicialización correcta
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      ci: ['', Validators.required],
      especialidad: ['', Validators.required],
      telefono: [''],
      email: [''],
    });
  }

  ngOnChanges() {
    if (!this.form) return;

    if (this.editing) {
      this.form.patchValue({
        nombre: this.editing.nombre ?? '',
        apellido: this.editing.apellido ?? '',
        ci: this.editing.ci ?? '',
        especialidad: this.editing.especialidad ?? '',
        telefono: this.editing.telefono ?? '',
        email: this.editing.email ?? '',
      });
    } else {
      this.form.reset({
        nombre: '',
        apellido: '',
        ci: '',
        especialidad: '',
        telefono: '',
        email: '',
      });
    }
  }

  close() {
    this.closed.emit();
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    const payload = this.form.value as MedicoCreate;

    const req = this.editing?.id
      ? this.medicos.actualizar(this.editing.id, payload)
      : this.medicos.crear(payload);

    req.subscribe({
      next: () => {
        this.saving = false;
        this.saved.emit();
        this.close();
      },
      error: () => {
        this.saving = false;
        alert('No se pudo guardar el médico.');
      },
    });
  }
}
