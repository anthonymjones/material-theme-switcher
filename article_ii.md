# Angular Material Theme Switcher: Part II

## Intro

In my [previous article](https://github.com/anthonymjones/material-theme-switcher/wiki/Article-I), I demonstrated how to:

- Build a simple Angular Material theme switcher
- Add Angular Material Modules to your application
- And build custom Angular Material themes

One thing was missing though: The functionality for persisting the preferred theme through a page reload. In this article, I’ll explore three different strategies for persisting a user’s theme preference including getting the theme preference set by the user in their operating system. If you’d like to follow along, check out [the Github repo here](https://github.com/anthonymjones/material-theme-switcher).

## Strategy 1: Local Storage

For this strategy, I created a new `UserPrefsService`. At the top of the file, above the Angular `@Injectable` decorator, I added an `enum` and a few `const`s which help with typing and eliminate the use of “magic strings”.

```typescript
export enum ThemeOption {
  LIGHT = 'light',
  DARK = 'dark'
}

const DEFAULT = ThemeOption.LIGHT;
const KEY = 'theme-preference';
const LIGHT_THEME = 'light-theme';
const DARK_THEME = 'dark-theme';
```

Inside the service class, I created a getter and a setter for the application’s `preferredTheme`:

```typescript
get preferredTheme(): ThemeOption {
  return (localStorage.getItem(KEY) as ThemeOption) || DEFAULT;
}
```

The getter returns the value of the `localStorage` `‘theme-preference’ key if it exists, otherwise, the default theme (light) is used.

```typescript
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
```

The setter sets the `localStorage` key/value pair and toggles the active theme using the `_renderer` instance.

```typescript
constructor(rendererFactory: RendererFactory2) {
  this._renderer = rendererFactory.createRenderer('body', null);
  this.preferredTheme = this.preferredTheme;
}
```

I moved the `Renderer2` injection from the component to the service in this strategy. When injecting `Renderer2` in a service, I found that it is necessary to inject `RendererFactory2` and set up a renderer instance within the `constructor`. The `createRenderer` method takes a `hostElement` and a `type`. Here I set the `hostElement` as `‘body’` and the `type` as `null`.

I also set `this.preferredTheme` to `this.preferredTheme`, which triggers the initial theme setting or change.

In the `AppComponent`, I inject the `UserPrefsService` in the `constructor`:

```typescript
constructor(private userPrefsService: UserPrefsService) {}

ngOnDestroy(): void {
 this.destroy$.next();
 this.destroy$.complete();
}

ngOnInit(): void {
 this.toggleTheme.patchValue(
   this.userPrefsService.preferredTheme === ThemeOption.DARK
 );

 this.toggleTheme.valueChanges
   .pipe(takeUntil(this.destroy$))
   .subscribe((toggleValue: boolean) => {
     this.userPrefsService.preferredTheme = toggleValue
       ? ThemeOption.DARK
       : ThemeOption.LIGHT;
   });
}
```

Inside the `patchValue` of the `toggleTheme` `FormControl`, I passed in a conditional statement based on the `userPrefsService` `preferredTheme` getter. If the `preferredTheme` is dark, the slide toggle is set to true. I also subscribe to the `toggleTheme` `FormControl`’s `valueChanges` and update the `preferredTheme` using the `userPrefsService` `preferredTheme` setter.

## Strategy 2: API Request

The API Request strategy is very similar to the strategy for Local Storage. In fact, I created a branch off of the local-storage feature branch and made the necessary modifications. For the purpose of this demo, I set up a json-server and `db.json` file.

```typescript
constructor(private http: HttpClient, rendererFactory: RendererFactory2) {
  this._renderer = rendererFactory.createRenderer('body', null);
}
```

I removed the line where I set `this.preferredTheme` to `this.preferredTheme`. This initialization now occurs in the `AppComponent`.

```typescript
getPreferredTheme(): Observable<ThemeOption> {
  return this.http
    .get<User>(`http://localhost:3000/users/1`)
    .pipe(map(user => user.themePreference || DEFAULT));
}
```

Rather than a getter, the `getPreferredTheme` is now a method that calls an API via the `HttpClient` _**(You need to import the HttpClientModule in your AppModule for this to work)**_. The `getPreferredTheme` method returns a value from the `ThemeOption` `enum`.

Rather than a setter, `setPreferredTheme` is also now a method which calls an API via the `HttpClient`:

```typescript
setPreferredTheme(value: ThemeOption): void {
 const demoUser = {
  id: 1,
  themePreference: value
 };

 this.http
   .put<User>(`http://localhost:3000/users/${demoUser.id}`, demoUser, {
     headers
   })
   .subscribe(() =>
     value === ThemeOption.DARK ? this.turnDarkOn() : this.turnLightOn()
   );
}
```

In the `this.http.put()`, I passed in `demoUser` which has a `themePreference` property. For this version, I extracted the renderer functionality into individual methods, which are called from a ternary inside an RxJS `tap` operator. Personally, I like how much cleaner this makes the `setPreferredTheme`.

Back in the `app.component.ts`, rather than the getter and setter, I call the service methods `getPreferredTheme` and `setPreferredTheme` from the `ngOnInit`.

```typescript
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
```

Note that I am using the `takeUntil` RxJS operator on the `valueChanges` observable, but not on `getPreferredTheme`. That’s because Http calls auto-complete, however, the observable on the `FormControl` does not, potentially causing memory leaks and unintended side-effects. `this.destroy$` is an RxJS `Subject`, which completes in the `ngOnDestroy`:

```typescript
ngOnDestroy(): void {
 this.destroy$.next();
 this.destroy$.complete();
}
```

## Strategy 3: OS Theme Preference

I have to say, this strategy was the most fun to learn about and probably my favorite out of the three. The fact that the user doesn’t have to do anything to set their theme preference is a big win in my book.

```typescript
const matchMediaPreferDark = window.matchMedia('(prefers-color-scheme: dark)');
```

Here, I call a method called `matchMedia` on the TypeScript interface `Window`. This method takes a query which is a `string` of a JSON key-value pair: `‘{key: value}’`. The key-value pair I need is `‘{prefers-color-scheme: dark}’`. The method returns a `MediaQueryList`, an object which contains the following properties:

- media
- matches
- onchange

```typescript
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
```

Next, I added a listener, but because Safari doesn’t support the `addEventListener` method, I check the browser’s compatibility first. If `addEventListener` exists, and it is a `Function`, I add the method passing in a `“change”` type event listener with a callback function as parameters. If `addEventListener` does not exist or it’s not a `Function`, I use the `addListener` method which, unfortunately, is deprecated but necessary for Safari. This method takes the callback function as its only parameter.

```typescript
const handleMatchEvent = (matchEvent: MediaQueryList | MediaQueryListEvent) => {
  this.toggleTheme.patchValue(!!matchEvent.matches);
};

handleMatchEvent(matchMediaDark);
```

To handle the `matchMedia` event, I created this `handleMatchEvent` function which takes a `matchEvent`: either a `MediaQueryList` or `MediaQueryListEvent`. Both of these types have the `matches` property on them. I then pass `!!matchEvent.matches` to the `FormControl` `patchValue` method, which adjusts the slide toggle as necessary.

## Recap

In this article, I showed how to persist a user’s theme preference in three different ways:

- Using Local Storage
- Requesting data from an API
- Accessing the user’s operating system preferences through their browser

Hopefully, the next time you write a theme switcher one of (or a combination of) these strategies is a great fit for your application. Thank you for reading!

To see the code and run the demo, check out [the Github repo](https://github.com/anthonymjones/material-theme-switcher).

For more info on Angular Material, check out [material.angular.io](https://material.angular.io/).

For help choosing theme colors, check out [the official material palette generator](https://material.io/design/color/the-color-system.html#tools-for-picking-colors).
