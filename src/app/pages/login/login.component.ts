import {Component, OnInit} from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {Router} from '@angular/router';
import {first} from 'rxjs/operators';
import {environment} from '../../../environments/environment';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  username: string;
  password: string;
  public error: string;

  constructor(private authService: AuthService,
              private http: HttpClient,
              private router: Router) {

  }

  ngOnInit() {
    if (!environment.production) {
      this.http.get('assets/p-env/p_config.json')
        .subscribe((pConfig: { username: string, password: string }) => {
            console.log('aaaa', pConfig);
            const {username, password} = pConfig;
            this.username = username;
            this.password = password;
          },
          (error) => {
            console.error('ERROR : p_config is only for DEV mode and is privately and locally constructed', error);
          });
    }

    if (this.authService.loggedIn) {
      this.router.navigate(['mainPage']);
    }
  }

  login() {
    this.authService.login(this.username, this.password)
      .pipe(first())
      .subscribe(
        result => {
          this.router.navigate(['mainPage']);
        },
        err => this.error = 'Could not authenticate');

  }
}
