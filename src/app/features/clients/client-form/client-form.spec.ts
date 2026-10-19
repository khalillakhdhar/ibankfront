import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { ClientService } from '../../../services/client.service';
import { ClientForm } from './client-form';

describe('ClientForm', () => {
  it('uses a template-driven form with backend validation limits', () => {
    const service = {
      selectedClient: signal(null),
      error: signal<string | null>(null),
      loadById: vi.fn(),
    };
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: ClientService, useValue: service }],
    });
    const fixture = TestBed.createComponent(ClientForm);
    fixture.detectChanges();
    const cin = fixture.nativeElement.querySelector('input[name="cin"]');
    const form = fixture.nativeElement.querySelector('form');
    expect(form.getAttribute('novalidate')).not.toBeNull();
    expect(cin.getAttribute('minlength')).toBe('4');
    expect(cin.getAttribute('maxlength')).toBe('20');
    expect(fixture.nativeElement.querySelector('button[type="submit"]')).not.toBeNull();
  });
});
