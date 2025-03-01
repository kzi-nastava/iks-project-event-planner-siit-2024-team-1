import { Component, OnInit, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CurrencyPipe, CommonModule } from '@angular/common';
import { BudgetDTO } from '../model/budget-dto';
import { BudgetService } from '../budget.service';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../../event.service';
import { CreateEventResponseDTO } from '../../my-events/dtos/CreateEventResponse.dto';
import { MerchandiseOverviewDTO } from '../../../merchandise/merchandise/model/merchandise-overview-dto';
import { forkJoin } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { EditBudgetFormComponent } from "../edit-budget-form/edit-budget-form.component";
import { AddBudgetFormComponent } from "../add-budget-form/add-budget-form.component";
import { MerchandiseComponent } from "../../../merchandise/merchandise/merchandise-component/merchandise.component";
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-budget',
  standalone: true,
  imports: [ButtonModule, TableModule, CurrencyPipe, CommonModule, DialogModule, EditBudgetFormComponent, AddBudgetFormComponent, MerchandiseComponent, ToastModule],
  templateUrl: './budget.component.html',
  styleUrl: './budget.component.scss',
  providers: [MessageService]
})
export class BudgetComponent implements OnInit {
  budget: BudgetDTO | null = null;
  event: CreateEventResponseDTO | null = null;
  selectBudgetItemId!: number;
  displayMerchandises: boolean = false;
  displayEditForm: boolean = false;
  displayAddForm: boolean = false;
  @ViewChild(MerchandiseComponent) merchandiseComponent!: MerchandiseComponent;
  constructor(private budgetService: BudgetService, private route: ActivatedRoute, private eventService: EventService, private router: Router, private messageService: MessageService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('eventId');
    const eventId = id ? Number(id) : -1;

   if(eventId !== -1) {
    forkJoin({
      event: this.eventService.getById(eventId),
      budget: this.budgetService.getBudgetByEventId(eventId)
    }).subscribe({
      next: ({ event, budget }) => {
        this.event = event;
        this.budget = budget;
      },
      error: (err) => {
        if (err.error && err.error.message) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error loading Budget',
            detail: err.error.message
          });
        } else if (err.message) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error loading Budget',
            detail: err.message
          });
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error loading Budget',
            detail: 'Failed to load Budget. Try reloading page.'
          });
        }
      }
    });
   }
  }

  isVisible(merchandise: MerchandiseOverviewDTO) {
    return merchandise !== null;
  }

  chooseMerchandise(categoryId: number, maxAmount: number) {
    this.displayMerchandises = true;
    this.merchandiseComponent.eventId = this.event!.id;
    this.merchandiseComponent.getMerchandiseByCategory(categoryId, maxAmount);
  }

  displayAddBudgetItemForm() {
    this.displayAddForm = true;
  }

  addBudgetItem(updatedBudget: BudgetDTO) {
    this.budget = updatedBudget;
    this.displayAddForm = false;
  }

  seeMerchandiseDetails(merchandise: MerchandiseOverviewDTO) {
    if(merchandise.type==='Service')
      this.router.navigate(['home','service', merchandise.id]);
    else {
      this.router.navigate(['home', 'product', merchandise.id, this.event?.id]);
    }
  }

  openEditForm(budgetItemId: number) {
    this.selectBudgetItemId = budgetItemId;
    this.displayEditForm = true;
  }

  editBudgetItem(updatedBudget: BudgetDTO) {
    this.budget = updatedBudget;
    this.displayEditForm = false;
  }

  deleteBudgetItem(budgetItemId: number) {
    if(this.budget !== null) {
      this.budgetService.deleteBudgetItem(budgetItemId, this.budget.budgetId).subscribe({
        next: (response) => {
          this.budget = response;
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error deleting Budget Item',
            detail: 'Failed to delete Budget Item. Please try again.'
          });
        }
      });
    }
  }
}
