import { Component, OnInit, signal } from '@angular/core';
import { LogoComponent } from '../logo/logo.component';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [LogoComponent],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.scss'
})
export class LoaderComponent implements OnInit {
  readonly visible = signal(true);
  readonly fadingOut = signal(false);
  readonly progress = signal(0);

  ngOnInit(): void {
    const interval = setInterval(() => {
      this.progress.update((val) => {
        const next = val + Math.floor(Math.random() * 18) + 12;
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => this.fadingOut.set(true), 180);
          setTimeout(() => this.visible.set(false), 750);
          return 100;
        }
        return next;
      });
    }, 110);
  }
}