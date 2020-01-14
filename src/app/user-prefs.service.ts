import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserPrefsService {
  private _renderer: Renderer2;

  preferredTheme = new BehaviorSubject<string>(null);
  preferredTheme$ = this.preferredTheme.asObservable();

  constructor(rendererFactory: RendererFactory2) {
    this._renderer = rendererFactory.createRenderer('body', null);
    this.preferredTheme.next(this.getStoredTheme());
  }

  setStoredTheme(preference: 'light' | 'dark'): void {
    localStorage.setItem('theme', preference);
    this.preferredTheme.next(preference);
    this.changeTheme(preference);
  }

  private getStoredTheme(): string {
    const storedTheme =
      (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
    this.changeTheme(storedTheme);
    return storedTheme;
  }

  private changeTheme(preference: 'light' | 'dark'): void {
    if (preference === 'dark') {
      this._renderer.addClass(document.body, 'dark-theme');
      this._renderer.removeClass(document.body, 'light-theme');
    } else {
      this._renderer.addClass(document.body, 'light-theme');
      this._renderer.removeClass(document.body, 'dark-theme');
    }
  }
}
