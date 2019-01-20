import { TestBed, inject } from '@angular/core/testing';

import { JsonConverterService } from './json-converter.service';

describe('JsonConverterService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [JsonConverterService]
    });
  });

  it('should be created', inject([JsonConverterService], (service: JsonConverterService) => {
    expect(service).toBeTruthy();
  }));
});
