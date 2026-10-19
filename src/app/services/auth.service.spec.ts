import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
  });
  afterEach(() => localStorage.clear());
  it('authenticates against the backend and stores the session', () => {
    const auth = TestBed.inject(AuthService);
    auth.login({ email: 'admin@bank.local', password: 'secret' }).subscribe();
    const request = TestBed.inject(HttpTestingController).expectOne(
      'https://bank.135-125-182-42.nip.io/api/Auth/login',
    );
    request.flush({
      token: 'jwt',
      expiration: new Date(Date.now() + 60000).toISOString(),
      user: {
        id: '1',
        nom: 'Admin',
        prenom: 'Bank',
        email: 'admin@bank.local',
        guichetId: null,
        isActive: true,
        roles: ['Admin'],
      },
    });
    expect(request.request.method).toBe('POST');
    expect(auth.role()).toBe('admin');
    expect(localStorage.getItem('ibank.session')).toContain('jwt');
  });
});
