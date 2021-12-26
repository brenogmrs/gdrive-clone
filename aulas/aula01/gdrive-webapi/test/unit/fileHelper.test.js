import { describe, expect, jest, test } from '@jest/globals';
import fs from 'fs';
import { FileHelper } from '../../src/fileHelper';

describe('File Helper class test suite', () => {
  describe('getFileStatus', () => {
    test('it should return files statuses in correct format', async () => {
      const statMock = {
        dev: 2064,
        mode: 33188,
        nlink: 1,
        uid: 1000,
        gid: 1000,
        rdev: 0,
        blksize: 4096,
        ino: 1096882,
        size: 21201,
        blocks: 48,
        atimeMs: 1640551610295.8545,
        mtimeMs: 1640551610194,
        ctimeMs: 1640551610185.8545,
        birthtimeMs: 1640551492125.8545,
        atime: '2021-12-26T20:46:50.296Z',
        mtime: '2021-12-26T20:46:50.194Z',
        ctime: '2021-12-26T20:46:50.186Z',
        birthtime: '2021-12-26T20:44:52.126',
      };

      const mockUser = 'breno';
      process.env.USER = mockUser;

      const filename = 'img.jpg';

      jest
        .spyOn(fs.promises, fs.promises.readdir.name)
        .mockResolvedValue([filename]);

      jest
        .spyOn(fs.promises, fs.promises.stat.name)
        .mockResolvedValue(statMock);

      const result = await FileHelper.getFileStatus('/tmp');

      const expectedRes = [
        {
          size: '21.2 kB',
          birthtime: statMock.birthtime,
          owner: mockUser,
          file: filename,
        },
      ];

      expect(fs.promises.stat).toHaveBeenCalledWith(`/tmp/${filename}`);
      expect(result).toMatchObject(expectedRes);
    });
  });
});
