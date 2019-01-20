import {Inject, Injectable, InjectionToken} from '@angular/core';
import {JsonConverter} from './json-converter';
import {HttpClient} from '@angular/common/http';

export const JsonConverterConfig = new InjectionToken<string>('JsonConverterConfig');

@Injectable({
  providedIn: 'root'
})
export class JsonConverterService {

  conversionSchemaFileName: string;
  conversionMap: { [key: string]: ConversionSchema; } = {};

  static isArray(object) {
    if (object === Array) {
      return true;
    } else if (typeof Array.isArray === 'function') {
      return Array.isArray(object);
    } else {
      return !!(object instanceof Array);
    }
  }

  constructor(@Inject(JsonConverterConfig) private aConversionSchemaFileName,
              private http: HttpClient) {
    this.conversionSchemaFileName = aConversionSchemaFileName;

    this.http.get(aConversionSchemaFileName)
      .subscribe(schema => {
        this.buildConversionsArray(schema);
        console.log('bbbbb', this.conversionMap);
        // console.log(data);
      });
  }

  convertTest() {
    console.log('aaaaa', this.conversionMap);
  }

  convert<T>(simpleObj: any, clazz: { new(): T }): Array<T> {
    const retObjectClassArray = new Array<T>();

    if (JsonConverter.isArray(simpleObj)) {
      (simpleObj as Array<any>).forEach(schemaRecord => {
        const schemaItem = this.convertOneObject(schemaRecord, clazz);
        retObjectClassArray.push(schemaItem);
      });
    } else {
      (simpleObj as Array<any>).forEach(simpleObjItem => {
        retObjectClassArray.push(this.convertOneObject(simpleObjItem, clazz));
      });
    }

    return retObjectClassArray;
  }

  convertOneObject<T>(simpleObj: any, clazz: { new(): T }): T {
    const retObjectClass = new clazz();

    let conversionSchema = this.conversionMap[clazz.name];

    if (!conversionSchema) {
      conversionSchema = this.generateDefaultConversionSchema();
    }

    if (conversionSchema.iterateAllProperties) {
      Object.keys(retObjectClass).forEach((key) => {
        const propertyValue = simpleObj[key];
        if (propertyValue != null && propertyValue !== null &&
          typeof propertyValue !== 'undefined') {
          retObjectClass[key] = propertyValue;
        }
      });
    }

    if (conversionSchema.hasSpecificConversions()) {
      conversionSchema.propertyConversionArray.forEach(
        (propertyConversion: PropertyConversion) => {
          const propertyName = propertyConversion.propertyName;
          let jsonPropertyName = propertyConversion.propertyNameInJson;
          if (!jsonPropertyName) {
            jsonPropertyName = propertyName;
          }
          const jsonPropertyValue = simpleObj[jsonPropertyName];
          if (jsonPropertyValue != null && jsonPropertyValue !== null &&
          typeof jsonPropertyValue !== 'undefined') {
            if (propertyConversion.conversionFunction) {
              retObjectClass[propertyName] =
                propertyConversion.conversionFunction(jsonPropertyValue);
            } else {
              retObjectClass[propertyName] = jsonPropertyValue;
            }
          }
        });
    }

    return retObjectClass;
  }

  private generateDefaultConversionSchema() {
    const conversionSchema = new ConversionSchema();
    conversionSchema.iterateAllProperties = true;
    return conversionSchema;
  }

  private buildConversionsArray(schema: any) {
    const conversionSchemasArray = this.convert(schema, ConversionSchema);
    conversionSchemasArray.forEach(conversionSchemas => {
      this.conversionMap[conversionSchemas.className] = conversionSchemas;
    });
  }
}

class PropertyConversion {
  propertyName: string;
  propertyNameInJson?: string;
  conversionFunction?: (source: any) => any;
}

class ConversionSchema {
  className: string;
  iterateAllProperties: boolean = false;
  propertyConversionArray: PropertyConversion[];

  constructor() {
    this.className = undefined;
    this.propertyConversionArray = undefined;
  }

  hasSpecificConversions(): boolean {
    return this.propertyConversionArray && this.propertyConversionArray.length > 0;
  }
}
