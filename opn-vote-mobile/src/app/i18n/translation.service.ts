import { Injectable } from '@angular/core';
import de from './translations/de';

interface TranslationMap {
  [key: string]: string | TranslationMap;
}

type TranslationValue = string | TranslationMap;
export type TranslationParams = Record<string, string | number | null | undefined>;

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  private readonly translations = de as TranslationMap;

  translate(key: string, params?: TranslationParams): string {
    const value = this.resolve(key);
    if (typeof value !== 'string') {
      return key;
    }

    if (!params) {
      return value;
    }

    return value.replace(/\{\{\s*(\w+)\s*\}\}/g, (_match, paramKey: string) => {
      const replacement = params[paramKey];
      return replacement == null ? '' : String(replacement);
    });
  }

  private resolve(key: string): TranslationValue | undefined {
    return key.split('.').reduce<TranslationValue | undefined>((current, part) => {
      if (!current || typeof current === 'string') {
        return undefined;
      }
      return current[part];
    }, this.translations);
  }
}
