import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';
import {JwtHelperService} from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  jwtHelper = new JwtHelperService();
  private role: string;

  constructor(private http: HttpClient) {
  }

  login(username: string, password: string): Observable<boolean> {
    return this.http.post<{ data: { token: string } }>('/api/login', {username: username, password: password})
      .pipe(
        map(result => {
          const token = result.data.token;
          this.setRole(token);
          localStorage.setItem('access_token', token);
          return true;
        })
      );
  }

  logout() {
    localStorage.removeItem('access_token');
  }

  public get loggedIn(): boolean {
    let token = localStorage.getItem('access_token');
    if (token && this.jwtHelper.isTokenExpired(token)) {
      token = null;
      this.logout();
    }
    this.setRole(token);
    return (!!token);
  }

  getRole() {
    let role = null;
    if (this.role || this.loggedIn) {
      role = this.role;
    }
    return role;
  }

  private setRole(aToken: string) {
    if (aToken) {
      const {role} = this.jwtHelper.decodeToken(aToken);
      this.role = role;
    } else {
      this.role = null;
    }
  }
}
