import { of } from 'rxjs';
import { AuditLogListComponent } from './audit-log-list.component';

describe('AuditLogListComponent', () => {
  let component: AuditLogListComponent;
  let auditLogService: any;

  const mockPage = (data: any[]) =>
    of({ data, total: data.length, page: 1, limit: 15, totalPages: 1 });

  beforeEach(() => {
    auditLogService = jasmine.createSpyObj('AuditLogService', ['getPaginated']);
    auditLogService.getPaginated.and.returnValue(mockPage([
      { id: 1, action: 'login' }, { id: 2, action: 'delete' }
    ]));
    component = new AuditLogListComponent(auditLogService);
    component.ngOnInit();
  });

  afterEach(() => component.ngOnDestroy());

  it('loads logs on init', () => {
    expect(auditLogService.getPaginated).toHaveBeenCalled();
    expect(component.logs.length).toBe(2);
  });

  it('maps actions to badge classes', () => {
    expect(component.getActionClass('create')).toBe('bg-success');
    expect(component.getActionClass('delete')).toBe('bg-danger');
    expect(component.getActionClass('bulk-status')).toBe('bg-info');
    expect(component.getActionClass('login')).toBe('bg-secondary');
  });

  it('reloads on page change', () => {
    auditLogService.getPaginated.and.returnValue(
      of({ data: [], total: 30, page: 2, limit: 15, totalPages: 3 })
    );
    component.totalPages = 3;
    auditLogService.getPaginated.calls.reset();
    component.goToPage(2);
    expect(component.currentPage).toBe(2);
    expect(auditLogService.getPaginated).toHaveBeenCalled();
  });
});
