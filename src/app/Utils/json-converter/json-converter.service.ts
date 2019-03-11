import {Inject, Injectable, InjectionToken} from '@angular/core';
import {HttpClient} from '@angular/common/http';

export const JsonConverterConfig = new InjectionToken<JsonConverterConfigurationInterface>('JsonConverterConfig');

@Injectable({
  providedIn: 'root'
})
export class JsonConverterService {

  conversionSchemaFileName: string;
  conversionMap: { [key: string]: ConversionSchema; } = {};
  conversionFunctions: ConversionFunctionsType;
  classesMap: Map<string, { new() }>;

  static isArray(object) {
    if (object === Array) {
      return true;
    } else if (typeof Array.isArray === 'function') {
      return Array.isArray(object);
    } else {
      return !!(object instanceof Array);
    }
  }

  constructor(
    @Inject(JsonConverterConfig) private aConversionSchemaFileName: JsonConverterConfigurationInterface,
    private http: HttpClient) {

    this.conversionSchemaFileName = aConversionSchemaFileName.getConfigurationFilePath();
    this.conversionFunctions = aConversionSchemaFileName.conversionFunctions;
    this.classesMap = aConversionSchemaFileName.classesMap;

    if (!aConversionSchemaFileName.converterMainMethodOverride) {
      aConversionSchemaFileName.converterMainMethodOverride = this.convert;
    }

    this.http.get(this.conversionSchemaFileName)
      .subscribe(schema => {
        this.buildConversionsArray(schema);
        // console.log('bbbbb', this.conversionMap);
      });
  }

  convertTest() {
    console.log('aaaaa', this.conversionMap);
  }

  convert<T>(simpleObj: any, clazz: { new(): T }): Array<T> {
    const retObjectClassArray = new Array<T>();

    if (JsonConverterService.isArray(simpleObj)) {
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
          const jsonPropertyValue = this.getJsonPropertyValue(simpleObj, jsonPropertyName);
          if (jsonPropertyValue != null && jsonPropertyValue !== null &&
            typeof jsonPropertyValue !== 'undefined') {
            // If there is a typed conversion
            if (propertyConversion.type && this.classesMap) {
              const typeClazz = this.classesMap.get(propertyConversion.type);
              if (typeClazz) {
                retObjectClass[propertyName] = this.convert(jsonPropertyValue, typeClazz);
              } else {

              }
              // If there is a conversion function to be used
            } else if (propertyConversion.conversionFunctionName && this.conversionFunctions) {
              const conversionFunction =
                this.conversionFunctions[propertyConversion.conversionFunctionName];
              if (conversionFunction) {
                retObjectClass[propertyName] = conversionFunction(jsonPropertyValue);
              } else {
                console.error('Couldn\'t find conversion function named : ' +
                  propertyConversion.conversionFunctionName);
              }

            } else {  // Else - simple conversion
              retObjectClass[propertyName] = jsonPropertyValue;
            }
          }
        });
    }

    return retObjectClass;
  }

  convertToJson(classedObject: [any | any[]]): any | Array<any> {
    const className = classedObject.constructor.name;
    const conversionSchema = this.conversionMap[className];

    let retJsonObjectArray = new Array<any>();
    let classedObjectsArray: Array<any>;
    let isArray = false;

    if (conversionSchema && conversionSchema.hasSpecificConversions()) {
      if (JsonConverterService.isArray(classedObject)) {
        isArray = true;
        classedObjectsArray = <Array<any>>classedObject;
      } else {
        classedObjectsArray = new Array<any>(classedObject);
      }

      classedObjectsArray.forEach(classedObjectItem => {
        retJsonObjectArray.push(this.convertToJsonOneObject(classedObjectItem, conversionSchema));
      });

    } else {
      isArray = true;
      retJsonObjectArray = classedObject;
    }

    return isArray ? retJsonObjectArray : (retJsonObjectArray.length > 0 ? retJsonObjectArray[0] : undefined);
  }

  private convertToJsonOneObject(classedObjectItem: any, conversionSchema: ConversionSchema) {
    const retObject = {};

    conversionSchema.propertyConversionArray.forEach(
      (propertyConversion: PropertyConversion) => {
        const propertyName = propertyConversion.propertyName;
        let jsonPropertyName = propertyConversion.propertyNameInJson;
        if (!jsonPropertyName) {
          jsonPropertyName = propertyName;
        }
        const classedObjectValue = classedObjectItem[propertyName];
        let convertedValue = classedObjectValue;
        if (propertyConversion.conversionFunctionToJsonName && this.conversionFunctions) {
          const conversionFunction =
            this.conversionFunctions[propertyConversion.conversionFunctionToJsonName];
          convertedValue = conversionFunction(classedObjectValue);
        }
        this.setJsonPropertyValue(retObject, jsonPropertyName, convertedValue);
      });

    return retObject;
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

  private getJsonPropertyValue(simpleObj: any, jsonPropertyName: string) {
    if (!simpleObj) {
      return simpleObj;
    }
    const indexOfDot = jsonPropertyName.indexOf('.');
    if (indexOfDot >= 0) {
      const firstPart = jsonPropertyName.substr(0, indexOfDot);
      const secondPart = jsonPropertyName.substr(indexOfDot + 1);
      return this.getJsonPropertyValue(simpleObj[firstPart], secondPart);
    } else {
      return simpleObj[jsonPropertyName];
    }

  }

  private setJsonPropertyValue(retObject: any, jsonPropertyName: string, assignedValue: any) {
    const propertiesArray = jsonPropertyName.split('.');
    let objectToAssign = retObject;
    propertiesArray.forEach((property, index) => {
      if (index <= propertiesArray.length - 2) {
        if (!objectToAssign[property]) {
          objectToAssign[property] = {};
        }
        objectToAssign = objectToAssign[property];
      }
    });
    objectToAssign[propertiesArray[propertiesArray.length - 1]] = assignedValue;
  }
}

class PropertyConversion {
  propertyName: string;
  type?: string;
  propertyNameInJson?: string;
  conversionFunctionName?: string;
  conversionFunctionToJsonName?: string;
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

// noinspection TsLint
export type ConversionFunctionsType = { [key: string]: (source: any) => any } ;

export interface JsonConverterConfigurationInterface {
  getConfigurationFilePath: () => string;
  conversionFunctions: ConversionFunctionsType;
  converterMainMethodOverride: <T>(simpleObj: any, clazz: { new(): T }) => Array<T>;
  classesMap: Map<string, { new() }>;
}
