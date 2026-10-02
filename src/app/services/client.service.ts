import { HttpClient } from "@angular/common/http";
import { inject, Injectable, signal } from "@angular/core";
import { Client, CreateClient, UpdateClient } from "../models/client.model";
import { catchError, tap, throwError } from "rxjs";

@Injectable({  providedIn: 'root'})
export class ClientService {
  // environment
private  readonly http= inject(HttpClient);
private readonly baseUrl = 'http://localhost:5176/api/clients';
// signals
private readonly clientSignal=signal<Client[]>([]);
private readonly lodingSignal=signal<boolean>(false);
private readonly errorSignal=signal<string | null>(null);
private readonly selectedClientSignal=signal<Client | null>(null);
readonly clients=this.clientSignal.asReadonly();
readonly loading=this.lodingSignal.asReadonly();
readonly error=this.errorSignal.asReadonly();
readonly selectedClient= this.selectedClientSignal.asReadonly();
// stats
readonly totalClients=this.clientSignal().length;
readonly activeClients=this.clientSignal().filter(client=>client.isActive).length;
readonly inactiveClients=this.clientSignal().filter(client=>!client.isActive).length;
readonly activeCount=this.clientSignal().filter(client=>client.isActive).length;
readonly hasClients=this.clientSignal().length>0;


loadAll()
{
  this.errorSignal.set(null);
  this.lodingSignal.set(true);
  return this.http.get<Client[]>(this.baseUrl).pipe(
    tap(clients=>{
      this.clientSignal.set(clients);
      this.lodingSignal.set(false);
    }),
    catchError(err=>{
      this.errorSignal.set(err.message || 'An error occurred while loading clients.');
      this.lodingSignal.set(false);
      return throwError(()=>err);
    })
  ).subscribe();

}
loadById(id:number)
{
  this.errorSignal.set(null);
  this.lodingSignal.set(true);
  return this.http.get<Client>(`${this.baseUrl}/${id}`).pipe(
    tap(client=>{
      this.selectedClientSignal.set(client);
      this.lodingSignal.set(false);
    }),
    catchError(err=>{
      this.errorSignal.set(err.message || 'An error occurred while loading the client.');
      this.lodingSignal.set(false);
      return throwError(()=>err);
    })
  ).subscribe();
}
create(client:CreateClient)
{
  return this.http.post<Client>(this.baseUrl,client).pipe(
  tap((client)=>this.clientSignal.update(clients=>[...clients,client])),
  catchError(err=>{
    this.errorSignal.set(err.message || 'An error occurred while creating the client.');
    return throwError(()=>err);
  })
  )  ;
}
update(id:number,client:UpdateClient)
{
  return this.http.put<Client>(`${this.baseUrl}/${id}`,client).pipe(
    tap((updatedClient)=>{
      this.clientSignal.update(clients=>{
        const index=clients.findIndex(c=>c.id===id);
        if(index!==-1)
        {
          clients[index]=updatedClient;
        }
        return [...clients];
      });
    }),
    catchError(err=>{
      this.errorSignal.set(err.message || 'An error occurred while updating the client.');
      return throwError(()=>err);
    })
  );
}
delete(id:number)
{
  return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
    tap(()=>{
      this.clientSignal.update(clients=>clients.filter(c=>c.id!==id));
    }),
    catchError(err=>{
      this.errorSignal.set(err.message || 'An error occurred while deleting the client.');
      return throwError(()=>err);
    })
  );
}




}
