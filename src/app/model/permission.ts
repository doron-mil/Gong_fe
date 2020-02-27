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
    this.isDw = this.roles.includes('user');
    this.isTeacher = this.roles.includes('super-user');
    this.isAdmin = this.roles.includes('admin');
    this.isAll = (_.pullAll(['user', 'super-user', 'admin'], this.roles).length <= 0);

    return this;
  }

  computeRoles() {
    this.roles = [];
    if (this.isDw) {
      this.roles.push('user');
    }
    if (this.isTeacher) {
      this.roles.push('super-user');
    }
    if (this.isAdmin) {
      this.roles.push('admin');
    }

    return this;
  }
}
