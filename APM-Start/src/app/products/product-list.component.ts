import { ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import { EMPTY, Subject, catchError, combineLatest, map, startWith } from 'rxjs';
import { ProductCategory } from '../product-categories/product-category';
import { ProductService } from './product.service';
import { ProductCategoryService } from '../product-categories/product-category.service';

@Component({
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent {
  pageTitle = 'Product List';
  errorMessage = '';

  // Create an action stream to emit the filter action from teh user
  //  Set it to private to prevent other components from completing it or processing it's err
  private selectedCategoryId = new Subject<number>();
  // only expose the readOnly values using 'asObservable'
  categoryAction$ = this.selectedCategoryId.asObservable();

  // The products should contain a combination of both products and a user action stream
  products$ = combineLatest([
    this.productService.productsWithCategories$,
    this.categoryAction$.pipe(
      startWith(0)
    )
  ]).pipe(
      map(([products, category]) => products.filter(
          product => category ? product.categoryId === category : true
        )
      ),
      catchError(
        err => {
          this.errorMessage = err;
          return EMPTY;
        }
      )
    )

  productCategories$ = this.productCatService.productCategories$.pipe(
    catchError(
      err => { 
        this.errorMessage = err;
        return EMPTY;
      }
    )
  )

  constructor(private productService: ProductService, private productCatService: ProductCategoryService) { }

  onAdd(): void {
    console.log('Not yet implemented');
  }

  onSelected(categoryId: string): void {
    this.selectedCategoryId.next(+categoryId);
  }
}
