import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CreateCategory } from '../model/create-request';
import { CategoryService } from '../category.service';
import { CategoryDto } from '../model/category.dto';

@Component({
  selector: 'app-recommend-category',
  standalone: true,
  imports: [ButtonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './recommend-category.component.html',
  styleUrl: './recommend-category.component.scss'
})
export class RecommendCategoryComponent implements OnInit {
  addCategoryForm!: FormGroup;
  @Output() categoryCreated = new EventEmitter<CategoryDto|null>();

  constructor(private fb: FormBuilder, private categoryService: CategoryService) {}
  ngOnInit(): void {
    this.addCategoryForm = this.fb.group({
      title: [''],
      description: ['']
    });
  }

  onSubmit() {
    const createCategory: CreateCategory = {
      title: this.addCategoryForm.value.title,
      description: this.addCategoryForm.value.description,
      pending: true
    };


    this.categoryService.create(createCategory).subscribe({
      next: (response) => {
        this.categoryCreated.emit(response);
      },
      error: (err) => {
        this.categoryCreated.emit(null);
      }
    });

    this.addCategoryForm.reset();
  }
}
