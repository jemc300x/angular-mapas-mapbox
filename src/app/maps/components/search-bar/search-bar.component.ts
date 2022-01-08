import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component } from '@angular/core';
import { PlacesService } from '../../services';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.css'],
  animations: [
    trigger('openClose',[
      state('open', style({
        height: 'calc(100% - 190px)',
      })),
      state('closed', style({
        height: '70px',
      })),
      transition('open => closed', [
        animate('0.5s')
      ]),
      transition('closed => open', [
        animate('0.5s')
      ]),
    ])
  ]
})
export class SearchBarComponent {

  private debounceTimer?: NodeJS.Timeout;
  showResult = false;


  constructor(private placesService: PlacesService) {
    this.placesService.showResult$.subscribe(value => this.showResult = value);
  }

  onQueryChanged(query: string) {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);

    this.debounceTimer = setTimeout(() => {
      console.log(query);
      this.placesService.getPlacesByQuery(query);
    }, 350);

  }

  onToggle() {
    this.showResult = !this.showResult;
    this.placesService.updateShowResult(this.showResult);
  }

}
