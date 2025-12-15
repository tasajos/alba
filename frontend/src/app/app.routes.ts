import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { PacientesList } from './pages/pacientes/pacientes-list/pacientes-list';

export const routes: Routes = [
  { path: '', component: Dashboard },
  { path: 'pacientes', component: PacientesList },
  { path: '**', redirectTo: '' },
];
