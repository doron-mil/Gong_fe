export class DateFormat {
  template: string;
  delimiter: string = '/';
  delimited: string;

  constructor(aTemplate: string, aDelimiter: string) {
    this.template = aTemplate;
    if (aDelimiter) {
      this.changeDelimited(aDelimiter);
    }
  }


  public changeDelimited(aDelimiter: string) {
    if (aDelimiter) {
      this.delimiter = aDelimiter;
    }

    this.delimited = this.template.replace(/\//g, this.delimiter);
  }

  public convertToDateFormatter() {
    const newDateFormat = new DateFormat(this.template, null);
    newDateFormat.delimiter = this.delimiter;
    newDateFormat.delimited = this.delimited;
    newDateFormat.delimited = newDateFormat.delimited.replace(/YY/g, 'yy');
    newDateFormat.delimited = newDateFormat.delimited.replace(/DD/g, 'dd');

    return newDateFormat;
  }
}
