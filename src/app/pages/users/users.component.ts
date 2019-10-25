import { Component, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

import { MatDialog } from '@angular/material/dialog';

import { DialogManageUserComponent } from '../../components/dialog-manage-user/dialog-manage-user.component';
import { DialogConfirmDeleteComponent } from '../../components/dialog-confirm-delete/dialog-confirm-delete.component';

import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  isLoading: boolean = true;
  findUser: string = '';
  findUserUpdate = new Subject<string>();

  displayedColumns: string[] = [
    'avatar',
    'name',
    'email',
    'birthYear',
    'action'
  ];
  users: Observable<any>;
  avatarUploaded: File = null;

  constructor(private userService: UserService, private dialog: MatDialog) {}

  ngOnInit() {
    this.users = this.userService.getUsers();
    this.users.subscribe(() => {
      this.isLoading = false;
    });

    this.findUserUpdate
      .pipe(
        debounceTime(400),
        distinctUntilChanged()
      )
      .subscribe(value => {
        if (value !== '') {
          this.users = this.userService.filterUsersByName(value);
        } else {
          this.users = this.userService.getUsers();
        }
      });
  }

  filterUser() {
    this.findUserUpdate.next(this.findUser);
  }

  openDialogCreateUser() {
    const dialogRef = this.dialog.open(DialogManageUserComponent, {
      width: '300px',
      data: { id: '', name: '', email: '', birthYear: '', avatar: '' }
    });

    dialogRef.afterClosed().subscribe(user => {
      this.userService.createUser(user);
    });
  }

  openDialogEditUser(editUser: User) {
    const dialogRef = this.dialog.open(DialogManageUserComponent, {
      width: '300px',
      data: Object.assign({}, editUser)
    });

    dialogRef.afterClosed().subscribe(user => {
      if (user) {
        this.userService.updateUser(user);
      }
    });
  }

  openDialogDeleteUser(userId: string) {
    const dialogRef = this.dialog.open(DialogConfirmDeleteComponent, {
      width: '300px',
      data: { name: 'User' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userService.deleteUser(userId).then(() => {
          this.userService.removeAvatar(userId);
        });
      }
    });
  }

  uploadAvatar(file: File, user: User, userId) {
    this.userService.uploadAvatar(file, user.id);
    this.userService.getDownloadURL().subscribe(data => {
      if (data) {
        user.avatar = data;
        this.userService.updateUser(user);
      }
    });
  }
}
