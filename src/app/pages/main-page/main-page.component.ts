import {Component, OnInit} from '@angular/core';
import {StoreService} from '../../services/store.service';
import {Router} from '@angular/router';
import {AuthService} from '../../services/auth.service';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css']
})
export class MainPageComponent implements OnInit {

  constructor(private authService: AuthService,
              private router: Router,
              private storeService: StoreService) {
  }

  ngOnInit() {
    if (!this.authService.loggedIn) {
      this.router.navigate(['login']);
    } else {
      this.storeService.readToStore();
    }
  }

}
