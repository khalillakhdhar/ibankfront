import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { Login } from './login';

describe('Login', () => {
  it('renders the backend credential form', () => {
    const auth = {
      error: signal(null),
      loading: signal(false),
      login: vi.fn(() => of({})),
      dashboardUrl: () => '/dashboard/admin',
    };
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: auth }],
    });
    const fixture = TestBed.createComponent(Login);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('input[type="email"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('input[type="password"]')).not.toBeNull();
  });
});
