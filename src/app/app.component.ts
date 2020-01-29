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
  }

  clear() {
    this.userName.reset();
    this.submitted = false;
  }

  submit() {
    this.submitted = true;
  }
}
