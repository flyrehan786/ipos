import { of } from 'rxjs';
import { SaleOrderListComponent } from './sale-order-list.component';

describe('SaleOrderListComponent', () => {
  let component: SaleOrderListComponent;
  let saleOrderService: any;
  let router: any;

  const mockPage = (data: any[]) =>
    of({ data, total: data.length, page: 1, limit: 10, totalPages: 1 });

  beforeEach(() => {
    saleOrderService = jasmine.createSpyObj('SaleOrderService', [
      'getPaginated', 'delete', 'bulkUpdateStatus', 'exportCsv'
    ]);
    router = jasmine.createSpyObj('Router', ['navigate']);
    saleOrderService.getPaginated.and.returnValue(mockPage([{ id: 1 }, { id: 2 }, { id: 3 }]));
    component = new SaleOrderListComponent(saleOrderService, router);
    component.ngOnInit();
  });

  afterEach(() => component.ngOnDestroy());

  it('loads orders on init', () => {
    expect(saleOrderService.getPaginated).toHaveBeenCalled();
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
    saleOrderService.bulkUpdateStatus.and.returnValue(of({ updated: 2 }));
    component.toggleSelect(1);
    component.toggleSelect(2);
    saleOrderService.getPaginated.calls.reset();
    component.bulkSetStatus('completed');
    expect(saleOrderService.bulkUpdateStatus).toHaveBeenCalledWith([1, 2], 'completed');
    expect(saleOrderService.getPaginated).toHaveBeenCalled();
  });

  it('bulkSetStatus does nothing when nothing is selected', () => {
    component.bulkSetStatus('cancelled');
    expect(saleOrderService.bulkUpdateStatus).not.toHaveBeenCalled();
  });
});
