import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { GuichetService } from '../../../services/guichet.service';
import { AgentForm } from './agent-form';
describe('AgentForm', () => {
  it('requires an eight-character password and maps empty guichet to null', () => {
    let body: any;
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            error: signal(null),
            createAgent: (v: any) => {
              body = v;
              return of({});
            },
          },
        },
        { provide: GuichetService, useValue: { guichets: signal([]), loadAll: () => {} } },
      ],
    });
    const f = TestBed.createComponent(AgentForm);
    f.componentInstance.form.setValue({
      nom: 'Ben Salah',
      prenom: 'Amira',
      email: 'amira@bank.local',
      password: 'short',
      guichetId: 0,
    });
    expect(f.componentInstance.form.invalid).toBe(true);
    f.componentInstance.form.controls.password.setValue('Formation123!');
    f.componentInstance.submit();
    expect(body.guichetId).toBeNull();
  });
});
