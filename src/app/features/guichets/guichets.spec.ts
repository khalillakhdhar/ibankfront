import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { GuichetService } from '../../services/guichet.service';
import { GuichetList } from './guichet-list/guichet-list';
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
});
