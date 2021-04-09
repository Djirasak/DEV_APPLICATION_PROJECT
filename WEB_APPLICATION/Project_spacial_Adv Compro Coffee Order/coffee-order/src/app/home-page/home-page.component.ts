import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
})
export class HomePageComponent implements OnInit {
  public TNumber: string = '';
  showMenu: boolean = false;
  constructor() {}

  ngOnInit(): void {}
  goto_menu(inp_tnumber: string) {
    if (inp_tnumber != '') {
      this.showMenu = true;
    } else {
      this.showMenu = false;
    }
  }
}
