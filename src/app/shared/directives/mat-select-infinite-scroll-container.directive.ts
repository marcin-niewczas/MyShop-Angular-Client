import { Directive, ElementRef, OnInit } from '@angular/core';

@Directive({
  selector: '[matSelectInfiniteScrollContainer]',
  standalone: true,
})
export class MatSelectInfiniteScrollContainerDirective implements OnInit {
  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    this.elementRef.nativeElement.style.overflowY = 'auto';
    this.elementRef.nativeElement.style.overflowX = 'hidden';
    this.elementRef.nativeElement.style.maxHeight = '230px';
  }
}
