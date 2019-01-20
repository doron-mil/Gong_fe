export class JsonConverter {
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

  constructor(schema: any) {
    this.buildConversionsArray(schema);
  }

    convert<T>(simpleObj: any, clazz: { new(): T }): Array<T> {
      const retObjectClassArray = new Array<T>();

      if (JsonConverter.isArray(simpleObj)) {
        retObjectClassArray.push(this.convertOneObject(simpleObj, clazz));
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
          if (propertyValue) {
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
            if (jsonPropertyValue) {
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

  hasSpecificConversions(): boolean {
    return this.propertyConversionArray && this.propertyConversionArray.length > 0;
  }
}
