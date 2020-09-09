import { TestBed } from '@angular/core/testing';

import { AuthGoogleService } from './auth-google.service';

describe('AuthGoogleService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AuthGoogleService = TestBed.get(AuthGoogleService);
    expect(service).toBeTruthy();
  });
});
