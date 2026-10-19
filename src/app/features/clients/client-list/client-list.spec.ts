import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ClientService } from '../../../services/client.service';
import { ClientList } from './client-list';

describe('ClientList', () => {
  it('loads and renders clients returned by the API service', () => {
    const clients = signal([
      {
        id: 7,
        cin: 'AA1234',
        nom: 'Ben Ali',
        prenom: 'Leila',
        dateNaissance: null,
        email: 'leila@example.test',
        telephone: '20111222',
        adresse: null,
        dateCreation: '2026-01-01',
        isActive: true,
      },
    ]);
    const service = {
      clients,
      loading: signal(false),
      error: signal<string | null>(null),
      loadAll: vi.fn(),
      search: vi.fn(),
      delete: vi.fn(() => of(void 0)),
    };
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: ClientService, useValue: service }],
    });
    const fixture = TestBed.createComponent(ClientList);
    fixture.detectChanges();
    expect(service.loadAll).toHaveBeenCalledOnce();
    expect(fixture.nativeElement.textContent).toContain('Leila Ben Ali');
    expect(fixture.nativeElement.textContent).toContain('AA1234');
  });
});
