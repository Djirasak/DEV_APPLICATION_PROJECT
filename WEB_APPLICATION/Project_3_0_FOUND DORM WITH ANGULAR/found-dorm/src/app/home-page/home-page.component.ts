import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css'],
})
export class HomePageComponent implements OnInit {
  dataDorm: Array<any> = [];
  public searchCategory: string = '';
  public searchZone: string = '';
  constructor(private api: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.api.getAllDorm().subscribe((res) => {
      this.dataDorm = Object.values(res)[1];
      console.log(this.dataDorm);
    });
  }
  getDetail(dorm_id: string) {
    this.router.navigate(['detail/' + dorm_id]);
  }
}
