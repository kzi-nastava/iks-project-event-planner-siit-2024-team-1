import { Component, Output,EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { SliderModule } from 'primeng/slider';
import { FilterFormValues } from './form-values';
import { SearchService } from '../search.service';

@Component({
  selector: 'app-filter',
  standalone: true,
  imports: [SliderModule,ButtonModule,FormsModule,ReactiveFormsModule,AccordionModule,CheckboxModule,CalendarModule,FloatLabelModule,InputTextModule],
  templateUrl: './filter.component.html',
  styleUrl: './filter.component.scss'
})
export class FiltersComponent {
  filterForm: FormGroup;
  @Output() filterValuesEmmiter = new EventEmitter<FilterFormValues>();

  constructor(private fb: FormBuilder,private searchService:SearchService) {
    this.filterForm = this.fb.group({
      showEvents: [true],
      showServices: [true],
      showProducts: [true],
      events: this.fb.group({
        eventDate: [''],
        type: [''],
        city: ['']
      }),
      services: this.fb.group({
        priceMin: [''],
        priceMax: [''],
        category: [''],
        durationMin: [''],
        durationMax: [''],
        city: ['']
      }),
      products: this.fb.group({
        priceMin: [''],
        priceMax: [''],
        category: [''],
        durationMin: [''],
        durationMax: [''],
        city: ['']
      })
    });
  }

  resetFilters() {
    this.filterForm.reset({
      showEvents: true,         // Set the default value for showEvents
      showServices: true,       // Set the default value for showServices
      showProducts: true,       // Set the default value for showProducts
      events: {
        eventDate: '',          // Reset eventDate to an empty string
        type: '',               // Reset type to an empty string
        city: ''                // Reset city to an empty string
      },
      services: {
        priceMin: '',           // Reset priceMin to an empty string
        priceMax: '',           // Reset priceMax to an empty string
        category: '',           // Reset category to an empty string
        durationMin: '',        // Reset durationMin to an empty string
        durationMax: '',        // Reset durationMax to an empty string
        city: ''                // Reset city to an empty string
      },
      products: {
        priceMin: '',           // Reset priceMin to an empty string
        priceMax: '',           // Reset priceMax to an empty string
        category: '',           // Reset category to an empty string
        durationMin: '',        // Reset durationMin to an empty string
        durationMax: '',        // Reset durationMax to an empty string
        city: ''                // Reset city to an empty string
      }
    });
    this.applyFilters();
  }
  

  applyFilters(): void {
    this.searchService.updateFilters(this.filterForm.value);
  }
}
