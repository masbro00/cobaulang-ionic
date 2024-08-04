import { TestBed } from '@angular/core/testing';

import { ThemoviedbTvShowService} from './themoviedb-tvshow.service';

describe(' ThemoviedbTvShowService', () => {
  let service:  ThemoviedbTvShowService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject( ThemoviedbTvShowService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
