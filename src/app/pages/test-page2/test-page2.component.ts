import {Component, OnInit} from '@angular/core';
import axios from 'axios';

@Component({
  selector: 'app-test-page2',
  templateUrl: './test-page2.component.html',
  styleUrls: ['./test-page2.component.css']
})
export class TestPage2Component implements OnInit {

  httpResult: string;

  constructor() {
  }

  ngOnInit() {
  }

  getUsersFromServer() {
    axios.get('http://localhost:8081/users')
      .then((response) => {
        console.log('***************', response.data.data);
        this.httpResult = JSON.stringify(response.data);
      })
      .catch((error) => {
        console.error('***************', error);
      });
  }
}
