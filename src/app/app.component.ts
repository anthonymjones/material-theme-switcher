import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { UserPrefsService } from './user-prefs.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit {
  userName = new FormControl('');
  submitted = false;
  toggleTheme = new FormControl(false);

  constructor(private userPrefsService: UserPrefsService) {}

  ngOnInit() {
    this.userPrefsService.preferredTheme$
      .pipe(take(1))
      .subscribe(theme => this.toggleTheme.patchValue(theme === 'dark'));

    this.toggleTheme.valueChanges.subscribe(toggleValue => {
      if (toggleValue === true) {
        this.userPrefsService.setStoredTheme('dark');
      } else {
        this.userPrefsService.setStoredTheme('light');
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
