import { Component, OnInit, Renderer2 } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit {
  userName = new FormControl('');
  submitted = false;
  toggleTheme = new FormControl(false);

  constructor(private _renderer: Renderer2) {}

  ngOnInit() {
    this.toggleTheme.valueChanges.subscribe(toggleValue => {
      if (toggleValue === true) {
        this._renderer.addClass(document.body, 'dark-theme');
        this._renderer.removeClass(document.body, 'light-theme');
      } else {
        this._renderer.addClass(document.body, 'light-theme');
        this._renderer.removeClass(document.body, 'dark-theme');
      }
    });

    const handleMatchEvent = (
      matchEvent: MediaQueryList | MediaQueryListEvent
    ) => {
      this.toggleTheme.patchValue(!!matchEvent.matches);
    };

    const matchMediaPreferDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    );

    handleMatchEvent(matchMediaPreferDark);

    // Checking to see if addEventListener is available in the browser (it's not in Safari)
    if (
      matchMediaPreferDark.addEventListener &&
      matchMediaPreferDark.addEventListener instanceof Function
    ) {
      matchMediaPreferDark.addEventListener('change', event => {
        handleMatchEvent(event);
      });
    } else {
      matchMediaPreferDark.addListener(handleMatchEvent);
    }
  }

  clear() {
    this.userName.reset();
    this.submitted = false;
  }

  submit() {
    this.submitted = true;
  }
}
