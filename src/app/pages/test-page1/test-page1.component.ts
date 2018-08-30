import {Component, OnInit} from '@angular/core';
import axios from 'axios';

@Component({
  selector: 'app-test-page1',
  templateUrl: './test-page1.component.html',
  styleUrls: ['./test-page1.component.css']
})
export class TestPage1Component implements OnInit {

  constructor() {
  }

  ngOnInit() {
  }

  postToServer() {
    axios.post('http://localhost:8081/toggleSwitch', {
      switch: 3,
    })
      .then(function (response) {
        console.log('***************', response);
      })
      .catch(function (error) {
        console.error('***************', error);
      });

    console.log('~~~~~~~~~~~~~~~~~~~~~~~ Post to server');
  }

}
