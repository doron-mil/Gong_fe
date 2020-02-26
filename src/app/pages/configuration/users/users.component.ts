import {Component} from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {User} from '../../../model/user';
import {StoreService} from '../../../services/store.service';
import {DateFormat} from '../../../model/dateFormat';
import {BaseComponent} from '../../../shared/baseComponent';
import {first, takeUntil} from 'rxjs/operators';
import {NgRedux} from '@angular-redux/store';
import {StoreDataTypeEnum} from '../../../store/storeDataTypeEnum';
import {MatDialog} from '@angular/material/dialog';
import {EditUserActionEnum, EditUserDialogComponent} from '../../../dialogs/edit-user-dialog/edit-user-dialog.component';

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

  constructor(private ngRedux: NgRedux<any>,
              private dialog: MatDialog,
              private storeService: StoreService) {
    super();
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

  }

  changeUserPass() {

  }
}
