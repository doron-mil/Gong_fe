import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {JsonEditorComponent} from './components/json-editor/json-editor.component';
import {MaterialModule} from '../material/material.module';
import {NameEditDialogComponent} from './dialogs/name-edit-dialog/name-edit-dialog.component';
import {MessagesComponent} from './dialogs/messages/messages.component';
import {NewNodeDialogComponent} from './dialogs/new-node-dialog/new-node-dialog.component';
import {FormsModule} from '@angular/forms';

@NgModule({
  declarations: [JsonEditorComponent, NameEditDialogComponent, MessagesComponent, NewNodeDialogComponent],
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
  ],
  entryComponents: [NameEditDialogComponent, MessagesComponent, NewNodeDialogComponent],
  exports: [JsonEditorComponent]
})
export class JsonEditorModule {
}
