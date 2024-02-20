import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { BehaviorSubject, catchError, combineLatest, map, Observable, tap, throwError } from 'rxjs';

import { Product } from './product';
import { ProductCategoryService } from '../product-categories/product-category.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsUrl = 'api/products';
  private suppliersUrl = 'api/suppliers';
  

  // Declare reactive product observable
  products$ = this.http.get<Product[]>(this.productsUrl)
      .pipe(
      map(products => products.map( item => ({
        ...item,
        price: item.price ? item.price * 1.5 : 0,
        searchKey: [item.productName]
      } as Product))),
      catchError(this.handleError)
  );
          
  productsWithCategories$ = combineLatest([this.products$, this.productCatService.productCategories$]).pipe(
    tap(([products, categories]) => console.log(
      `Tapped Products: ${products}, Tapped categories: ${categories}`
    )),
    map(([products, categories]) => products.map( item => ({
        ...item,
        price: item.price ? item.price * 1.5 : 0,
        category: categories.find( cat => cat.id === item.categoryId )?.name,
        searchKey: [item.productName]
      } as Product))),
    tap(data => console.log('Products: ', JSON.stringify(data))),
    catchError(this.handleError)
  )
  
  private productSelectedSubject =  new BehaviorSubject<number>(0);
  selectedProductId$ = this.productSelectedSubject.asObservable();

  selectedProduct$ = combineLatest([
    this.productsWithCategories$,
    this.selectedProductId$
  ]).pipe(
    map(([products, prodId]) => products.find(product => prodId ? product.id === prodId : true )
    ),
    tap(prod => console.log(`Selected Product: ${prod}`))
  )

    selectedProductChangeDetector(prodId: number){
      this.productSelectedSubject.next(prodId);
    }

  constructor(private http: HttpClient, private productCatService: ProductCategoryService) { }

  private fakeProduct(): Product {
    return {
      id: 42,
      productName: 'Another One',
      productCode: 'TBX-0042',
      description: 'Our new product',
      price: 8.9,
      categoryId: 3,
      // category: 'Toolbox',
      quantityInStock: 30
    };
  }

  private handleError(err: HttpErrorResponse): Observable<never> {
    // in a real world app, we may send the server to some remote logging infrastructure
    // instead of just logging it to the console
    let errorMessage: string;
    if (err.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      errorMessage = `Backend returned code ${err.status}: ${err.message}`;
    }
    console.error(err);
    return throwError(() => errorMessage);
  }

}
