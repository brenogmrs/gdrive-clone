import { describe, expect, jest, test } from '@jest/globals';
import fs from 'fs';
import { UploadHandler } from '../../src/uploadHandler';
import { TestUtil } from '../_util/testUtil';

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

      const onFinish = jest.fn();

      const busboyInstance = uploadHandler.registerEvents(headers, onFinish);

      const readableStream = TestUtil.generateReadableStream([
        'chunk',
        'of',
        'data',
      ]);

      busboyInstance.emit('file', 'fieldname', readableStream, 'filename.csv');

      busboyInstance.listeners('finish')[0].call();

      expect(uploadHandler.onFile).toHaveBeenCalled();
      expect(onFinish).toHaveBeenCalled();
    });
  });
});
