import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ThemeOption, UserPrefsService } from './user-prefs.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnDestroy, OnInit {
  userName = new FormControl('');
  submitted = false;
  toggleTheme = new FormControl(false);
  destroy$ = new Subject();

  constructor(private userPrefsService: UserPrefsService) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this.userPrefsService
      .getPreferredTheme()
      .subscribe(theme =>
        this.toggleTheme.patchValue(theme === ThemeOption.DARK)
      );

    this.toggleTheme.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((toggleValue: boolean) => {
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
