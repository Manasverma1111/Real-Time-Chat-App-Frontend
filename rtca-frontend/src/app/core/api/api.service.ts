import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private BASE_URL = 'http://localhost:8087';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('connecthub_token');

    return new HttpHeaders({
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    });
  }

  get<T>(url: string) {
    return this.http.get<T>(`${this.BASE_URL}${url}`, {
      headers: this.getHeaders(),
    });
  }

  post<T>(url: string, body: any) {
    return this.http.post<T>(`${this.BASE_URL}${url}`, body, {
      headers: this.getHeaders(),
    });
  }
}
