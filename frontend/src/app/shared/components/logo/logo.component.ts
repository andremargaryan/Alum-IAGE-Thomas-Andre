import { Component, input } from '@angular/core';

@Component({
  selector: 'app-logo',
  standalone: true,
  templateUrl: './logo.component.html',
  styleUrl: './logo.component.scss'
})
export class LogoComponent {
  showText = input<boolean>(true);
  size = input<'sm' | 'md' | 'lg'>('md');
}