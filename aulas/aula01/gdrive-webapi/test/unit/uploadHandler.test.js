import { describe, expect, jest, test } from '@jest/globals';
import fs from 'fs';
import { resolve } from 'path';
import { pipeline } from 'stream/promises';
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

  describe('onFile function', () => {
    test('given an stream file it should save it on disc storage', async () => {
      const chunks = ['hey', 'dude'];
      const downloadsFolder = '/tmp';

      const uploadHandler = new UploadHandler({
        io: ioObj,
        socketId: '01',
        downloadsFolder,
      });

      const onData = jest.fn();

      jest
        .spyOn(fs, fs.createWriteStream.name)
        .mockImplementation(() => TestUtil.generateWritableStream(onData));

      const onTransform = jest.fn();

      jest
        .spyOn(uploadHandler, uploadHandler.handleFileBytes.name)
        .mockImplementation(() => TestUtil.generatTransformStream(onTransform));

      const params = {
        fieldname: 'video',
        file: TestUtil.generateReadableStream(chunks),
        filename: 'mockFileName.mov',
      };

      await uploadHandler.onFile(...Object.values(params));

      expect(onData.mock.calls.join()).toEqual(chunks.join());
      expect(onTransform.mock.calls.join()).toEqual(chunks.join());

      const expectedFilename = resolve(
        uploadHandler.downloadsFolder,
        params.filename
      );

      expect(fs.createWriteStream).toHaveBeenCalledWith(expectedFilename);
    });
  });

  describe('handleFileBytes function', () => {
    test('should call the emit function and it is a transform stream', async () => {
      jest.spyOn(ioObj, ioObj.to.name);
      jest.spyOn(ioObj, ioObj.emit.name);

      const handler = new UploadHandler({
        io: ioObj,
        socketId: '01',
      });

      const messages = ['hello'];

      const source = TestUtil.generateReadableStream(messages);
      const onWrite = jest.fn();

      const target = TestUtil.generateWritableStream(onWrite);

      await pipeline(source, handler.handleFileBytes('filename.csv'), target);

      expect(ioObj.to).toHaveBeenCalledTimes(messages.length);
      expect(ioObj.emit).toHaveBeenCalledTimes(messages.length);
      expect(onWrite).toBeCalledTimes(messages.length);
      expect(onWrite.mock.calls.join()).toEqual(messages.join());
    });
  });
});
