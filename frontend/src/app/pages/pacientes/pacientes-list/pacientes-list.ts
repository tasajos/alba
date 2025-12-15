import { Component, Inject, OnInit, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Pacientes, Paciente } from '../../../services/pacientes';

@Component({
  selector: 'app-pacientes-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pacientes-list.html',
  styleUrl: './pacientes-list.scss',
})
export class PacientesList implements OnInit {
  q = '';
  loading = false;
  data: Paciente[] = [];

  constructor(
    private pacientes: Pacientes,
    @Inject(PLATFORM_ID) private platformId: object,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // ✅ Importante: solo en el browser
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

        // ✅ Asegura refresco visual si SSR/hydration está “especial”
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
}
