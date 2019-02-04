import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GongsTimeTableComponent } from './gongs-time-table.component';

describe('GongsTimeTableComponent', () => {
  let component: GongsTimeTableComponent;
  let fixture: ComponentFixture<GongsTimeTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GongsTimeTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GongsTimeTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
