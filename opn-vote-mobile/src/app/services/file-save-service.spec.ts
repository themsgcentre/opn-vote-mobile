import { TestBed } from '@angular/core/testing';
import { ToastController } from '@ionic/angular/standalone';

import { FileSaveService } from './file-save-service';

describe('FileSaveService', () => {
  let service: FileSaveService;

  beforeEach(() => {
    const present = jest.fn();
    const toast = {
      create: jest.fn().mockResolvedValue({
        present,
      } as unknown as Awaited<ReturnType<ToastController['create']>>),
    } as unknown as ToastController;

    TestBed.configureTestingModule({
      providers: [{ provide: ToastController, useValue: toast }],
    });
    service = TestBed.inject(FileSaveService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
