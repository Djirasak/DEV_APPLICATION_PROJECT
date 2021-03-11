import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  url = 'http://149.28.146.146/';
  constructor(private http: HttpClient) {}
  getShipmentWithID(track_id: string) {
    return this.http.get(this.url + 'shipment/' + track_id);
  }
}
