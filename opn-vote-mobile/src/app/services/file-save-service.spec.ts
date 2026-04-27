import { TestBed } from '@angular/core/testing';
import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { ToastController } from '@ionic/angular/standalone';

import { FileSaveService } from './file-save-service';

jest.mock('@capacitor/filesystem', () => ({
  Directory: {
    External: 'External',
    Documents: 'Documents',
  },
  Filesystem: {
    writeFile: jest.fn(() => Promise.resolve({ uri: '' })),
    requestPermissions: jest.fn(() => Promise.resolve({ publicStorage: 'granted' })),
  },
}));

describe('FileSaveService', () => {
  let service: FileSaveService;
  let toastCreate: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    const present = jest.fn();
    toastCreate = jest.fn().mockResolvedValue({
      present,
    } as unknown as Awaited<ReturnType<ToastController['create']>>);

    TestBed.configureTestingModule({
      providers: [
        {
          provide: ToastController,
          useValue: { create: toastCreate } as unknown as ToastController,
        },
      ],
    });
    service = TestBed.inject(FileSaveService);

    jest.spyOn(Capacitor, 'isNativePlatform').mockReturnValue(false);
    jest.spyOn(Capacitor, 'getPlatform').mockReturnValue('web');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('savePdf (web)', () => {
    it('triggers download with .pdf suffix when missing', async () => {
      const click = jest.fn();
      const link = { href: '', download: '', click: click } as unknown as HTMLAnchorElement;
      jest.spyOn(document, 'createElement').mockReturnValue(link);

      const createObjectURL = jest.fn().mockReturnValue('blob:mock');
      const revokeObjectURL = jest.fn();
      const prevCreate = Object.getOwnPropertyDescriptor(URL, 'createObjectURL');
      const prevRevoke = Object.getOwnPropertyDescriptor(URL, 'revokeObjectURL');
      Object.defineProperty(URL, 'createObjectURL', { value: createObjectURL, configurable: true });
      Object.defineProperty(URL, 'revokeObjectURL', { value: revokeObjectURL, configurable: true });

      try {
        await service.savePdf({ fileName: 'wahlzettel', pdfBytes: new Uint8Array([37, 80, 68, 70]) });
      } finally {
        if (prevCreate) Object.defineProperty(URL, 'createObjectURL', prevCreate);
        else delete (URL as unknown as { createObjectURL?: unknown }).createObjectURL;
        if (prevRevoke) Object.defineProperty(URL, 'revokeObjectURL', prevRevoke);
        else delete (URL as unknown as { revokeObjectURL?: unknown }).revokeObjectURL;
      }

      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(link.download).toBe('wahlzettel.pdf');
      expect(click).toHaveBeenCalled();
      expect(createObjectURL).toHaveBeenCalled();
      expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock');
    });
  });

  describe('savePdf (native)', () => {
    beforeEach(() => {
      jest.spyOn(Capacitor, 'isNativePlatform').mockReturnValue(true);
    });

    it('writes under Documents on iOS and requests permissions', async () => {
      jest.spyOn(Capacitor, 'getPlatform').mockReturnValue('ios');

      await service.savePdf({ fileName: 'export', pdfBytes: new Uint8Array([1, 2]) });

      expect(Filesystem.requestPermissions).toHaveBeenCalled();
      expect(Filesystem.writeFile).toHaveBeenCalledWith(
        expect.objectContaining({
          path: 'export.pdf',
          directory: Directory.Documents,
          recursive: true,
        }),
      );
      expect(toastCreate).toHaveBeenCalled();
    });

    it('writes under External/pdfs on Android without requestPermissions', async () => {
      jest.spyOn(Capacitor, 'getPlatform').mockReturnValue('android');

      await service.savePdf({ fileName: 'x.pdf', pdfBytes: new Uint8Array([9]) });

      expect(Filesystem.requestPermissions).not.toHaveBeenCalled();
      expect(Filesystem.writeFile).toHaveBeenCalledWith(
        expect.objectContaining({
          path: 'pdfs/x.pdf',
          directory: Directory.External,
          recursive: true,
        }),
      );
    });
  });
});
