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

  it('maps every client operation to the deployed clients controller', () => {
    const service = TestBed.inject(ClientService);
    const client = { id: 1, cin: '12345678', nom: 'Ben Salah', prenom: 'Amira', dateNaissance: null, email: null, telephone: '20000000', adresse: null, dateCreation: '', isActive: true };

    service.loadAll();
    let request = http.expectOne('https://bank.135-125-182-42.nip.io/api/Clients');
    expect(request.request.method).toBe('GET');
    request.flush([client]);
    expect(service.clients()).toEqual([client]);

    service.search('Ben Salah');
    request = http.expectOne('https://bank.135-125-182-42.nip.io/api/Clients/search?term=Ben%20Salah');
    expect(request.request.method).toBe('GET');
    request.flush([client]);

    service.loadById(1);
    request = http.expectOne('https://bank.135-125-182-42.nip.io/api/Clients/1');
    request.flush({ ...client, comptes: [] });

    service.create({ cin: client.cin, nom: client.nom, prenom: client.prenom, dateNaissance: null, email: null, telephone: client.telephone, adresse: null }).subscribe();
    request = http.expectOne('https://bank.135-125-182-42.nip.io/api/Clients');
    expect(request.request.method).toBe('POST');
    request.flush(client);

    service.update(1, { nom: client.nom, prenom: client.prenom, dateNaissance: null, email: null, telephone: client.telephone, adresse: null, isActive: false }).subscribe();
    request = http.expectOne('https://bank.135-125-182-42.nip.io/api/Clients/1');
    expect(request.request.method).toBe('PUT');
    request.flush(null);

    service.delete(1).subscribe();
    request = http.expectOne('https://bank.135-125-182-42.nip.io/api/Clients/1');
    expect(request.request.method).toBe('DELETE');
    request.flush(null);
  });

  it('maps account operations to the comptes controller', () => {
    const service = TestBed.inject(CompteService);
    service.loadAll();
    let request = http.expectOne('https://bank.135-125-182-42.nip.io/api/Comptes');
    expect(request.request.method).toBe('GET'); request.flush([]);
    service.loadById(3);
    request = http.expectOne('https://bank.135-125-182-42.nip.io/api/Comptes/3');
    expect(request.request.method).toBe('GET');
    request.flush({
      id: 3, numeroCompte: 'TN3', solde: 0, dateOuverture: '', isActive: true,
      clientId: 1, clientNomComplet: '', typeCompteId: 1, typeCompte: '', guichetId: 1, guichet: '',
    });
    service.create({numeroCompte:'TN3',soldeInitial:0,clientId:1,typeCompteId:1,guichetId:1}).subscribe();
    request=http.expectOne('https://bank.135-125-182-42.nip.io/api/Comptes');expect(request.request.method).toBe('POST');request.flush({id:3,numeroCompte:'TN3',solde:0,dateOuverture:'',isActive:true,clientId:1,clientNomComplet:'',typeCompteId:1,typeCompte:'',guichetId:1,guichet:''});
    service.update(3,{isActive:false}).subscribe();request=http.expectOne('https://bank.135-125-182-42.nip.io/api/Comptes/3');expect(request.request.body).toEqual({isActive:false});request.flush(null);
  });

  it('maps branch operations to the guichets controller', () => {
    const service = TestBed.inject(GuichetService);

    service.delete(2).subscribe();
    const request = http.expectOne('https://bank.135-125-182-42.nip.io/api/Guichets/2');
    expect(request.request.method).toBe('DELETE');
    request.flush(null);
  });

  it('maps account-type operations to the types-comptes controller', () => {
    const service = TestBed.inject(TypeCompteService);

    service.loadAll();
    const request = http.expectOne('https://bank.135-125-182-42.nip.io/api/TypesComptes');
    expect(request.request.method).toBe('GET');
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
    const request = http.expectOne('https://bank.135-125-182-42.nip.io/api/Transactions/virement');
    expect(request.request.method).toBe('POST');
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush({
      id: 1, reference: 'TRX-1', type: 3, montant: 50, dateOperation: '',
      description: null, compteSourceId: 1, compteDestinationId: 2, agentId: 'test-agent',
    });
  });
});
