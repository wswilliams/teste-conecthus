import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserData, UserService } from 'src/app/services/user-service/user.service';
import { map, tap, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { PageEvent, MatPaginatorModule } from '@angular/material/paginator';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, MatTableModule, MatPaginatorModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatTooltipModule]
})
export class UsersComponent implements OnInit, OnDestroy {

  filterValue: string = null;
  dataSource: UserData = null;
  pageEvent: PageEvent;
  displayedColumns: string[] = ['id', 'name', 'username', 'email', 'role', 'actions'];
  
  private filterSubject = new Subject<string>();
  private destroy = new Subject<void>();

  constructor(private userService: UserService, private router: Router, private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.initDataSource();
    
    // Configura o debounce para o filtro
    this.filterSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      tap((value: string) => {
        if (value && value.trim() !== '') {
          this.findByName(value);
        } else {
          this.initDataSource();
        }
      })
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  initDataSource() {
    this.userService.findAll(1, 10).pipe(
      map((userData: UserData) => this.dataSource = userData)
    ).subscribe();
  }

  onFilterChange(value: string) {
    this.filterValue = value;
    this.filterSubject.next(value);
  }

  onPaginateChange(event: PageEvent) {
    let page = event.pageIndex;
    let size = event.pageSize;

    if (!this.filterValue || this.filterValue.trim() === '') {
      page = page + 1;
      this.userService.findAll(page, size).pipe(
        map((userData: UserData) => this.dataSource = userData)
      ).subscribe();
    } else {
      this.userService.paginateByName(page, size, this.filterValue).pipe(
        map((userData: UserData) => this.dataSource = userData)
      ).subscribe();
    }
  }

  findByName(username: string) {
    this.userService.paginateByName(0, 10, username).pipe(
      map((userData: UserData) => this.dataSource = userData)
    ).subscribe();
  }

  createNewUser() {
    this.router.navigate(['/register'], { queryParams: { from: 'users' } });
  }

  editUser(id: number) {
    this.router.navigate(['/update-profile'], { queryParams: { id: id } });
  }

  deleteUser(id: number) {
    if(confirm('Tem certeza que deseja deletar este usuário?')) {
      this.userService.deleteOne(id).subscribe(
        () => {
          alert('Usuário deletado com sucesso!');
          this.initDataSource();
        },
        (error) => {
          console.error('Erro ao deletar usuário:', error);
          alert('Erro ao deletar usuário');
        }
      );
    }
  }

}
