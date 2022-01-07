import { describe, beforeEach, expect, jest, test } from '@jest/globals';
import { logger } from '../../src/logger.js';
import { Routes } from '../../src/routes.js';
import { UploadHandler } from '../../src/uploadHandler.js';
import { TestUtil } from '../_util/testUtil.js';

describe('Routes class test suite', () => {
  beforeEach(() => {
    jest.spyOn(logger, 'info').mockImplementation();
  });

  const request = TestUtil.generateReadableStream(['some file bytes']);
  const response = TestUtil.generateWritableStream(() => {});
  const defaultParams = {
    request: Object.assign(request, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      method: '',
      body: '',
    }),
    response: Object.assign(response, {
      setHeader: jest.fn(),
      writeHead: jest.fn(),
      end: jest.fn(),
    }),
    values: () => Object.values(defaultParams),
  };
  describe('setSocketInstance', () => {
    test('the function setSocketInstance should store io instance', () => {
      const routes = new Routes();
      const ioObj = {
        to: (id) => ioObj,
        emit: (event, message) => {},
      };

      routes.setSocketInstace(ioObj);

      expect(routes.io).toStrictEqual(ioObj);
    });
  });

  describe('handler', () => {
    const defaultParams = {
      request: {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        method: '',
        body: '',
      },
      response: {
        setHeader: jest.fn(),
        writeHead: jest.fn(),
        end: jest.fn(),
      },
      values: () => Object.values(defaultParams),
    };
    test('given an inexistent route it should choose default route', async () => {
      const routes = new Routes();
      const params = {
        ...defaultParams,
      };

      params.request.method = 'inexistent';
      await routes.handler(...params.values());

      expect(params.response.end).toHaveBeenCalledWith('Hello World');
    });

    test('it should set any requests with CORS enabled', async () => {
      const routes = new Routes();
      const params = {
        ...defaultParams,
      };

      params.request.method = 'inexistent';
      await routes.handler(...params.values());

      expect(params.response.setHeader).toHaveBeenCalledWith(
        'Access-Control-Allow-Origin',
        '*'
      );
    });

    test('given method OPTIONS it should choose options route', async () => {
      const routes = new Routes();
      const params = {
        ...defaultParams,
      };

      params.request.method = 'OPTIONS';
      await routes.handler(...params.values());

      expect(params.response.writeHead).toHaveBeenCalledWith(204);
      expect(params.response.end).toHaveBeenCalled();
    });

    test('given method POST it should choose post route', async () => {
      const routes = new Routes();
      const params = {
        ...defaultParams,
      };

      params.request.method = 'POST';

      jest.spyOn(routes, routes.post.name).mockResolvedValue();

      await routes.handler(...params.values());

      expect(routes.post).toHaveBeenCalled();
    });

    test('given method GET it should choose get route', async () => {
      const routes = new Routes();
      const params = {
        ...defaultParams,
      };

      params.request.method = 'GET';

      jest.spyOn(routes, routes.get.name).mockResolvedValue();

      await routes.handler(...params.values());

      expect(routes.get).toHaveBeenCalled();
    });
  });

  describe('GET route test suite', () => {
    test('given method GET it shoul list all files downloaded', async () => {
      const routes = new Routes();

      const params = {
        ...defaultParams,
      };

      const filesStatusesMock = [
        {
          size: '21.2 kB',
          birthtime: '2021-12-26T20:44:52.126',
          owner: 'breno',
          file: 'img.jpg',
        },
      ];

      jest
        .spyOn(routes.fileHelper, routes.fileHelper.getFileStatus.name)
        .mockResolvedValue(filesStatusesMock);

      params.request.method = 'GET';

      await routes.handler(...params.values());

      expect(params.response.writeHead).toHaveBeenCalledWith(200);
      expect(params.response.end).toHaveBeenCalledWith(
        JSON.stringify(filesStatusesMock)
      );
    });
  });

  describe('POST route test suite', () => {
    test('it should validate post route workflow', async () => {
      const routes = new Routes('/tmp');
      const options = {
        ...defaultParams,
      };

      options.request.method = 'POST';
      options.request.url = '?socketId=10';

      jest
        .spyOn(
          UploadHandler.prototype,
          UploadHandler.prototype.registerEvents.name
        )
        .mockImplementation((headers, onFinish) => {
          const writable = TestUtil.generateWritableStream(() => {});
          writable.on('finish', onFinish);

          return writable;
        });

      await routes.handler(...options.values());

      expect(UploadHandler.prototype.registerEvents).toHaveBeenCalled();
      expect(options.response.writeHead).toHaveBeenCalledWith(200);

      const expectedResponseEndResult = JSON.stringify({
        result: 'files uploaded',
      });
      expect(options.response.end).toHaveBeenCalledWith(
        expectedResponseEndResult
      );
    });
  });
});
