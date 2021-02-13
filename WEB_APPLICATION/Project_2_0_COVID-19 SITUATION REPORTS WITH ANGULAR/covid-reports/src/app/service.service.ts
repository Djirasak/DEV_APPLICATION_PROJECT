import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ServiceService {
  constructor(private http: HttpClient) {}
  getCovidStat() {
    return this.http.get('http://covid19.th-stat.com/api/open/today');
  }
}
