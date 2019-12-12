import {OnDestroy, OnInit} from '@angular/core';
import {Subject} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {takeUntil} from 'rxjs/operators';

export class BaseComponent implements OnInit, OnDestroy {

  constructor(private translateService: TranslateService = null) {
  }

  translationMap = new Map<string, string>();

  protected onDestroy$ = new Subject<boolean>();

  ngOnInit() {
    this.translateNeededText();
    this.listenForUpdates();
    this.hookOnInit();

    if (this.translateService) {
      this.translateService.onLangChange.pipe(
        takeUntil(this.onDestroy$))
        .subscribe(() => this.translateNeededText());
    }
  }

  ngOnDestroy() {
    this.onDestroy$.next(true);
    this.onDestroy$.complete();
  }

  protected listenForUpdates() {
  }

  protected hookOnInit() {
  }

  protected getKeysArray4Translations(): string[] {
    return [];
  }

  protected getTranslation(aKey: string): string {

    return this.translationMap.get(aKey);
  }

  private translateNeededText() {
    this.translationMap.clear();
    const keysArray = this.getKeysArray4Translations();
    if (!this.translateService || keysArray.length <= 0) {
      return;
    }

    this.translateService.get(keysArray).subscribe(transResult => {
      keysArray.forEach((key) => this.translationMap.set(key, transResult[key]));
    });
  }

}
