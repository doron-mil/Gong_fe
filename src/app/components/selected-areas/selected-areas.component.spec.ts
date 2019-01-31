import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectedAreasComponent } from './selected-areas.component';

describe('SelectedAreasComponent', () => {
  let component: SelectedAreasComponent;
  let fixture: ComponentFixture<SelectedAreasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectedAreasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectedAreasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
