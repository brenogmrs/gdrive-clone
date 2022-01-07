import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  jest,
  test,
} from '@jest/globals';
import FormData from 'form-data';
import fs from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { logger } from '../../src/logger.js';
import { Routes } from '../../src/routes.js';
import { TestUtil } from '../_util/testUtil.js';
describe('routes integration tests', () => {
  let defaultDownloadFolder = '';
  beforeAll(async () => {
    defaultDownloadFolder = await fs.promises.mkdtemp(
      join(tmpdir(), 'downloads-')
    );
  });

  afterAll(async () => {
    await fs.promises.rm(defaultDownloadFolder, { recursive: true });
  });

  beforeEach(() => {
    jest.spyOn(logger, 'info').mockImplementation();
  });

  const ioObj = {
    to: (id) => ioObj,
    emit: (event, message) => {},
  };

  describe('upload file', () => {
    test('should upload file to the folder', async () => {
      const filename = 'mockfile.txt';
      const fileStream = fs.createReadStream(
        `./test/integration/mocks/${filename}`
      );
      const response = TestUtil.generateWritableStream();
      const form = new FormData();
      form.append('textfile', fileStream);

      const defaultParams = {
        request: Object.assign(form, {
          headers: form.getHeaders(),
          method: 'POST',
          url: '?socketId=10',
        }),
        response: {
          setHeader: jest.fn(),
          writeHead: jest.fn(),
          end: jest.fn(),
        },
        values: () => Object.values(defaultParams),
      };

      const routes = new Routes(defaultDownloadFolder);
      routes.setSocketInstace(ioObj);
      const dir = await fs.promises.readdir(defaultDownloadFolder);

      expect(dir).toEqual([]);
      await routes.handler(...defaultParams.values());

      const dirWithFile = await fs.promises.readdir(defaultDownloadFolder);

      expect(dirWithFile).toEqual([filename]);
      expect(defaultParams.response.writeHead).toHaveBeenCalledWith(200);

      const expectedResponseEndResult = JSON.stringify({
        result: 'files uploaded',
      });
      expect(defaultParams.response.end).toHaveBeenCalledWith(
        expectedResponseEndResult
      );
    });
  });
});
