import { of } from 'rxjs';
import { ProductListComponent } from './product-list.component';

describe('ProductListComponent', () => {
  let component: ProductListComponent;
  let productService: any;
  let router: any;

  const mockPage = (data: any[]) =>
    of({ data, total: data.length, page: 1, limit: 10, totalPages: 1 });

  beforeEach(() => {
    productService = jasmine.createSpyObj('ProductService', [
      'getPaginated', 'delete', 'bulkDelete', 'bulkUpdateStatus', 'exportCsv'
    ]);
    router = jasmine.createSpyObj('Router', ['navigate']);
    productService.getPaginated.and.returnValue(mockPage([{ id: 1 }, { id: 2 }, { id: 3 }]));
    component = new ProductListComponent(productService, router);
    component.ngOnInit();
  });

  afterEach(() => component.ngOnDestroy());

  it('loads products on init', () => {
    expect(productService.getPaginated).toHaveBeenCalled();
    expect(component.paginatedProducts.length).toBe(3);
  });

  it('toggles a single selection', () => {
    component.toggleSelect(1);
    expect(component.isSelected(1)).toBeTrue();
    component.toggleSelect(1);
    expect(component.isSelected(1)).toBeFalse();
  });

  it('select-all toggles every row', () => {
    expect(component.allSelected).toBeFalse();
    component.toggleSelectAll();
    expect(component.allSelected).toBeTrue();
    expect(component.selectedIds.size).toBe(3);
    component.toggleSelectAll();
    expect(component.selectedIds.size).toBe(0);
  });

  it('bulkDelete calls service with selected ids and reloads when confirmed', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    productService.bulkDelete.and.returnValue(of({ deleted: 2 }));
    component.toggleSelect(1);
    component.toggleSelect(2);
    productService.getPaginated.calls.reset();
    component.bulkDelete();
    expect(productService.bulkDelete).toHaveBeenCalledWith([1, 2]);
    expect(productService.getPaginated).toHaveBeenCalled();
  });

  it('bulkDelete does nothing when nothing is selected', () => {
    component.bulkDelete();
    expect(productService.bulkDelete).not.toHaveBeenCalled();
  });

  it('bulkSetStatus calls service with selected ids and status, then reloads', () => {
    productService.bulkUpdateStatus.and.returnValue(of({ updated: 2 }));
    component.toggleSelect(1);
    component.toggleSelect(2);
    productService.getPaginated.calls.reset();
    component.bulkSetStatus('inactive');
    expect(productService.bulkUpdateStatus).toHaveBeenCalledWith([1, 2], 'inactive');
    expect(productService.getPaginated).toHaveBeenCalled();
  });

  it('bulkSetStatus does nothing when nothing is selected', () => {
    component.bulkSetStatus('active');
    expect(productService.bulkUpdateStatus).not.toHaveBeenCalled();
  });

  it('bulkDelete aborts when the user cancels the confirm', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    component.toggleSelect(1);
    component.bulkDelete();
    expect(productService.bulkDelete).not.toHaveBeenCalled();
  });
});
