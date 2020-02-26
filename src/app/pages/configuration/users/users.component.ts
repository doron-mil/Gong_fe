import {Component} from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {MatDialog} from '@angular/material/dialog';

import {first, takeUntil} from 'rxjs/operators';
import {NgRedux} from '@angular-redux/store';
import Swal from 'sweetalert2';

import {User} from '../../../model/user';
import {StoreService} from '../../../services/store.service';
import {DateFormat} from '../../../model/dateFormat';
import {BaseComponent} from '../../../shared/baseComponent';
import {StoreDataTypeEnum} from '../../../store/storeDataTypeEnum';
import {EditUserActionEnum, EditUserDialogComponent} from '../../../dialogs/edit-user-dialog/edit-user-dialog.component';
import {AuthService} from '../../../services/auth.service';
import {IObjectMap} from '../../../model/store-model';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent extends BaseComponent {
  selectedUser: User;
  usersDisplayedColumns = ['user_id', 'role', 'creation_date', 'update_date'];
  usersDataSource: MatTableDataSource<User>;
  usersData: User[] = [];

  dateFormat: DateFormat;
  areEditButtonsEnabled: boolean = false;
  currentUser: string;
  currentRole: string;

  confirmDeleteUserTransMap: IObjectMap<string> = {};

  constructor(private ngRedux: NgRedux<any>,
              private translate: TranslateService,
              private authService: AuthService,
              private dialog: MatDialog,
              private storeService: StoreService) {
    super(translate);
    this.currentUser = this.authService.getUser();
    this.currentRole = this.authService.getRole();
  }

  protected listenForUpdates() {
    this.storeService.getUsersArray();

    this.ngRedux.select<User[]>([StoreDataTypeEnum.STATIC_DATA, 'users'])
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((usersArray: User[]) => {
        this.usersData = usersArray;
        this.usersDataSource = new MatTableDataSource<User>(this.usersData);
      });

    this.storeService.getDateFormat()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(dateFormat => this.dateFormat = dateFormat.convertToDateFormatter());

  }

  protected getKeysArray4Translations(): string[] {
    const translationKeyBase = 'config.users.alerts.confirmRemoveUser.';
    this.confirmDeleteUserTransMap['title'] = `${translationKeyBase}title`;
    this.confirmDeleteUserTransMap['text'] = `${translationKeyBase}text`;
    this.confirmDeleteUserTransMap['cancel'] = `${translationKeyBase}buttons.cancel`;
    this.confirmDeleteUserTransMap['confirm'] = `${translationKeyBase}buttons.confirm`;
    return Array.from(Object.values(this.confirmDeleteUserTransMap));
  }

  addUser() {
    const rolesArray = this.storeService.getRolesArray();
    const existingUsersIds = this.storeService.getExistingUsersIdsArray();
    const dialogRef = this.dialog.open(EditUserDialogComponent, {
      height: '60vh',
      width: '70vw',
      panelClass: 'user-edit-dialog',
      position: {top: '15vh'},
      data: {user: new User(), action: EditUserActionEnum.NEW, rolesArray, existingUsersIds}
    });

    dialogRef.afterClosed().pipe(first())
      .subscribe((aUser: User) => {
        if (aUser) {
          this.storeService.addUser(aUser);
        }
      });

  }

  updateUser() {

  }

  deleteUser() {
    Swal.fire({
      title: this.getTranslation(this.confirmDeleteUserTransMap['title']),
      html: `${this.getTranslation(this.confirmDeleteUserTransMap['text'])} <BR> ${this.selectedUser.id}`,
      icon: 'warning',
      confirmButtonText: this.getTranslation(this.confirmDeleteUserTransMap['confirm']),
      showCancelButton: true,
      cancelButtonText: this.getTranslation(this.confirmDeleteUserTransMap['cancel']),
    })
      .then(result => {
        if (result.value) {
          this.storeService.deleteUser(this.selectedUser);
        }
      });
  }

  changeUserPass() {

  }

  selectUser(aUser: User) {
    this.selectedUser = aUser;

    this.areEditButtonsEnabled = this.selectedUser &&
      (('dev' === this.currentUser) ||
        ('admin' === this.currentRole && !['dev', 'admin'].includes(this.selectedUser.id))
      );
  }
}
