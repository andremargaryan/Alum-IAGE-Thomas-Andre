import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, inject } from '@angular/core';

@Component({
  selector: 'app-ambient-bg',
  standalone: true,
  templateUrl: './ambient-bg.component.html',
  styleUrl: './ambient-bg.component.scss'
})
export class AmbientBgComponent implements AfterViewInit, OnDestroy {
  private readonly ngZone = inject(NgZone);
  private readonly hostRef = inject(ElementRef<HTMLElement>);

  private rafId: number | null = null;
  private targetX = 50;
  private targetY = 35;
  private currentX = 50;
  private currentY = 35;

  private readonly onMouseMove = (event: MouseEvent): void => {
    this.targetX = (event.clientX / window.innerWidth) * 100;
    this.targetY = (event.clientY / window.innerHeight) * 100;
  };

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => {
      window.addEventListener('mousemove', this.onMouseMove, { passive: true });

      const loop = () => {
        this.currentX += (this.targetX - this.currentX) * 0.055;
        this.currentY += (this.targetY - this.currentY) * 0.055;

        const el = this.hostRef.nativeElement;
        el.style.setProperty('--mx', `${this.currentX.toFixed(2)}%`);
        el.style.setProperty('--my', `${this.currentY.toFixed(2)}%`);

        this.rafId = requestAnimationFrame(loop);
      };

      this.rafId = requestAnimationFrame(loop);
    });
  }

  ngOnDestroy(): void {
    window.removeEventListener('mousemove', this.onMouseMove);
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
    }
  }
}