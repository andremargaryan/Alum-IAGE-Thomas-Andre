import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { LoaderComponent } from './shared/components/loader/loader.component';
import { AmbientBgComponent } from './shared/components/ambient-bg/ambient-bg.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    LoaderComponent,
    AmbientBgComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {}