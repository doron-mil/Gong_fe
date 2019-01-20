import {InjectionToken, ModuleWithProviders, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {JsonConverterConfig, JsonConverterService} from './json-converter.service';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: []
})
export class JsonConverterModule {
  static forRoot(conversionSchemaFileName: string): ModuleWithProviders {
    return {
      ngModule: JsonConverterModule,
      providers: [
        JsonConverterService,
        {
          provide: JsonConverterConfig,
          useValue: conversionSchemaFileName
        }
      ]
    };
  }
}
