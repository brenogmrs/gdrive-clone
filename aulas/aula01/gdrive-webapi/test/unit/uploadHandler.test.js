import { describe, expect, jest, test } from '@jest/globals';
import fs from 'fs';
import { UploadHandler } from '../../src/uploadHandler';

describe('Upload Handler class test suite', () => {
  const ioObj = {
    to: (id) => ioObj,
    emit: (event, message) => {},
  };
  describe('registerEvents function', () => {
    test('should call onFile and onFinish functions on BusBoy instance', () => {
      const uploadHandler = new UploadHandler({
        io: ioObj,
        socketId: '01',
      });

      jest.spyOn(uploadHandler, uploadHandler.onFile.name).mockResolvedValue();

      const headers = {
        'content-type': 'multipart/form-data; boundary=',
      };

      const fn = jest.fn();

      uploadHandler.registerEvents(headers, fn);

      expect(uploadHandler.onFile).toHaveBeenCalled();
      expect(fn).toHaveBeenCalled();
    });
  });
  test('aaa', () => {
    expect(true).toBeTruthy();
  });
});
