import { Component } from '@angular/core';
import { MarkerService } from './marker.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Map-app';

  constructor(private markerService: MarkerService) { }

  ngOnInit() {
    this.markerService.appFunction();
  }
}
