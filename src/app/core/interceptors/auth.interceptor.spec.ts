import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '../config/api.config';
import { authInterceptor } from './auth.interceptor';
import { SessionStorageService } from '../services/session-storage.service';
import { HttpClient } from '@angular/common/http';

describe('authInterceptor', () => {
  const apiUrl = 'https://bank.135-125-182-42.nip.io/api';
  let http: HttpClient;
  let controller: HttpTestingController;
  let session: SessionStorageService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        { provide: API_BASE_URL, useValue: apiUrl },
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
    session = TestBed.inject(SessionStorageService);
    session.write({
      token: 'secret-token',
      expiration: new Date(Date.now() + 60_000).toISOString(),
      user: {
        id: '1', nom: 'Admin', prenom: 'Tutoriel', email: 'admin@bank.local',
        guichetId: null, isActive: true, roles: ['Admin'],
      },
    });
  });

  afterEach(() => {
    controller.verify();
    localStorage.clear();
  });

  it('adds the bearer token to API requests', () => {
    http.get(`${apiUrl}/Clients`).subscribe();
    const request = controller.expectOne(`${apiUrl}/Clients`);
    expect(request.request.headers.get('Authorization')).toBe('Bearer secret-token');
    request.flush([]);
  });

  it('does not leak the token to another host', () => {
    http.get('https://example.com/resource').subscribe();
    const request = controller.expectOne('https://example.com/resource');
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush({});
  });

  it('clears the session after an API 401', () => {
    http.get(`${apiUrl}/Clients`).subscribe({ error: () => undefined });
    controller.expectOne(`${apiUrl}/Clients`).flush(
      { message: 'Non autorisé.' },
      { status: 401, statusText: 'Unauthorized' },
    );
    expect(session.read()).toBeNull();
  });
});
