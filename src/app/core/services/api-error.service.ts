import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ApiErrorService {
  message(error: unknown, fallback: string): string {
    if (!(error instanceof HttpErrorResponse)) return fallback;
    if (error.status === 0) return 'Le service bancaire est indisponible. Réessayez.';
    const businessMessage = error.error?.message;
    if (typeof businessMessage === 'string' && businessMessage.trim()) return businessMessage;
    const validation = error.error?.errors;
    if (validation && typeof validation === 'object') {
      const messages = Object.values(validation)
        .flatMap((value) => Array.isArray(value) ? value : [value])
        .filter((value): value is string => typeof value === 'string' && value.trim().length > 0);
      if (messages.length) return [...new Set(messages)].join(' ');
    }
    if (error.status === 401) return 'Votre session a expiré. Reconnectez-vous.';
    if (error.status === 403) return "Vous n'avez pas l'autorisation d'effectuer cette action.";
    if (error.status === 404) return 'La ressource demandée est introuvable.';
    return fallback;
  }
}
