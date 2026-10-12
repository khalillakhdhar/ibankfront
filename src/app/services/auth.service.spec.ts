import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '../core/config/api.config';
import { AuthResponse, CreateAgent } from '../models/auth.model';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const apiUrl = 'https://bank.135-125-182-42.nip.io/api';
  const response: AuthResponse = {
    token: 'jwt-token',
    expiration: new Date(Date.now() + 60_000).toISOString(),
    user: {
      id: 'admin-1',
      nom: 'Administrateur',
      prenom: 'Principal',
      email: 'admin@bank.local',
      guichetId: null,
      isActive: true,
      roles: ['Admin'],
    },
  };
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        { provide: API_BASE_URL, useValue: apiUrl },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('posts credentials, persists the response, and exposes authenticated state', () => {
    const service = TestBed.inject(AuthService);
    service.login({ email: 'admin@bank.local', password: 'Admin123!' }).subscribe();

    const request = http.expectOne(`${apiUrl}/Auth/login`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ email: 'admin@bank.local', password: 'Admin123!' });
    request.flush(response);

    expect(service.user()).toEqual(response.user);
    expect(service.token()).toBe('jwt-token');
    expect(service.isAuthenticated()).toBe(true);
    expect(JSON.parse(localStorage.getItem('ibank.session')!)).toEqual(response);
  });

  it('restores a valid session when it is created', () => {
    localStorage.setItem('ibank.session', JSON.stringify(response));
    const service = TestBed.inject(AuthService);
    expect(service.user()).toEqual(response.user);
    expect(service.isAuthenticated()).toBe(true);
  });

  it('creates an agent using the documented endpoint', () => {
    const service = TestBed.inject(AuthService);
    const agent: CreateAgent = {
      nom: 'Ben Salah',
      prenom: 'Amira',
      email: 'amira@bank.local',
      password: 'Formation123!',
      guichetId: null,
    };
    service.createAgent(agent).subscribe();
    const request = http.expectOne(`${apiUrl}/Auth/agent`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(agent);
    request.flush({ ...response.user, id: 'agent-2', email: agent.email, roles: ['Agent'] });
  });

  it('clears signals and storage on logout', () => {
    localStorage.setItem('ibank.session', JSON.stringify(response));
    const service = TestBed.inject(AuthService);
    service.logout();
    expect(service.user()).toBeNull();
    expect(service.token()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
    expect(localStorage.getItem('ibank.session')).toBeNull();
  });

  it('checks role membership case-sensitively', () => {
    localStorage.setItem('ibank.session', JSON.stringify(response));
    const service = TestBed.inject(AuthService);
    expect(service.hasRole('Admin')).toBe(true);
    expect(service.hasRole('admin')).toBe(false);
    expect(service.hasRole('Agent')).toBe(false);
  });
});
