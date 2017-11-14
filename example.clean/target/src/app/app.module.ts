import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { WelcomeModule } from './welcome/welcome.module';

import { AngularFireModule } from 'angularfire2';
import { AngularFirestoreModule } from 'angularfire2/firestore';   
import { environment } from '../environments/environment';

@NgModule({
  declarations: [
    AppComponent,
    
  ],
  imports: [    
    BrowserModule,

    AngularFireModule.initializeApp(environment.firebase),    
    AngularFirestoreModule.enablePersistence(), 

    AppRoutingModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
