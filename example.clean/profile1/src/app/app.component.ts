import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <router-outlet></router-outlet>
    <app-login></app-login>
  `,
  styles: []
})
export class AppComponent {
  title = 'app profile 1';
}
