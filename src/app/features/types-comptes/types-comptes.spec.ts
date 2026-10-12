import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { TypeCompteService } from '../../services/type-compte.service';
import { TypeCompteList } from './type-compte-list/type-compte-list';
import { TypeCompteForm } from './type-compte-form/type-compte-form';
import { of } from 'rxjs';
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

  it('loads and prefills an account type in edit mode', () => {
    let loadedId: number | null = null;
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '3' } } } },
        {
          provide: TypeCompteService,
          useValue: {
            selectedTypeCompte: signal({ id: 3, code: 'CUR', libelle: 'Courant', description: null, soldeMinimum: 0, fraisMensuels: 5, isActive: true }),
            error: signal(null),
            loadById: (id: number) => (loadedId = id),
            create: () => of(null),
            update: () => of(null),
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(TypeCompteForm);
    fixture.detectChanges();
    expect(loadedId).toBe(3);
    expect(fixture.componentInstance.form.value.libelle).toBe('Courant');
  });
});
