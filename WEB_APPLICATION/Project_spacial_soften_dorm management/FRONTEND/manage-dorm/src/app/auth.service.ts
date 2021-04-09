import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
const url = 'http://45.76.188.138:5000';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient) {}

  postLogin(json_data) {
    const config = {
      headers: new HttpHeaders().set('Content-Type', 'application/json'),
    };
    return this.http.post<any>(url + '/login', json_data, config);
  }
  deleteLogout(data) {
    return this.http.delete<any>(url + '/logout/' + data);
  }
}
