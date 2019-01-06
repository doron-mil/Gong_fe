import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AutomaticActivationComponent } from './automatic-activation.component';

describe('AutomaticActivationComponent', () => {
  let component: AutomaticActivationComponent;
  let fixture: ComponentFixture<AutomaticActivationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AutomaticActivationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AutomaticActivationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
