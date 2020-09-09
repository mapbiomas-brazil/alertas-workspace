import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertAuditingComponent } from './alert-auditing.component';

describe('AlertAuditingComponent', () => {
  let component: AlertAuditingComponent;
  let fixture: ComponentFixture<AlertAuditingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AlertAuditingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlertAuditingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
