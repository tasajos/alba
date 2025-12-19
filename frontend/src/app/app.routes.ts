import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { PacientesList } from './pages/pacientes/pacientes-list/pacientes-list';
import { HistorialMedicoComponent } from './pages/pacientes/historial-medico/historial-medico.component';

export const routes: Routes = [
  { path: '', component: Dashboard },
  { path: 'pacientes', component: PacientesList },
  { path: 'medicos', loadComponent: () => import('./pages/medicos/medicos-list/medicos-list').then(m => m.MedicosList) },
  { path: 'citas', loadComponent: () => import('./pages/citas/citas-list/citas-list').then(m => m.CitasList) },
  { path: 'pacientes/:id/historial', component: HistorialMedicoComponent },
  { path: '**', redirectTo: '' },
  
 


];
