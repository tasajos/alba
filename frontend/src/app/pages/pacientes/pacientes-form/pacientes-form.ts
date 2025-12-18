import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Paciente, PacienteCreate, Pacientes } from '../../../services/pacientes';

@Component({
  selector: 'app-pacientes-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './pacientes-form.html',
  styleUrl: './pacientes-form.scss',
})
export class PacientesForm implements OnChanges {
  private fb = inject(FormBuilder);
  private pacientes = inject(Pacientes);

  @Input() open = false;
  @Input() editing: Paciente | null = null;

  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  saving = false;

  form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    apellido: ['', [Validators.required, Validators.minLength(2)]],
    ci: [''],
    fecha_nacimiento: [''],
    telefono: [''],
    direccion: [''],
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['editing']) {
      if (this.editing) {
        this.form.patchValue({
          nombre: this.editing.nombre ?? '',
          apellido: this.editing.apellido ?? '',
          ci: this.editing.ci ?? '',
          fecha_nacimiento: (this.editing.fecha_nacimiento ?? '').slice(0, 10),
          telefono: this.editing.telefono ?? '',
          direccion: this.editing.direccion ?? '',
        });
      } else {
        this.form.reset({
          nombre: '',
          apellido: '',
          ci: '',
          fecha_nacimiento: '',
          telefono: '',
          direccion: '',
        });
      }
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

    const payload = this.form.getRawValue() as PacienteCreate;

    const req = this.editing?.id
      ? this.pacientes.actualizar(this.editing.id, payload)
      : this.pacientes.crear(payload);

    req.subscribe({
      next: () => {
        this.saving = false;
        this.saved.emit();
        this.close();
      },
      error: (err) => {
        console.error(err);
        this.saving = false;
        alert('No se pudo guardar el paciente.');
      },
    });
  }
}
