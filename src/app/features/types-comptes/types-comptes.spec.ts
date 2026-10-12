import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { TypeCompteService } from '../../services/type-compte.service';
import { TypeCompteList } from './type-compte-list/type-compte-list';
describe('TypesComptes', () => {
  it('renders API account types', () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: TypeCompteService,
          useValue: {
            typesCompte: signal([
              {
                id: 1,
                code: 'CUR',
                libelle: 'Courant',
                description: null,
                soldeMinimum: 0,
                fraisMensuels: 5,
                isActive: true,
              },
            ]),
            loading: signal(false),
            error: signal(null),
            loadAll: () => {},
          },
        },
      ],
    });
    const f = TestBed.createComponent(TypeCompteList);
    f.detectChanges();
    expect(f.nativeElement.textContent).toContain('Courant');
  });
});
