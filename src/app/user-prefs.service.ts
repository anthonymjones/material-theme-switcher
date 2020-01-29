import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

export enum ThemeOption {
  LIGHT = 'light',
  DARK = 'dark'
}

const DEFAULT = ThemeOption.LIGHT;
const KEY = 'theme-preference';
const LIGHT_THEME = 'light-theme';
const DARK_THEME = 'dark-theme';

@Injectable({
  providedIn: 'root'
})
export class UserPrefsService {
  private _renderer: Renderer2;

  get preferredTheme(): ThemeOption {
    return (localStorage.getItem(KEY) as ThemeOption) || DEFAULT;
  }

  set preferredTheme(value: ThemeOption) {
    localStorage.setItem(KEY, value);

    if (value === ThemeOption.DARK) {
      this._renderer.addClass(document.body, DARK_THEME);
      this._renderer.removeClass(document.body, LIGHT_THEME);
    } else {
      this._renderer.addClass(document.body, LIGHT_THEME);
      this._renderer.removeClass(document.body, DARK_THEME);
    }
  }

  constructor(rendererFactory: RendererFactory2) {
    this._renderer = rendererFactory.createRenderer('body', null);
    this.preferredTheme = this.preferredTheme;
  }
}
