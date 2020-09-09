import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamSaveComponent } from './team-save.component';

describe('TeamSaveComponent', () => {
  let component: TeamSaveComponent;
  let fixture: ComponentFixture<TeamSaveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeamSaveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamSaveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
