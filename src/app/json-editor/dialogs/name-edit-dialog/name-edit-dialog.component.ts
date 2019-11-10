import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-name-edit-dialog',
  templateUrl: './name-edit-dialog.component.html',
  styleUrls: ['./name-edit-dialog.component.scss']
})
export class NameEditDialogComponent implements OnInit {

  name: string;
  initialName: string;

  constructor(public dialogRef: MatDialogRef<any>,
              @Inject(MAT_DIALOG_DATA) public data: { initialKeyName: string }) {
    if (data) {
      this.name = this.initialName = data.initialKeyName;
    }

  }

  ngOnInit() {
  }

  closeDialog() {
    this.dialogRef.close(null);
  }

  onKeydown(aNewValue: string) {
    this.submit(aNewValue);
  }

  submit(aNewValue: string) {
    const retName = aNewValue.trim();
    this.dialogRef.close(retName);
  }

  isNameOk(aName: string) {
    const nameTrimmed = aName ? aName.trim() : '';
    return !nameTrimmed || nameTrimmed === this.initialName || nameTrimmed.indexOf('.') >= 0;
  }
}
