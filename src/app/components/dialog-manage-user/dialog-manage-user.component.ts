import { Component, Inject } from '@angular/core';

import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { User } from 'src/app/models/user.model';

@Component({
  selector: 'app-dialog-manage-user',
  templateUrl: './dialog-manage-user.component.html'
})
export class DialogManageUserComponent {
  constructor(
    public dialogRef: MatDialogRef<DialogManageUserComponent>,
    @Inject(MAT_DIALOG_DATA) public data: User
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }
}
