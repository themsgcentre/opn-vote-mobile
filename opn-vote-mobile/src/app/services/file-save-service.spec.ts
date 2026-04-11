import { TestBed } from '@angular/core/testing';
import { ToastController } from '@ionic/angular/standalone';

import { FileSaveService } from './file-save-service';

describe('FileSaveService', () => {
  let service: FileSaveService;

  beforeEach(() => {
    const toast = jasmine.createSpyObj<ToastController>('ToastController', ['create']);
    toast.create.and.resolveTo({
      present: jasmine.createSpy('present'),
    } as unknown as Awaited<ReturnType<ToastController['create']>>);

    TestBed.configureTestingModule({
      providers: [{ provide: ToastController, useValue: toast }],
    });
    service = TestBed.inject(FileSaveService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
