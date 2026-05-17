import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private BASE_URL = 'http://localhost:8087';

  constructor(private http: HttpClient) {}

  get<T>(url: string) {
    return this.http.get<T>(`${this.BASE_URL}${url}`);
  }

  post<T>(url: string, body: any) {
    return this.http.post<T>(`${this.BASE_URL}${url}`, body);
  }

  /*
   Added PUT method for markMessagesAsSeen()
   and future update APIs
  */
  put<T>(url: string, body: any) {
    return this.http.put<T>(`${this.BASE_URL}${url}`, body);
  }

  /*
   DELETE METHOD FOR ROOM MEMBER MANAGEMENT
  */

  delete<T>(url: string) {
    return this.http.delete<T>(`${this.BASE_URL}${url}`);
  }

  // FILE UPLOAD WITH PROGRESS
  uploadFile(url: string, formData: FormData) {
    return this.http.post(`${this.BASE_URL}${url}`, formData);
  }
}
