import { TestBed } from '@angular/core/testing';

import { GeeAuthService } from './gee-auth.service';

describe('GeeAuthService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GeeAuthService = TestBed.get(GeeAuthService);
    expect(service).toBeTruthy();
  });
});
