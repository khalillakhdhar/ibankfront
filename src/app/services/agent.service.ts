import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../core/config/api.config';
import { CreateAgent, User } from '../models/auth.model';
@Injectable({ providedIn: 'root' })
export class AgentService {
  private http = inject(HttpClient);
  private base = `${inject(API_BASE_URL)}/Auth/agents`;
  create(payload: CreateAgent): Observable<User> {
    return this.http.post<User>(this.base, payload);
  }
}
