import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AgentForm } from './agent-form';
describe('AgentForm without demo data', () => {
  it('keeps empty native fields and no branch records', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const f = TestBed.createComponent(AgentForm);
    f.detectChanges();
    expect(
      Array.from(f.nativeElement.querySelectorAll('input')).every(
        (input: any) => input.value === '',
      ),
    ).toBe(true);
    expect(f.nativeElement.querySelectorAll('select option').length).toBe(1);
  });
});
