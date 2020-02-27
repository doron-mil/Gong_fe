import * as _ from 'lodash';

export class Permission {
  action: string;
  roles: string[];
  order: number;
  isDw: boolean;
  isTeacher: boolean;
  isAdmin: boolean;
  isAll: boolean;

  computeBooleans() {
    this.isDw = this.roles.includes('dw');
    this.isTeacher = this.roles.includes('teacher');
    this.isAdmin = this.roles.includes('admin');
    this.isAll = (_.pullAll(['dw', 'teacher', 'admin'], this.roles).length <= 0);
  }

  computeRoles() {
    this.roles = [];
    if (this.isDw) {
      this.roles.push('dw');
    }
    if (this.isTeacher) {
      this.roles.push('teacher');
    }
    if (this.isAdmin) {
      this.roles.push('admin');
    }
  }
}
