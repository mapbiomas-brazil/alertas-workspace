import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertRefinementComponent } from './alert-refinement.component';

describe('AlertRefinementComponent', () => {
  let component: AlertRefinementComponent;
  let fixture: ComponentFixture<AlertRefinementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AlertRefinementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlertRefinementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
