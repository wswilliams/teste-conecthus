import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthenticationService } from 'src/app/services/authentication-service/authentication.service';
import { Router, ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

class CustomValidators {
  static passwordContainsNumber(control: AbstractControl): ValidationErrors {
    const regex= /\d/;

    if(regex.test(control.value) && control.value !== null) {
      return null;
    } else {
      return {passwordInvalid: true};
    }
  }

  static passwordsMatch (control: AbstractControl): ValidationErrors {
    const password = control.get('password').value;
    const confirmPassword = control.get('confirmPassword').value;

    if((password === confirmPassword) && (password !== null && confirmPassword !== null)) {
      return null;
    } else {
      return {passwordsNotMatching: true};
    }
  }
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
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
export class RegisterComponent implements OnInit {

  registerForm: FormGroup;

  constructor(
    private authService: AuthenticationService,
    private formBuilder: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.registerForm = this.formBuilder.group({
      name: [null, [Validators.required]],
      username: [null, [Validators.required]],
      email: [null, [
        Validators.required,
        Validators.email,
        Validators.minLength(6)
      ]],
      password: [null, [
        Validators.required,
        Validators.minLength(3),
        CustomValidators.passwordContainsNumber
      ]],
      confirmPassword: [null, [Validators.required]]
    },{
       validators: CustomValidators.passwordsMatch
    })
  }

  onSubmit(){
    if(this.registerForm.invalid) {
      return;
    }
    console.log(this.registerForm.value);
    this.authService.register(this.registerForm.value).pipe(
      map(user => {
        const from = this.activatedRoute.snapshot.queryParams['from'];
        if (from === 'users') {
          return this.router.navigate(['users']);
        }
        // default: after self-registration, go to login to sign in
        return this.router.navigate(['login']);
      })
    ).subscribe()
  }

}
