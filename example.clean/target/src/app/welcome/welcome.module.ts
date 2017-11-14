import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WelcomeRoutingModule } from './welcome-routing.module';
import { WelcomeComponent } from './welcome.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    WelcomeRoutingModule,
    SharedModule,
  ],
  declarations: [WelcomeComponent]
})
export class WelcomeModule { }
