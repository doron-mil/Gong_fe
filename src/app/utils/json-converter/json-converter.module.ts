import {ModuleWithProviders, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
  JsonConverterConfig,
  JsonConverterConfigurationInterface,
  JsonConverterService
} from './json-converter.service';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: []
})
export class JsonConverterModule {
  static forRoot(converterConfiguration: JsonConverterConfigurationInterface): ModuleWithProviders {
    return {
      ngModule: JsonConverterModule,
      providers: [
        JsonConverterService,
        {
          provide: JsonConverterConfig,
          useValue: converterConfiguration
        }
      ]
    };
  }
}
