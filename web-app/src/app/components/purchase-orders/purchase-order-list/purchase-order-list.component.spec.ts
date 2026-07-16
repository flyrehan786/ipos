import { of } from 'rxjs';
import { PurchaseOrderListComponent } from './purchase-order-list.component';

describe('PurchaseOrderListComponent', () => {
  let component: PurchaseOrderListComponent;
  let purchaseOrderService: any;
  let router: any;

  const mockPage = (data: any[]) =>
    of({ data, total: data.length, page: 1, limit: 10, totalPages: 1 });

  beforeEach(() => {
    purchaseOrderService = jasmine.createSpyObj('PurchaseOrderService', [
      'getPaginated', 'delete', 'bulkUpdateStatus', 'exportCsv'
    ]);
    router = jasmine.createSpyObj('Router', ['navigate']);
    purchaseOrderService.getPaginated.and.returnValue(mockPage([{ id: 1 }, { id: 2 }, { id: 3 }]));
    component = new PurchaseOrderListComponent(purchaseOrderService, router);
    component.ngOnInit();
  });

  afterEach(() => component.ngOnDestroy());

  it('loads orders on init', () => {
    expect(purchaseOrderService.getPaginated).toHaveBeenCalled();
    expect(component.paginatedOrders.length).toBe(3);
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

  it('bulkSetStatus calls service with selected ids and status, then reloads', () => {
    purchaseOrderService.bulkUpdateStatus.and.returnValue(of({ updated: 2 }));
    component.toggleSelect(1);
    component.toggleSelect(2);
    purchaseOrderService.getPaginated.calls.reset();
    component.bulkSetStatus('completed');
    expect(purchaseOrderService.bulkUpdateStatus).toHaveBeenCalledWith([1, 2], 'completed');
    expect(purchaseOrderService.getPaginated).toHaveBeenCalled();
  });

  it('bulkSetStatus does nothing when nothing is selected', () => {
    component.bulkSetStatus('cancelled');
    expect(purchaseOrderService.bulkUpdateStatus).not.toHaveBeenCalled();
  });
});
