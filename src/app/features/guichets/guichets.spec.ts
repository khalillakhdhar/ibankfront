import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { GuichetList } from './guichet-list/guichet-list';
describe('Branches without demo data', () => {
  it('keeps branch navigation and an empty state', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const f = TestBed.createComponent(GuichetList);
    f.detectChanges();
    expect(f.nativeElement.textContent).toContain('Aucun guichet à afficher');
    expect(f.nativeElement.querySelectorAll('article').length).toBe(0);
  });
});
