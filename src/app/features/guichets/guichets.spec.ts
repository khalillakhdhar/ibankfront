import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { GuichetService } from '../../services/guichet.service';
import { GuichetList } from './guichet-list/guichet-list';
import { GuichetForm } from './guichet-form/guichet-form';
import { of } from 'rxjs';
describe('Guichets', () => {
  it('renders API branches', () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: GuichetService,
          useValue: {
            guichets: signal([
              {
                id: 1,
                code: 'TUN',
                nom: 'Tunis Centre',
                ville: 'Tunis',
                adresse: 'Centre',
                telephone: null,
                isActive: true,
                nombreAgents: 2,
              },
            ]),
            loading: signal(false),
            error: signal(null),
            loadAll: () => {},
          },
        },
      ],
    });
    const f = TestBed.createComponent(GuichetList);
    f.detectChanges();
    expect(f.nativeElement.textContent).toContain('Tunis Centre');
  });

  it('loads and prefills a branch in edit mode', () => {
    let loadedId: number | null = null;
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '2' } } } },
        {
          provide: GuichetService,
          useValue: {
            selectedGuichet: signal({ id: 2, code: 'TUN', nom: 'Centre', adresse: 'A', ville: 'Tunis', telephone: null, isActive: true }),
            error: signal(null),
            loadById: (id: number) => (loadedId = id),
            create: () => of(null),
            update: () => of(null),
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(GuichetForm);
    fixture.detectChanges();
    expect(loadedId).toBe(2);
    expect(fixture.componentInstance.form.value.nom).toBe('Centre');
  });
});
