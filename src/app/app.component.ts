import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ThemeOption, UserPrefsService } from './user-prefs.service';

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

  ngOnInit(): void {
    this.userPrefsService
      .getPreferredTheme()
      .subscribe(theme =>
        this.toggleTheme.patchValue(theme === ThemeOption.DARK)
      );

    this.toggleTheme.valueChanges.subscribe((toggleValue: boolean) => {
      this.userPrefsService.setPreferredTheme(
        toggleValue ? ThemeOption.DARK : ThemeOption.LIGHT
      );
    });
  }

  clear(): void {
    this.userName.reset();
    this.submitted = false;
  }

  submit(): void {
    this.submitted = true;
  }
}
