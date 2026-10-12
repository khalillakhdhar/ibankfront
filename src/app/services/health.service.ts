import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_BASE_URL } from '../core/config/api.config';

export interface HealthStatus {
  status: string;
  project: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class HealthService {
  private readonly http = inject(HttpClient);
  private readonly url = `${inject(API_BASE_URL)}/Health`;

  check() {
    return this.http.get<HealthStatus>(this.url);
  }
}
