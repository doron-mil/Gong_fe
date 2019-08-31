import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {JsonEditorComponent} from './components/json-editor/json-editor.component';
import {MaterialModule} from '../material/material.module';
import {NameEditDialogComponent} from './dialogs/name-edit-dialog/name-edit-dialog.component';

@NgModule({
  declarations: [JsonEditorComponent, NameEditDialogComponent],
  imports: [
    CommonModule,
    MaterialModule,
  ],
  entryComponents: [NameEditDialogComponent],
  exports: [JsonEditorComponent]
})
export class JsonEditorModule {
}
