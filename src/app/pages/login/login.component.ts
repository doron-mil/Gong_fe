import {Component, OnInit} from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {Router} from '@angular/router';
import {first} from 'rxjs/operators';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  username: string;
  password: string;
  public error: string;

  constructor(private authService: AuthService,
              private router: Router) {

  }

  ngOnInit() {
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
