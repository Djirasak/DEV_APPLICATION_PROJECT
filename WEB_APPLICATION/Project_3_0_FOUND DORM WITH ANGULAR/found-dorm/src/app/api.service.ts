import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root',
})
export class ApiService {
  urlAPI: string = 'http://localhost/api3';
  constructor(private http: HttpClient) {}
  getAllDorm() {
    return this.http.get(this.urlAPI + '/dorm/index.php');
  }
  getDorm(dorm_id: string) {
    return this.http.get(this.urlAPI + '/dorm/index.php?dorm_id=' + dorm_id);
  }
  getImageWithId(dorm_id: string) {
    return this.http.get(
      this.urlAPI + '/assets/image/pathIM.php?dorm_id=' + dorm_id
    );
  }
}
