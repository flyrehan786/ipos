import { of } from 'rxjs';
import { ClientListComponent } from './client-list.component';

describe('ClientListComponent', () => {
  let component: ClientListComponent;
  let clientService: any;
  let router: any;

  const mockPage = (data: any[]) =>
    of({ data, total: data.length, page: 1, limit: 10, totalPages: 1 });

  beforeEach(() => {
    clientService = jasmine.createSpyObj('ClientService', [
      'getPaginated', 'delete', 'bulkDelete', 'bulkUpdateStatus', 'exportCsv'
    ]);
    router = jasmine.createSpyObj('Router', ['navigate']);
    clientService.getPaginated.and.returnValue(mockPage([{ id: 1 }, { id: 2 }, { id: 3 }]));
    component = new ClientListComponent(clientService, router);
    component.ngOnInit();
  });

  afterEach(() => component.ngOnDestroy());

  it('loads clients on init', () => {
    expect(clientService.getPaginated).toHaveBeenCalled();
    expect(component.paginatedClients.length).toBe(3);
  });

  it('toggles a single selection', () => {
    component.toggleSelect(2);
    expect(component.isSelected(2)).toBeTrue();
    component.toggleSelect(2);
    expect(component.isSelected(2)).toBeFalse();
  });

  it('select-all toggles every row', () => {
    component.toggleSelectAll();
    expect(component.allSelected).toBeTrue();
    expect(component.selectedIds.size).toBe(3);
    component.toggleSelectAll();
    expect(component.selectedIds.size).toBe(0);
  });

  it('bulkDelete calls service with selected ids and reloads when confirmed', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    clientService.bulkDelete.and.returnValue(of({ deleted: 1 }));
    component.toggleSelect(3);
    clientService.getPaginated.calls.reset();
    component.bulkDelete();
    expect(clientService.bulkDelete).toHaveBeenCalledWith([3]);
    expect(clientService.getPaginated).toHaveBeenCalled();
  });

  it('bulkDelete does nothing when nothing is selected', () => {
    component.bulkDelete();
    expect(clientService.bulkDelete).not.toHaveBeenCalled();
  });

  it('bulkSetStatus calls service with selected ids and status, then reloads', () => {
    clientService.bulkUpdateStatus.and.returnValue(of({ updated: 1 }));
    component.toggleSelect(2);
    clientService.getPaginated.calls.reset();
    component.bulkSetStatus('active');
    expect(clientService.bulkUpdateStatus).toHaveBeenCalledWith([2], 'active');
    expect(clientService.getPaginated).toHaveBeenCalled();
  });

  it('bulkSetStatus does nothing when nothing is selected', () => {
    component.bulkSetStatus('inactive');
    expect(clientService.bulkUpdateStatus).not.toHaveBeenCalled();
  });

  it('bulkDelete aborts when the user cancels the confirm', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    component.toggleSelect(1);
    component.bulkDelete();
    expect(clientService.bulkDelete).not.toHaveBeenCalled();
  });
});
