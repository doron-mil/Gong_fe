export enum NotificationTypesEnum {
  TREE_INITIALIZATION_SUCCESS,
  TREE_INITIALIZATION_FAILED,
  TREE_IS_DIRTY,
  TREE_IS_CLEAN,
  NOT_FOUND_SEARCH_OBJECT,
  TRANSLATION_COMPLETE,
  ENGLISH_COPY_COMPLETE,
}

export class LanguageProperties {
  name: string;
  nativeName: string;
  lang: string;
  isRtl: boolean;
  isPreLoaded = false;
  isAdded = false;
  isDisplayed = false;
  isCustomized = false;

  constructor(name: string, nativeName: string, code: string, isRtl: boolean = false) {
    this.name = name;
    this.nativeName = nativeName;
    this.lang = code;
    this.isRtl = isRtl;
  }
}
