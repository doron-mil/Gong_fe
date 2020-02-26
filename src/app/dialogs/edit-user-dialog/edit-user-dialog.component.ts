import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {User} from '../../model/user';
import {IObjectMap} from '../../model/store-model';

export enum EditUserActionEnum {
  NEW = 'new',
  UPDATE = 'update',
  PASSWORD = 'password',
}

enum ErrorMessagesEnum {
  ID_REQUIRED = 'idRequired',
  ID_ALREADY_EXISTS = 'idAlreadyExists',
  PASS_REQUIRED = 'passRequired',
}

@Component({
  selector: 'app-edit-user-dialog',
  templateUrl: './edit-user-dialog.component.html',
  styleUrls: ['./edit-user-dialog.component.scss']
})
export class EditUserDialogComponent implements OnInit {
  isFormValid: boolean;

  errorMessages: IObjectMap<string> = {};

  constructor(public dialogRef: MatDialogRef<any>,
              @Inject(MAT_DIALOG_DATA) public data: {
                user: User,
                action: EditUserActionEnum,
                rolesArray: string[],
                existingUsersIds: string[]
              }) {
  }

  ngOnInit() {
  }

  closeDialog(aUser: User = null): void {
    this.dialogRef.close(aUser);
  }

  submitContent() {
    this.closeDialog(this.data.user);
  }

  onInputChanged(aIdDirty: boolean, aPassDirty: boolean) {
    this.errorMessages = {};
    switch (this.data.action) {
      case EditUserActionEnum.NEW:
        if (aIdDirty) {
          const idIsFilled = this.data.user.id && this.data.user.id.length > 0;
          if (idIsFilled && this.data.existingUsersIds.includes(this.data.user.id)) {
            this.errorMessages['id'] = ErrorMessagesEnum.ID_ALREADY_EXISTS;
          } else if (!idIsFilled) {
            this.errorMessages['id'] = ErrorMessagesEnum.ID_REQUIRED;
          }
        }
        if (aPassDirty) {
          const passIsFilled = this.data.user.password && this.data.user.password.length > 0;
          if (!passIsFilled) {
            this.errorMessages['pass'] = ErrorMessagesEnum.PASS_REQUIRED;
          }
        }
        this.isFormValid = aIdDirty && aPassDirty &&
          (Object.keys(this.errorMessages).length) <= 0 &&
          (!!this.data.user.role && this.data.user.role.length > 0);
        break;
      case EditUserActionEnum.UPDATE:
        break;
      case EditUserActionEnum.PASSWORD:
        break;
    }
  }
}
