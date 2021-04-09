import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import jwt_decode from 'jwt-decode';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  public inpEmail: string = '';
  public inpPassword: string = '';
  token: any = {};
  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {}
  login(INPE, INPP) {
    const data = {
      email: INPE,
      password: INPP,
    };
    this.auth.postLogin(data).subscribe(
      (res) => {
        this.token = res['token'];
        console.log(this.token);
        localStorage.setItem('ACK', this.token['accessToken']);
        localStorage.setItem('RFK', this.token['refreshToken']);
        //console.log(jwt_decode(this.token['accessToken']));
        this.router.navigate(['/home']);
      },
      (err) => {
        console.log(err['error']);
      }
    );
  }
}
