import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  userEmail: string = '';

  constructor(private router: Router, private userService: UserService) {}

  async ngOnInit() {
    const user = await this.userService.isLoggedIn();

    if (user && user.email) {
      this.userEmail = user.email;
    } else {
      this.router.navigateByUrl('/login');
    }
  }

  logout() {
    this.userService.logout().then(result => {
      this.router.navigateByUrl('/login');
    });
  }
}
