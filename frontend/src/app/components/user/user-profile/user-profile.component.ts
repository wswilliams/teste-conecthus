import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { ActivatedRoute, Params } from '@angular/router';
import { UserService, UserData } from 'src/app/services/user-service/user.service';
import { map, switchMap } from 'rxjs/operators';
import { User } from 'src/app/model/user.interface';
import { PageEvent, MatPaginatorModule } from '@angular/material/paginator';
import { WINDOW } from 'src/app/window-token';
import { Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
  standalone: true,
  imports: [CommonModule, MatCardModule, MatPaginatorModule]
})
export class UserProfileComponent {

  origin = environment.apiUrl;

  private userId$: Observable<number> = this.activatedRoute.params.pipe(
    map((params: Params) => parseInt(params['id']))
  )

  user$: Observable<User> = this.userId$.pipe(
    switchMap((userId: number) => this.userService.findOne(userId))
  )

  users$?: Observable<UserData>;
  pageSize = 10;
  pageIndex = 0;

  constructor(
    private activatedRoute: ActivatedRoute,
    private userService: UserService,
    @Inject(WINDOW) private window: Window
  ) {
    this.users$ = this.userService.findAll(1, this.pageSize);
  }

  onPaginateChange(event: PageEvent) {
    const page = event.pageIndex + 1;
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.users$ = this.userService.findAll(page, event.pageSize);
  }
}
