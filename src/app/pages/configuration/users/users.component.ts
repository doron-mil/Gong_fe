import {Component, OnInit} from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {User} from '../../../model/user';
import {StoreService} from '../../../services/store.service';
import {DateFormat} from '../../../model/dateFormat';
import {BaseComponent} from '../../../shared/baseComponent';
import {takeUntil} from 'rxjs/operators';
import {NgRedux} from '@angular-redux/store';
import {StoreDataTypeEnum} from '../../../store/storeDataTypeEnum';
import {CourseSchedule} from '../../../model/courseSchedule';

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

  }

  updateUser() {

  }

  deleteUser() {

  }

  changeUserPass() {

  }
}
