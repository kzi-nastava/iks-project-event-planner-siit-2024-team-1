import { Component } from '@angular/core';
import { EventsComponent } from "../event/events/events.component";
import { MerchandiseComponent } from "../merchandise/merchandise/merchandise.component";
import { SearchHeaderComponent } from "./search-header/search-header.component";


@Component({
  selector: 'app-search-page',
  standalone: true,
  imports: [EventsComponent, MerchandiseComponent, SearchHeaderComponent, SearchHeaderComponent],
  templateUrl: './search-page.component.html',
  styleUrl: './search-page.component.scss'
})
export class SearchPageComponent {
}
