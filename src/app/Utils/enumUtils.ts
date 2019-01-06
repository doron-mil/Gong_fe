export class EnumUtils {
  public static getEnumValues<T>(enumObject: T): T[] {
    const retArray = new Array<T>();
    Object.keys(enumObject).filter(key => isNaN(Number(key))).forEach(
      key => retArray.push(enumObject[key]));
    return retArray;
  }
}
