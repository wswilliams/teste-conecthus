import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { User } from 'src/app/model/user.interface';
import { environment } from 'src/environments/environment';

export interface UserData {
  items: User[],
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  }, 
  links: {
    first: string;
    previous: string;
    next: string;
    last: string;
  }
};

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private readonly baseUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) { }

  findOne(id: number): Observable<User> {
    return this.http.get(`${this.baseUrl}/${id}`).pipe(
      map((user:User) => user)
    )
  }

  updateOne(user): Observable<User> {
    return this.http.put(`${this.baseUrl}/${user.id}`, user);
  }

  findAll(page: number, size: number): Observable<UserData> {
    let params = new HttpParams();

    params = params.append('page', String(page));
    params = params.append('limit', String(size));

    return this.http.get(`${this.baseUrl}`, {params}).pipe(
      map((userData: UserData) => userData),
      catchError(err => throwError(err))
    )
  }

  uploadProfileImage(formData: FormData): Observable<any> {
    return this.http.post<FormData>(`${this.baseUrl}/upload`, formData, {
      reportProgress: true,
      observe: 'events'
    })
  }

  paginateByName(page: number, size: number, username: string): Observable<UserData> {
    let params = new HttpParams();

    params = params.append('page', String(page));
    params = params.append('limit', String(size));
    params = params.append('username', username);

    return this.http.get(`${this.baseUrl}`, {params}).pipe(
      map((userData: UserData) => userData),
      catchError(err => throwError(err))
    )
  }

  deleteOne(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`).pipe(
      catchError(err => throwError(err))
    )
  }
}
