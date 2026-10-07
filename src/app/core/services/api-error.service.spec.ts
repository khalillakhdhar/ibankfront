import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ApiErrorService } from './api-error.service';

describe('ApiErrorService', () => {
  const fallback = 'Une erreur est survenue.';
  let service: ApiErrorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiErrorService);
  });

  it('uses the business message returned by the API', () => {
    const error = new HttpErrorResponse({ status: 409, error: { message: 'CIN déjà utilisé.' } });
    expect(service.message(error, fallback)).toBe('CIN déjà utilisé.');
  });

  it('uses a clear unavailable message for a network failure', () => {
    const error = new HttpErrorResponse({ status: 0, statusText: 'Unknown Error' });
    expect(service.message(error, fallback)).toBe('Le service bancaire est indisponible. Réessayez.');
  });

  it('uses the supplied fallback for an unknown error shape', () => {
    expect(service.message(new Error('technical detail'), fallback)).toBe(fallback);
  });
});
