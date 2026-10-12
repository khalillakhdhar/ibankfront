import { TestBed } from '@angular/core/testing';
import { AuthResponse } from '../../models/auth.model';
import { SessionStorageService } from './session-storage.service';

const validSession = (): AuthResponse => ({
  token: 'jwt-token',
  expiration: new Date(Date.now() + 60_000).toISOString(),
  user: {
    id: 'agent-1',
    nom: 'Administrateur',
    prenom: 'Principal',
    email: 'admin@bank.local',
    guichetId: null,
    isActive: true,
    roles: ['Admin'],
  },
});

describe('SessionStorageService', () => {
  let service: SessionStorageService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(SessionStorageService);
  });

  afterEach(() => localStorage.clear());

  it('round-trips a valid complete session', () => {
    const session = validSession();
    service.write(session);
    expect(service.read()).toEqual(session);
  });

  it('clears corrupt JSON instead of crashing startup', () => {
    localStorage.setItem('ibank.session', '{invalid');
    expect(service.read()).toBeNull();
    expect(localStorage.getItem('ibank.session')).toBeNull();
  });

  it('clears a partial session', () => {
    localStorage.setItem('ibank.session', JSON.stringify({ token: 'jwt-token' }));
    expect(service.read()).toBeNull();
    expect(localStorage.getItem('ibank.session')).toBeNull();
  });

  it('clears a session whose user or roles are only partially shaped', () => {
    const session = validSession();
    localStorage.setItem(
      'ibank.session',
      JSON.stringify({ ...session, user: { id: '1', email: 'admin@bank.local', roles: [7] } }),
    );
    expect(service.read()).toBeNull();
    expect(localStorage.getItem('ibank.session')).toBeNull();
  });

  it('clears an expired session', () => {
    const session = validSession();
    session.expiration = new Date(Date.now() - 60_000).toISOString();
    localStorage.setItem('ibank.session', JSON.stringify(session));
    expect(service.read()).toBeNull();
    expect(localStorage.getItem('ibank.session')).toBeNull();
  });
});
