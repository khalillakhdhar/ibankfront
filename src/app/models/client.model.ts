export interface CreateClient {



Cin: string;
Nom: string;
Prenom: string;
DateNaissance?: Date;
Email?: string;
Telephone: string;
Adresse?: string;
DateCreation: Date;


}
export interface Client {
Id: number;

Cin: string;
Nom: string;
Prenom: string;
DateNaissance?: Date;
Email?: string;
Telephone: string;
Adresse?: string;
DateCreation: Date;
IsActive: boolean;

}
export interface UpdateClient {


Cin: string;
Nom: string;
Prenom: string;
DateNaissance?: Date;
Email?: string;
Telephone: string;
Adresse?: string;
DateCreation: Date;
IsActive: boolean;
}
export interface ClientList {}
export interface ClientDetails {
  Id: number;

Cin: string;
Nom: string;
Prenom: string;
DateNaissance?: Date;
Email?: string;
Telephone: string;
Adresse?: string;
DateCreation: Date;
IsActive: boolean;
//     public List<Comptes.CompteSummaryDto> Comptes { get; set; } = [];

}
