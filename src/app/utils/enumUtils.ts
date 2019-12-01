export class EnumUtils {
  public static getEnumKeys<T>(aEnumObject: T): string[] {
    const retArray = new Array<string>();
    Object.keys(aEnumObject).filter(key => isNaN(Number(key))).forEach(
      key => {
        retArray.push(key);
      });
    return retArray;
  }

  public static getEnumValues<T>(aEnumObject: T): (T[keyof T] )[] {
    const retArray = EnumUtils.getEnumKeys(aEnumObject).map((key: string) => aEnumObject[key]);
    return retArray;
  }
}
