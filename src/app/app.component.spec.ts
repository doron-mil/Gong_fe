import { TestBed, async } from '@angular/core/testing';
import { AppComponent } from './app.component';
import {NgReduxTestingModule} from '@angular-redux/store/testing';
import {TranslateService} from '@ngx-translate/core';
import {Observable} from 'rxjs';
import 'rxjs/add/observable/of';


export class TranslateServiceStub {

  public get(key: any): any {
    // @ts-ignore
    Observable.of(key);
  }

  public setDefaultLang(key: any): any {
  }

  public use(key: any): any {
  }
}

describe('AppComponent', () => {
  beforeEach(async(() => {
    // TestBed.compileComponents();
    TestBed.configureTestingModule({
      declarations: [
        AppComponent,
      ],
      imports: [NgReduxTestingModule],
      providers: [
        {provide: TranslateService, useClass: TranslateServiceStub},
      ]
    }).compileComponents();
  }));

  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture).toMatchSnapshot();
  }));

  it(`should have as title 'app'`, async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app.title).toEqual('app');
  }));
});
