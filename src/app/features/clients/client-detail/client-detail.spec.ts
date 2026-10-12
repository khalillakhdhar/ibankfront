import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ClientService } from '../../../services/client.service';
import { ClientDetail } from './client-detail';
describe('ClientDetail', () => {
  it('renders accounts returned in client details', () => {
    const service = {
      selectedClient: signal({
        id: 1,
        cin: '1',
        nom: 'Ben Salah',
        prenom: 'Amira',
        telephone: '2',
        email: null,
        adresse: null,
        dateNaissance: null,
        dateCreation: '',
        isActive: true,
        comptes: [
          { id: 2, numeroCompte: 'TN001', solde: 100, typeCompte: 'Courant', isActive: true },
        ],
      }),
      loading: signal(false),
      error: signal(null),
      loadById: () => {},
    };
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: ClientService, useValue: service }],
    });
    const f = TestBed.createComponent(ClientDetail);
    f.detectChanges();
    expect(f.nativeElement.textContent).toContain('TN001');
  });
});
