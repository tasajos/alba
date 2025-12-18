import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { PacientesList } from './pages/pacientes/pacientes-list/pacientes-list';

export const routes: Routes = [
  { path: '', component: Dashboard },
  { path: 'pacientes', component: PacientesList },
  { path: 'medicos', loadComponent: () => import('./pages/medicos/medicos-list/medicos-list').then(m => m.MedicosList) },
  { path: 'citas', loadComponent: () => import('./pages/citas/citas-list/citas-list').then(m => m.CitasList) },
  { path: '**', redirectTo: '' },
  
 


];
