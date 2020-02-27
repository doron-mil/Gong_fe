import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {first, map} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';
import {JwtHelperService} from '@auth0/angular-jwt';
import {StoreService} from './store.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  jwtHelper = new JwtHelperService();
  private user: string;
  private role: string;

  constructor(private http: HttpClient, private storeService: StoreService) {
  }

  login(username: string, password: string): Observable<boolean> {
    return this.http.post<{ data: { token: string } }>('/api/login',
      {username: username.trim().toLowerCase(), password: password})
      .pipe(
        first(),
        map(result => {
          const token = result.data.token;
          this.setRole(token);
          localStorage.setItem('access_token', token);
          this.storeService.setLoggedIn(true);
          this.storeService.getBasicData();
          return true;
        })
      );
  }

  logout() {
    this.storeService.setLoggedIn(false);
    localStorage.removeItem('access_token');
  }

  public get loggedIn(): boolean {
    let token = localStorage.getItem('access_token');
    if (token && this.jwtHelper.isTokenExpired(token)) {
      token = null;
      this.logout();
    }
    this.setRole(token);
    const isLoggedIn = !!token;
    if (this.storeService.getIsLoggedIn() !== isLoggedIn) {
      this.storeService.setLoggedIn(isLoggedIn);
    }
    return (isLoggedIn);
  }

  getRole(): string {
    let role = null;
    if (this.role || this.loggedIn) {
      role = this.role;
    }
    return role;
  }

  getUser(): string {
    let user = null;
    if (this.user || this.loggedIn) {
      user = this.user;
    }
    return user;
  }

  private setRole(aToken: string) {
    if (aToken) {
      const {sub, role} = this.jwtHelper.decodeToken(aToken);
      this.user = sub;
      this.role = role;
    } else {
      this.user = null;
      this.role = null;
    }
  }
}
