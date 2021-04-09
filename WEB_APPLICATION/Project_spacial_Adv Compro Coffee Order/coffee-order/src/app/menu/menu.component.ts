import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {
  menu_raw: Observable<any>;
  menu: any = [];
  constructor(db: AngularFireDatabase) {
    this.menu_raw = db.list('/menu').valueChanges();
    this.menu_raw.subscribe((item) => {
      console.log(item);
      this.menu = item;
    });
  }

  ngOnInit(): void {}
}
