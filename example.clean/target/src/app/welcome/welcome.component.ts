import { Component, OnInit } from '@angular/core';

import parse from 'url-parse'
import { Router } from '@angular/router';
import { ApiService } from '../core/github/api.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit {

  public txtQuery = '' //'https://github.com/photonstorm/phaser3-examples';
  public error
  
  private txtQueryChanged: Subject<string> = new Subject<string>();
  
  constructor(
    private router: Router,
    private apiService: ApiService
  ) { 
    this.txtQueryChanged
    .debounceTime(300) // wait 1 sec after the last event before emitting last event
    .filter(it => it.length > 2)
    .distinctUntilChanged() // only emit if value is different from previous value
    .mergeMap( model => this.apiService.search(model))
    .subscribe(result => {
      console.log(result);

      // Call your function which calls API or do anything you would like do after a lag of 1 sec
      // this.getDataFromAPI(this.txtQuery);
     });

  }

  ngOnInit() {
  }

  start($event){
    $event.preventDefault()
    this.error = null;

    let parsed = parse(this.txtQuery)
    let keys = parsed.pathname.split('/').filter(it => !!it)
    if(parsed.host != 'github.com' || keys.length < 2){
      this.error = 'wrong repo url'
    } else {
      this.router.navigate(['project', keys[0], keys[1]])
    }
    
  }

  onChange($event){
    this.txtQuery = $event
    this.txtQueryChanged.next($event)
  }


}
