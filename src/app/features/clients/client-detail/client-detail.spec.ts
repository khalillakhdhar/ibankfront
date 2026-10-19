import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { ClientService } from '../../../services/client.service';
import { ClientDetail } from './client-detail';

describe('ClientDetail', () => {
  it('loads the route client and renders its identity', () => {
    const selectedClient = signal({
      id: 7,
      cin: 'AA1234',
      nom: 'Ben Ali',
      prenom: 'Leila',
      dateNaissance: null,
      email: null,
      telephone: '20111222',
      adresse: null,
      dateCreation: '2026-01-01',
      isActive: true,
      comptes: [],
    });
    const service = {
      selectedClient,
      loading: signal(false),
      error: signal<string | null>(null),
      loadById: vi.fn(),
    };
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: ClientService, useValue: service },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '7' } } } },
      ],
    });
    const fixture = TestBed.createComponent(ClientDetail);
    fixture.detectChanges();
    expect(service.loadById).toHaveBeenCalledWith(7);
    expect(fixture.nativeElement.textContent).toContain('Leila Ben Ali');
  });
});
