import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from './services/authentication-service/authentication.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule
  ]
})
export class AppComponent {
  title = 'frontend';

  constructor(private router: Router, private authService: AuthenticationService) {}

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  navigateTo(value) {
    this.router.navigate(['../', value]);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
