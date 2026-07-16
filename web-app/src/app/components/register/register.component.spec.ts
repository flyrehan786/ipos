import { FormBuilder } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { RegisterComponent } from './register.component';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let authService: any;
  let router: any;

  const validValues = {
    full_name: 'New User',
    username: 'newuser',
    email: 'new@example.com',
    password: 'secret1',
    confirmPassword: 'secret1'
  };

  beforeEach(() => {
    authService = jasmine.createSpyObj('AuthService', ['register', 'isLoggedIn']);
    authService.isLoggedIn.and.returnValue(false);
    router = jasmine.createSpyObj('Router', ['navigate']);
    component = new RegisterComponent(new FormBuilder(), router, authService);
    component.ngOnInit();
  });

  it('starts invalid when empty', () => {
    expect(component.registerForm.valid).toBeFalse();
  });

  it('flags a password mismatch', () => {
    component.registerForm.patchValue({ ...validValues, confirmPassword: 'different' });
    expect(component.registerForm.hasError('passwordMismatch')).toBeTrue();
  });

  it('does not call the service when the form is invalid', () => {
    component.onSubmit();
    expect(authService.register).not.toHaveBeenCalled();
  });

  it('registers and redirects to login on success', () => {
    authService.register.and.returnValue(of({ userId: 5 }));
    component.registerForm.patchValue(validValues);
    component.onSubmit();
    expect(authService.register).toHaveBeenCalledWith({
      full_name: 'New User',
      username: 'newuser',
      email: 'new@example.com',
      password: 'secret1'
    });
    expect(router.navigate).toHaveBeenCalledWith(['/login'], { queryParams: { registered: '1' } });
  });

  it('surfaces the server error message on failure', () => {
    authService.register.and.returnValue(throwError(() => ({ error: { error: 'Username already exists' } })));
    component.registerForm.patchValue(validValues);
    component.onSubmit();
    expect(component.error).toBe('Username already exists');
    expect(component.loading).toBeFalse();
  });
});
