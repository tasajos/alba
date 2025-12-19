import { Component, EventEmitter, Input, Output, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';

import { Citas, Cita, CitaCreate } from '../../../services/citas';
import { Pacientes, Paciente } from '../../../services/pacientes';
import { Medicos, Medico } from '../../../services/medicos';

@Component({
  selector: 'app-citas-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './citas-form.html',
  styleUrl: './citas-form.scss',
})
export class CitasForm implements OnChanges {
  @Input() open = false;
  @Input() editing: Cita | null = null;

  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  saving = false;
  form: FormGroup;

  // ✅ resultados de autocomplete
  pacientesOptions: Paciente[] = [];
  medicosOptions: Medico[] = [];

  // ✅ control de dropdown
  showPacientes = false;
  showMedicos = false;

  constructor(
    private fb: FormBuilder,
    private citas: Citas,
    private pacientes: Pacientes,
    private medicos: Medicos
  ) {
    this.form = this.fb.group({
      // ✅ lo que se guarda (IDs)
      paciente_id: [null, [Validators.required]],
      medico_id: [null, [Validators.required]],

      // ✅ lo que se escribe (texto)
      paciente_search: ['', [Validators.required]],
      medico_search: ['', [Validators.required]],

      fecha: ['', [Validators.required]],
      motivo: [''],
      estado: ['PROGRAMADA'],
    });

    // 🔎 Autocomplete Pacientes
    this.form.get('paciente_search')!.valueChanges
      .pipe(
        debounceTime(250),
        distinctUntilChanged(),
        switchMap((term: string) => {
          const q = (term || '').trim();
          if (q.length < 2) return of({ data: [] as Paciente[] });
          return this.pacientes.listar(q);
        })
      )
      .subscribe((r: any) => {
        this.pacientesOptions = Array.isArray(r?.data) ? r.data : [];
        this.showPacientes = true;
      });

    // 🔎 Autocomplete Médicos
    this.form.get('medico_search')!.valueChanges
      .pipe(
        debounceTime(250),
        distinctUntilChanged(),
        switchMap((term: string) => {
          const q = (term || '').trim();
          if (q.length < 2) return of({ data: [] as Medico[] });
          return this.medicos.listar(q);
        })
      )
      .subscribe((r: any) => {
        this.medicosOptions = Array.isArray(r?.data) ? r.data : [];
        this.showMedicos = true;
      });
  }

  ngOnChanges(): void {
    if (this.editing) {
      // Si tu API de citas ya te trae paciente_nombre / medico_nombre,
      // úsalos aquí para mostrar texto. Si no, dejamos los inputs vacíos.
      const fechaLocal = this.toDatetimeLocal(this.editing.fecha);

      this.form.patchValue({
        paciente_id: this.editing.paciente_id,
        medico_id: this.editing.medico_id,
        // intenta mostrar nombres si los tienes:
        paciente_search: (this.editing as any).paciente_nombre ?? '',
        medico_search: (this.editing as any).medico_nombre ?? '',
        fecha: fechaLocal,
        motivo: this.editing.motivo ?? '',
        estado: this.editing.estado ?? 'PROGRAMADA',
      });

      this.showPacientes = false;
      this.showMedicos = false;
    } else {
      this.form.reset({
        paciente_id: null,
        medico_id: null,
        paciente_search: '',
        medico_search: '',
        fecha: '',
        motivo: '',
        estado: 'PROGRAMADA',
      });
    }
  }

  // ✅ cuando eligen una opción, guardamos SOLO el id
  selectPaciente(p: Paciente) {
    this.form.patchValue({
      paciente_id: p.id,
      paciente_search: `${p.nombre} ${p.apellido} (ID: ${p.id})`,
    });
    this.showPacientes = false;
  }

  selectMedico(m: Medico) {
    this.form.patchValue({
      medico_id: m.id,
      medico_search: `${m.nombre} ${m.apellido} — ${m.especialidad ?? ''} (ID: ${m.id})`,
    });
    this.showMedicos = false;
  }

  // ✅ si el usuario borra el texto manualmente, invalidamos el ID
  onPacienteTyping() {
    this.form.patchValue({ paciente_id: null }, { emitEvent: false });
  }

  onMedicoTyping() {
    this.form.patchValue({ medico_id: null }, { emitEvent: false });
  }

  close() {
    this.closed.emit();
  }

  submit() {
    // Reglas: debe haber IDs válidos
    if (this.form.invalid || !this.form.value.paciente_id || !this.form.value.medico_id) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    const v = this.form.value as any;

    const payload: CitaCreate = {
      paciente_id: Number(v.paciente_id),
      medico_id: Number(v.medico_id),
      fecha: this.toSqlDatetime(v.fecha),
      motivo: v.motivo || null,
      estado: v.estado || 'PROGRAMADA',
    };

    const req = this.editing?.id
      ? this.citas.actualizar(this.editing.id, payload)
      : this.citas.crear(payload);

    req.subscribe({
      next: () => {
        this.saving = false;
        this.saved.emit();
        this.close();
      },
      error: (err) => {
        console.error(err);
        this.saving = false;
        alert('No se pudo guardar la cita.');
      },
    });
  }

  private toSqlDatetime(dtLocal: string) {
    if (!dtLocal) return '';
    return dtLocal.replace('T', ' ') + ':00';
  }

  private toDatetimeLocal(sql: string) {
    if (!sql) return '';
    const s = sql.includes('T') ? sql : sql.replace(' ', 'T');
    return s.slice(0, 16);
  }

  onPacienteBlur() {
  setTimeout(() => (this.showPacientes = false), 150);
}

onMedicoBlur() {
  setTimeout(() => (this.showMedicos = false), 150);
}

}
