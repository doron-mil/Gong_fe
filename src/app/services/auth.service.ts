import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {BehaviorSubject, from, Observable, Subject} from 'rxjs';
import {first, map} from 'rxjs/operators';
import {JwtHelperService} from '@auth0/angular-jwt';
import * as _ from 'lodash';

import {StoreService} from './store.service';
import {Permission} from '../model/permission';
import {IObjectMap} from '../model/store-model';
import {GongType} from '../model/gongType';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  jwtHelper = new JwtHelperService();
  private user: string;
  private role: string;

  permissionObjectMap: IObjectMap<Subject<Permission>> = {};

  constructor(private http: HttpClient, private storeService: StoreService) {
    this.storeService.getPermissions().subscribe((permissionsArray: Permission[]) => {
      permissionsArray.forEach((permission: Permission) => {
        if (!this.permissionObjectMap[permission.action]) {
          this.permissionObjectMap[permission.action] = new BehaviorSubject<Permission>(_.cloneDeep(permission));
        }
        this.permissionObjectMap[permission.action].next(_.cloneDeep(permission));
      });
    });
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

  hasPermission(aAction: string): Observable<boolean> {
    if (this.role || this.loggedIn) {
      if (this.role === 'dev') {
        return from([true]);
      } else {
        let permissionForActionSubject = this.permissionObjectMap[aAction];
        if (!permissionForActionSubject) {
          this.permissionObjectMap[aAction] = permissionForActionSubject = new BehaviorSubject<Permission>(new Permission());
        }
        return permissionForActionSubject.pipe(
          map(permissionForAction => !!permissionForAction && !!permissionForAction.roles &&
            permissionForAction.roles.includes(this.role))
        );
      }
    }
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
