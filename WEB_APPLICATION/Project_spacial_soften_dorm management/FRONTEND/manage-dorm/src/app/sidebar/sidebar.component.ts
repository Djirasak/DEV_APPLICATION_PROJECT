import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {}
  logout() {
    this.auth
      .deleteLogout(localStorage.getItem('RFK').toString())
      .subscribe((res) => {
        localStorage.removeItem('ACK');
        localStorage.removeItem('RFK');
        this.router.navigate(['/']);
      });
  }
}
