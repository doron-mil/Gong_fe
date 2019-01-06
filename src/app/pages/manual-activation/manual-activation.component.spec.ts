import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualActivationComponent } from './manual-activation.component';

describe('ManualActivationComponent', () => {
  let component: ManualActivationComponent;
  let fixture: ComponentFixture<ManualActivationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManualActivationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManualActivationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
