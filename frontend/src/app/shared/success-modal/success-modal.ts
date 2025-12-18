import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-success-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './success-modal.html',
  styleUrl: './success-modal.scss',
})
export class SuccessModal {
  @Input() open = false;
  @Input() message = 'Operación realizada con éxito';

  @Output() closed = new EventEmitter<void>();

  close() {
    this.closed.emit();
  }
}
