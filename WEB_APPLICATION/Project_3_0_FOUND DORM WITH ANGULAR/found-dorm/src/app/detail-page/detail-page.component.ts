import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-detail-page',
  templateUrl: './detail-page.component.html',
  styleUrls: ['./detail-page.component.css'],
})
export class DetailPageComponent implements OnInit {
  dorm_id: any = '';
  dataDorm: Array<any> = [];
  dataDormImage: Array<any> = [];
  constructor(private route: ActivatedRoute, private api: ApiService) {}

  ngOnInit(): void {
    this.dorm_id = this.route.snapshot.paramMap.get('dorm_id');
    this.api.getImageWithId(this.dorm_id).subscribe((res) => {
      this.dataDormImage = Object.values(res)[0];
      console.log(this.dataDormImage);

      this.api.getDorm(this.dorm_id).subscribe((response) => {
        this.dataDorm = Object.values(response)[1];
        console.log(this.dataDorm);
      });
    });
  }
}
