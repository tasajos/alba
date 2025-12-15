import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Api } from '../../services/api';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  status = '...';

  constructor(private api: Api) {
    this.api.get<any>('/health').subscribe({
      next: (r) => (this.status = r?.ok ? 'OK ✅' : 'ERROR ❌'),
      error: () => (this.status = 'ERROR ❌'),
    });
  }
}
