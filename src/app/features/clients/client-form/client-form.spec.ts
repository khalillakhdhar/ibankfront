import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of, Subject } from 'rxjs';
import { ClientService } from '../../../services/client.service';
import { ClientForm } from './client-form';
describe('ClientForm', () => {
  it('normalizes optional blanks and blocks duplicate submission', () => {
    const pending = new Subject<any>();
    let body: any;
    let calls = 0;
    const service = {
      selectedClient: signal(null),
      loadById: () => {},
      create: (value: any) => {
        body = value;
        calls++;
        return pending;
      },
      update: () => of(null),
    };
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: ClientService, useValue: service }],
    });
    const f = TestBed.createComponent(ClientForm);
    f.componentInstance.form.patchValue({
      cin: '12345678',
      nom: 'Ben Salah',
      prenom: 'Amira',
      telephone: '20000000',
      email: '',
      adresse: '',
      dateNaissance: '',
    });
    f.componentInstance.submit();
    f.componentInstance.submit();
    expect(calls).toBe(1);
    expect(body.email).toBeNull();
    expect(body.adresse).toBeNull();
  });

  it('prefills the form when editing a loaded client', () => {
    const selectedClient = signal<any>({
      id: 4,
      cin: '12345678',
      nom: 'Ben Salah',
      prenom: 'Amira',
      dateNaissance: '1990-01-01',
      email: 'amira@example.com',
      telephone: '20000000',
      adresse: 'Tunis',
      isActive: true,
      comptes: [],
    });
    let loadedId: number | null = null;
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => '4' } } },
        },
        {
          provide: ClientService,
          useValue: {
            selectedClient,
            error: signal(null),
            loadById: (id: number) => (loadedId = id),
            create: () => of(null),
            update: () => of(null),
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(ClientForm);
    fixture.detectChanges();
    expect(loadedId).toBe(4);
    expect(fixture.componentInstance.form.getRawValue()).toEqual(
      expect.objectContaining({ cin: '12345678', nom: 'Ben Salah', prenom: 'Amira' }),
    );
  });
});
