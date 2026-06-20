import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication-service/authentication.service';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule
  ]
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  
  constructor(
    private authService: AuthenticationService,
    private formBuilder: FormBuilder,
    private router: Router
    ) { }

  ngOnInit(): void {
    this.loginForm = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email, Validators.minLength(6)]),
      password: new FormControl(null, [Validators.required, Validators.minLength(3)])
    })
  }

  onSubmit() {
    if(this.loginForm.invalid) {
      return;
    }
    this.authService.login(this.loginForm.value).pipe(
      map(token => this.router.navigate(['home']))
    ).subscribe()
  }

  btnInscrever() {
    this.router.navigate(['register'], { queryParams: { from: 'login' } });
  }

}
