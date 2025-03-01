import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';

import { EventService } from '../../../event/event.service';
import { MerchandiseService } from '../../../merchandise/merchandise/merchandise.service';
import { SidebarModule } from 'primeng/sidebar';
import { ButtonModule } from 'primeng/button';
import { FiltersComponent } from "../filter/filter.component";
import { SearchService } from '../search.service';

@Component({
  selector: 'app-search-header',
  standalone: true,
  imports: [DropdownModule, FormsModule, SidebarModule, ButtonModule, FiltersComponent],
  templateUrl: './search-header.component.html',
  styleUrl: './search-header.component.scss'
})
export class SearchHeaderComponent implements OnInit{
  public eventSortOptions!:string[];
  public selectedEventSortOption:string='';
  public merchandiseSortOptions!:string[];
  public selectedMerchandiseSortOption:string='';
  public filtersVisible:boolean=false;

  constructor(private eventService:EventService,private merchandiseService:MerchandiseService,private searchService:SearchService){}
  ngOnInit(): void {
    this.eventSortOptions=this.eventService.SortOptions;
    this.merchandiseSortOptions=this.merchandiseService.SortOptions;
  }

  onMerchandiseSortChange(event:any){
    this.searchService.updateMerchandiseSort(event.value);
  }

  onEventSortChange(event:any){
    this.searchService.updateEventSort(event.value);
  }

}
