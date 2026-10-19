import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TypeCompteList } from './type-compte-list/type-compte-list';
describe('Account types without demo data', () => {
  it('keeps product columns and no rows', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const f = TestBed.createComponent(TypeCompteList);
    f.detectChanges();
    expect(f.nativeElement.querySelectorAll('tbody tr').length).toBe(0);
    expect(f.nativeElement.textContent).toContain('Aucun type de compte à afficher');
  });
});
