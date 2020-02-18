import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

const headers = new HttpHeaders().set('Content-Type', 'application/json');

export enum ThemeOption {
  LIGHT = 'light',
  DARK = 'dark'
}

const DEFAULT = ThemeOption.LIGHT;
const KEY = 'theme-preference';
const LIGHT_THEME = 'light-theme';
const DARK_THEME = 'dark-theme';

export interface User {
  id: number;
  themePreference: ThemeOption;
}

@Injectable({
  providedIn: 'root'
})
export class UserPrefsService {
  private _renderer: Renderer2;

  constructor(private http: HttpClient, rendererFactory: RendererFactory2) {
    this._renderer = rendererFactory.createRenderer('body', null);
  }

  getPreferredTheme(): Observable<ThemeOption> {
    return this.http
      .get<User>(`http://localhost:3000/users/1`)
      .pipe(map(user => user.themePreference || DEFAULT));
  }

  setPreferredTheme(value): void {
    const demoUser = {
      id: 1,
      themePreference: value
    };

    this.http
      .put<User>(`http://localhost:3000/users/${demoUser.id}`, demoUser, {
        headers
      })
      .pipe(
        tap(() =>
          value === ThemeOption.DARK ? this.turnDarkOn() : this.turnLightOn()
        )
      )
      .subscribe();
  }

  turnDarkOn() {
    this._renderer.addClass(document.body, DARK_THEME);
    this._renderer.removeClass(document.body, LIGHT_THEME);
  }

  turnLightOn() {
    this._renderer.addClass(document.body, LIGHT_THEME);
    this._renderer.removeClass(document.body, DARK_THEME);
  }
}
