import { of } from 'rxjs';
import { UserListComponent } from './user-list.component';

describe('UserListComponent', () => {
  let component: UserListComponent;
  let userService: any;
  let router: any;

  const mockPage = (data: any[]) =>
    of({ data, total: data.length, page: 1, limit: 10, totalPages: 1 });

  beforeEach(() => {
    userService = jasmine.createSpyObj('UserService', [
      'getPaginated', 'delete', 'bulkDelete', 'bulkUpdateStatus'
    ]);    router = jasmine.createSpyObj('Router', ['navigate']);
    userService.getPaginated.and.returnValue(mockPage([{ id: 1 }, { id: 2 }, { id: 3 }]));
    component = new UserListComponent(userService, router);
    component.ngOnInit();
  });

  afterEach(() => component.ngOnDestroy());

  it('loads users on init', () => {
    expect(userService.getPaginated).toHaveBeenCalled();
    expect(component.paginatedUsers.length).toBe(3);
  });

  it('toggles a single selection', () => {
    component.toggleSelect(1);
    expect(component.isSelected(1)).toBeTrue();
    component.toggleSelect(1);
    expect(component.isSelected(1)).toBeFalse();
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
    userService.bulkDelete.and.returnValue(of({ deleted: 2 }));
    component.toggleSelect(2);
    component.toggleSelect(3);
    userService.getPaginated.calls.reset();
    component.bulkDelete();
    expect(userService.bulkDelete).toHaveBeenCalledWith([2, 3]);
    expect(userService.getPaginated).toHaveBeenCalled();
  });

  it('bulkDelete does nothing when nothing is selected', () => {
    component.bulkDelete();
    expect(userService.bulkDelete).not.toHaveBeenCalled();
  });

  it('bulkSetStatus calls service with selected ids and status, then reloads', () => {
    userService.bulkUpdateStatus.and.returnValue(of({ updated: 2 }));
    component.toggleSelect(2);
    component.toggleSelect(3);
    userService.getPaginated.calls.reset();
    component.bulkSetStatus('inactive');
    expect(userService.bulkUpdateStatus).toHaveBeenCalledWith([2, 3], 'inactive');
    expect(userService.getPaginated).toHaveBeenCalled();
  });

  it('bulkSetStatus does nothing when nothing is selected', () => {
    component.bulkSetStatus('active');
    expect(userService.bulkUpdateStatus).not.toHaveBeenCalled();
  });

  it('bulkDelete aborts when the user cancels the confirm', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    component.toggleSelect(1);
    component.bulkDelete();
    expect(userService.bulkDelete).not.toHaveBeenCalled();
  });
});
