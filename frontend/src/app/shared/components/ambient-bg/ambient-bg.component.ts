import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-ambient-bg',
  standalone: true,
  templateUrl: './ambient-bg.component.html',
  styleUrl: './ambient-bg.component.scss',
  host: {
    '(window:mousemove)': 'onMouseMove($event)'
  }
})
export class AmbientBgComponent {
  readonly mouseX = signal(500);
  readonly mouseY = signal(300);

  onMouseMove(event: MouseEvent): void {
    this.mouseX.set(event.clientX);
    this.mouseY.set(event.clientY);
  }
}