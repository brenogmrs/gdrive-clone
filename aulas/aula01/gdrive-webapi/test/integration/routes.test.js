import { describe, test, expect, jest } from '@jest/globals';
import fs from 'fs';
import FormData from 'form-data';
import { TestUtil } from '../_util/testUtil.js';
describe('routes integration tests', () => [
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
    });
  }),
]);
