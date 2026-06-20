import { Routes } from '@angular/router';
import { OverviewComponent } from './components/overview/overview.component';


export const adminRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: OverviewComponent
  }
];
