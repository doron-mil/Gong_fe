import {Component, OnInit} from '@angular/core';
import axios from 'axios';
import {JsonConverterService} from '../../utils/json-converter/json-converter.service';

@Component({
  selector: 'app-test-page1',
  templateUrl: './test-page1.component.html',
  styleUrls: ['./test-page1.component.css']
})
export class TestPage1Component implements OnInit {

  isAllOn = false;

  constructor(private jsonConverterService: JsonConverterService) {
  }

  ngOnInit() {
  }

  postToServer() {
    axios.post('http://localhost:8081/relay/toggleSwitch', {
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

  postToServerAll() {
    this.isAllOn = !this.isAllOn;

    axios.post('http://localhost:8081/relay/setAll', {
      value: this.isAllOn,
    })
      .then(function (response) {
        console.log('***************', response);
      })
      .catch(function (error) {
        console.error('***************', error);
      });

    console.log('~~~~~~~~~~~~~~~~~~~~~~~ Post to server');
  }

  testJsonConverter() {
    // this.jsonConverterService.convertTest();
  }
}
