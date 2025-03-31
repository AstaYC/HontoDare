// src/app/core/services/character.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {Character} from "../models/character.model";

@Injectable({
  providedIn: 'root'
})
export class CharacterService {
  private apiUrl = `${environment.apiUrl}/api/character`;

  constructor(private http: HttpClient) {}

  uploadCharacter(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/upload`, formData);
  }

  getAllCharacters(): Observable<Character[]> {
    return this.http.get<Character[]>(this.apiUrl);
  }

  getCharacterById(id: number): Observable<Character> {
    return this.http.get<Character>(`${this.apiUrl}/${id}`);
  }

  getCharactersByCategory(category: string): Observable<Character[]> {
    return this.http.get<Character[]>(`${this.apiUrl}/category/${category}`);
  }

  createCharacter(formData: FormData): Observable<Character> {
    return this.http.post<Character>(`${this.apiUrl}/upload`, formData);
  }

  updateCharacter(id: number, character: Character): Observable<Character> {
    return this.http.put<Character>(`${this.apiUrl}/${id}`, character);
  }

  deleteCharacter(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
