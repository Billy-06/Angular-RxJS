import { Component } from '@angular/core';
import { EMPTY, catchError } from 'rxjs';
import { ProductService } from '../product.service';

@Component({
  selector: 'pm-product-list',
  templateUrl: './product-list-alt.component.html'
})
export class ProductListAltComponent {
  pageTitle = 'Products';
  errorMessage = '';

  selectedProductId$ = this.productService.selectedProductId$;

  // products$ = this.productService.products$.pipe(
  products$ = this.productService.productsWithCategories$.pipe(
    catchError(
      err => {
        this.errorMessage = err;
        return EMPTY
      }
    )
  )

  constructor(private productService: ProductService) { }

  onSelected(productId: number): void {
    this.productService.selectedProductChangeDetector(productId);
  }
}
