import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';

import {MaterialModule} from '../material/material.module';

import {JsonEditorComponent} from './components/json-editor/json-editor.component';
import {NameEditDialogComponent} from './dialogs/name-edit-dialog/name-edit-dialog.component';
import {MessagesComponent} from './dialogs/messages/messages.component';
import {NewNodeDialogComponent} from './dialogs/new-node-dialog/new-node-dialog.component';
import {JsonTreeComponent} from './components/json-tree/json-tree.component';
import {HeaderComponent} from './components/header/header.component';

@NgModule({
  declarations: [
    JsonEditorComponent,
    NameEditDialogComponent,
    MessagesComponent,
    NewNodeDialogComponent,
    JsonTreeComponent,
    HeaderComponent],
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
