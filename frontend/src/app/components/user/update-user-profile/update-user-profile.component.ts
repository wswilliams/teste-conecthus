import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthenticationService } from 'src/app/services/authentication-service/authentication.service';
import { UserService } from 'src/app/services/user-service/user.service';
import { switchMap, tap, map, catchError } from 'rxjs/operators';
import { HttpEventType, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { User } from 'src/app/model/user.interface';
import { WINDOW } from 'src/app/window-token';
import { Inject } from '@angular/core';
import { environment } from 'src/environments/environment';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';

export interface File {
  data: any;
  progress: number;
  inProgress: boolean;
}

@Component({
  selector: 'app-update-user-profile',
  templateUrl: './update-user-profile.component.html',
  styleUrls: ['./update-user-profile.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatCardModule, MatProgressBarModule, MatIconModule]
})
export class UpdateUserProfileComponent implements OnInit {

  @ViewChild("fileUpload", {static: false}) fileUpload: ElementRef;

  file: File = {
    data: null,
    inProgress: false,
    progress: 0
  };

  form: FormGroup;

  origin = environment.apiUrl;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthenticationService,
    private userService: UserService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    @Inject(WINDOW) private window: Window
  ) { }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      id: [{value: null, disabled: true}, [Validators.required]],
      name: [null, [Validators.required]],
      username: [null, [Validators.required]],
      profileImage: [null]
    });

    // Verifica se há um ID nos query params (quando editando outro usuário)
    // Se não houver, usa o ID do usuário autenticado (seu próprio perfil)
    this.activatedRoute.queryParams.pipe(
      switchMap(params => {
        const idParam = params['id'];
        return idParam ? of(idParam) : this.authService.getUserId();
      }),
      switchMap((id: number) => this.userService.findOne(id).pipe(
        tap((user: User) => {
          this.form.patchValue({
            id: user.id,
            name: user.name,
            username: user.username,
            profileImage: user.profileImage
          })
        })
      ))
    ).subscribe()
  }

  onClick() {
    const fileInput = this.fileUpload.nativeElement;
    fileInput.click();
    fileInput.onchange = () => {
      this.file = {
        data: fileInput.files[0],
        inProgress: false,
        progress: 0
      };
      this.fileUpload.nativeElement.value = '';
      this.uploadFile();
    }
  }

  uploadFile() {
    const formData = new FormData();
    formData.append('file', this.file.data);
    this.file.inProgress = true;

    this.userService.uploadProfileImage(formData).pipe(
      map((event) => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            this.file.progress = Math.round(event.loaded * 100 / event.total);
            break;
          case HttpEventType.Response:
            return event;
        }
      }),
      catchError((error: HttpErrorResponse) => {
        this.file.inProgress = false;
        return of('Upload failed');
      })).subscribe((event: any) => {
        if(typeof (event) === 'object') {
          this.form.patchValue({profileImage: event.body.profileImage});
        }
      })
  }

  update() {
    this.userService.updateOne(this.form.getRawValue()).subscribe(
      () => {
        this.router.navigate(['users']);
      },
      (error) => {
        console.error('Erro ao atualizar usuário:', error);
        alert('Erro ao atualizar usuário');
      }
    );
  }

}
