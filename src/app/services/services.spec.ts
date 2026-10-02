import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ClientService } from './client.service';
import { CompteService } from './compte.service';
import { GuichetService } from './guichet.service';
import { TransactionService } from './transaction.service';
import { TypeCompteService } from './type-compte.service';

describe('API services', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('maps client operations to the clients controller without authorization', () => {
    const service = TestBed.inject(ClientService);

    service.loadAll();
    let request = http.expectOne('http://localhost:5176/api/clients');
    expect(request.request.method).toBe('GET');
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush([]);

    service.search('Doe');
    request = http.expectOne('http://localhost:5176/api/clients/search?term=Doe');
    expect(request.request.method).toBe('GET');
    request.flush([]);
  });

  it('maps account operations to the comptes controller', () => {
    const service = TestBed.inject(CompteService);

    service.loadById(3);
    const request = http.expectOne('http://localhost:5176/api/comptes/3');
    expect(request.request.method).toBe('GET');
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush({
      id: 3, numeroCompte: 'TN3', solde: 0, dateOuverture: '', isActive: true,
      clientId: 1, clientNomComplet: '', typeCompteId: 1, typeCompte: '', guichetId: 1, guichet: '',
    });
  });

  it('maps branch operations to the guichets controller', () => {
    const service = TestBed.inject(GuichetService);

    service.delete(2).subscribe();
    const request = http.expectOne('http://localhost:5176/api/guichets/2');
    expect(request.request.method).toBe('DELETE');
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush(null);
  });

  it('maps account-type operations to the types-comptes controller', () => {
    const service = TestBed.inject(TypeCompteService);

    service.loadAll();
    const request = http.expectOne('http://localhost:5176/api/typescomptes');
    expect(request.request.method).toBe('GET');
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush([]);
  });

  it('maps transaction operations to the transactions controller', () => {
    const service = TestBed.inject(TransactionService);

    service.virement({
      compteSourceId: 1,
      compteDestinationId: 2,
      montant: 50,
      description: null,
    }).subscribe();
    const request = http.expectOne('http://localhost:5176/api/transactions/virement');
    expect(request.request.method).toBe('POST');
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush({
      id: 1, reference: 'TRX-1', type: 3, montant: 50, dateOperation: '',
      description: null, compteSourceId: 1, compteDestinationId: 2, agentId: 'test-agent',
    });
  });
});
