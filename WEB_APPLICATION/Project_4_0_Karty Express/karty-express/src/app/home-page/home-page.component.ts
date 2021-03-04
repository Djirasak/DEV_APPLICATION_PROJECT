import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css'],
})
export class HomePageComponent implements OnInit {
  public inpTrackNo: string = '';
  DataTrack: any = [];
  showTrack: string = 'emtry';
  constructor(private api: ApiService) {}

  ngOnInit(): void {}
  submitGetdata(inp: string) {
    this.api.getShipmentWithID(inp).subscribe((res) => {
      this.DataTrack = res;
      console.log(this.DataTrack);
      if (this.DataTrack.msg.length > 0) {
        this.showTrack = 'have';
      } else {
        this.showTrack = 'null';
      }
    });
  }
}
