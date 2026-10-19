import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AuthService } from '../../services/auth.service';
import { Profile } from './profile';

describe('Profile', () => {
  it('renders the authenticated user as a read-only profile', () => {
    const auth = {
      currentUser: signal({
        id: 'u1',
        nom: 'Ben Ali',
        prenom: 'Leila',
        email: 'leila@bank.test',
        guichetId: 3,
        isActive: true,
        roles: ['Agent'],
      }),
      role: signal('agent'),
    };
    TestBed.configureTestingModule({ providers: [{ provide: AuthService, useValue: auth }] });
    const fixture = TestBed.createComponent(Profile);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Leila Ben Ali');
    expect(fixture.nativeElement.textContent).toContain('leila@bank.test');
    expect(fixture.nativeElement.querySelector('form')).toBeNull();
  });
});
