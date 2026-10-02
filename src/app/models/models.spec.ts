import type {
  AuthResponse,
  CreateAgent,
  Login,
  User,
} from './auth.model';
import type {
  Client,
  ClientDetails,
  CreateClient,
  UpdateClient,
} from './client.model';
import type {
  Compte,
  CompteSummary,
  CreateCompte,
  UpdateCompte,
} from './compte.model';
import type {
  CreateGuichet,
  Guichet,
  UpdateGuichet,
} from './guichet.model';
import type {
  Depot,
  Retrait,
  Transaction,
  TypeTransaction,
  Virement,
} from './transaction.model';
import type {
  CreateTypeCompte,
  TypeCompte,
  UpdateTypeCompte,
} from './type-compte.model';

describe('API models', () => {
  it('represent every Bank.Api DTO using its JSON field names', () => {
    const compteSummary: CompteSummary = {
      id: 1,
      numeroCompte: 'TN001',
      solde: 250,
      typeCompte: 'Courant',
      isActive: true,
    };
    const client: Client = {
      id: 1,
      cin: '12345678',
      nom: 'Doe',
      prenom: 'Jane',
      dateNaissance: null,
      email: null,
      telephone: '20000000',
      adresse: null,
      dateCreation: '2026-10-02T10:00:00Z',
      isActive: true,
    };
    const clientDetails: ClientDetails = { ...client, comptes: [compteSummary] };
    const createClient: CreateClient = {
      cin: client.cin,
      nom: client.nom,
      prenom: client.prenom,
      dateNaissance: null,
      email: null,
      telephone: client.telephone,
      adresse: null,
    };
    const updateClient: UpdateClient = {
      nom: client.nom,
      prenom: client.prenom,
      dateNaissance: null,
      email: null,
      telephone: client.telephone,
      adresse: null,
      isActive: true,
    };

    const user: User = {
      id: 'agent-1',
      nom: 'Doe',
      prenom: 'John',
      email: 'john@example.com',
      guichetId: null,
      isActive: true,
      roles: ['Agent'],
    };
    const login: Login = { email: user.email, password: 'password' };
    const createAgent: CreateAgent = {
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      password: login.password,
      guichetId: null,
    };
    const authResponse: AuthResponse = {
      token: 'jwt',
      expiration: '2026-10-02T11:00:00Z',
      user,
    };

    const compte: Compte = {
      id: 1,
      numeroCompte: 'TN001',
      solde: 250,
      dateOuverture: '2026-10-02T10:00:00Z',
      isActive: true,
      clientId: 1,
      clientNomComplet: 'Jane Doe',
      typeCompteId: 1,
      typeCompte: 'Courant',
      guichetId: 1,
      guichet: 'Centre',
    };
    const createCompte: CreateCompte = {
      numeroCompte: compte.numeroCompte,
      soldeInitial: 250,
      clientId: 1,
      typeCompteId: 1,
      guichetId: 1,
    };
    const updateCompte: UpdateCompte = { isActive: false };

    const guichet: Guichet = {
      id: 1,
      code: 'G01',
      nom: 'Centre',
      adresse: '1 Main Street',
      ville: 'Tunis',
      telephone: null,
      isActive: true,
      dateCreation: '2026-10-02T10:00:00Z',
      nombreAgents: 2,
    };
    const createGuichet: CreateGuichet = {
      code: guichet.code,
      nom: guichet.nom,
      adresse: guichet.adresse,
      ville: guichet.ville,
      telephone: null,
    };
    const updateGuichet: UpdateGuichet = {
      nom: guichet.nom,
      adresse: guichet.adresse,
      ville: guichet.ville,
      telephone: null,
      isActive: true,
    };

    const typeCompte: TypeCompte = {
      id: 1,
      code: 'CUR',
      libelle: 'Courant',
      description: null,
      soldeMinimum: 0,
      fraisMensuels: 5,
      isActive: true,
    };
    const createTypeCompte: CreateTypeCompte = {
      code: typeCompte.code,
      libelle: typeCompte.libelle,
      description: null,
      soldeMinimum: 0,
      fraisMensuels: 5,
    };
    const updateTypeCompte: UpdateTypeCompte = {
      libelle: typeCompte.libelle,
      description: null,
      soldeMinimum: 0,
      fraisMensuels: 5,
      isActive: true,
    };

    const transaction: Transaction = {
      id: 1,
      reference: 'TRX-1',
      type: 1 as TypeTransaction,
      montant: 100,
      dateOperation: '2026-10-02T10:00:00Z',
      description: null,
      compteSourceId: 1,
      compteDestinationId: null,
      agentId: user.id,
    };
    const depot: Depot = { compteId: 1, montant: 100, description: null };
    const retrait: Retrait = { compteId: 1, montant: 50, description: null };
    const virement: Virement = {
      compteSourceId: 1,
      compteDestinationId: 2,
      montant: 25,
      description: null,
    };

    expect([
      clientDetails,
      createClient,
      updateClient,
      authResponse,
      createAgent,
      compte,
      createCompte,
      updateCompte,
      guichet,
      createGuichet,
      updateGuichet,
      typeCompte,
      createTypeCompte,
      updateTypeCompte,
      transaction,
      depot,
      retrait,
      virement,
    ]).toHaveLength(18);
  });
});
