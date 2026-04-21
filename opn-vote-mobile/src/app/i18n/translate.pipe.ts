import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslationParams, TranslationService } from './translation.service';

@Pipe({
  name: 'translate',
  standalone: true,
})
export class TranslatePipe implements PipeTransform {
  private readonly translationService = inject(TranslationService);

  transform(key: string | null | undefined, params?: TranslationParams): string {
    if (!key) {
      return '';
    }

    return this.translationService.translate(key, params);
  }
}
