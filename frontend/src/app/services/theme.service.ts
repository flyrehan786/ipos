import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type AppTheme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private static readonly STORAGE_KEY = 'theme';

  private themeSubject: BehaviorSubject<AppTheme>;
  public theme$: Observable<AppTheme>;

  constructor() {
    this.themeSubject = new BehaviorSubject<AppTheme>(this.resolveInitialTheme());
    this.theme$ = this.themeSubject.asObservable();
  }

  /** Apply the persisted (or system) theme to the document. Call once on app start. */
  init(): void {
    this.applyTheme(this.themeSubject.value);
  }

  get current(): AppTheme {
    return this.themeSubject.value;
  }

  get isDark(): boolean {
    return this.themeSubject.value === 'dark';
  }

  toggle(): void {
    this.setTheme(this.isDark ? 'light' : 'dark');
  }

  setTheme(theme: AppTheme): void {
    localStorage.setItem(ThemeService.STORAGE_KEY, theme);
    this.themeSubject.next(theme);
    this.applyTheme(theme);
  }

  private applyTheme(theme: AppTheme): void {
    document.documentElement.setAttribute('data-bs-theme', theme);
  }

  private resolveInitialTheme(): AppTheme {
    const stored = localStorage.getItem(ThemeService.STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
    const prefersDark = typeof window !== 'undefined'
      && window.matchMedia
      && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }
}
