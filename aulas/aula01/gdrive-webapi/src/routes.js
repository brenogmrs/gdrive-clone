import { dirname, resolve } from 'path';
import { pipeline } from 'stream/promises';
import { fileURLToPath, parse } from 'url';
import { FileHelper } from './fileHelper.js';
import { logger } from './logger.js';
import { UploadHandler } from './uploadHandler.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const defaultDownloadsFolder = resolve(__dirname, '../', 'downloads');

export class Routes {
  constructor(downloadsFolder = defaultDownloadsFolder) {
    this.downloadsFolder = downloadsFolder;
    this.fileHelper = FileHelper;
    this.io = {};
  }

  setSocketInstace(io) {
    this.io = io;
  }

  async defaultRoute(request, response) {
    response.end('Hello World');
  }

  async options(request, response) {
    response.writeHead(204);
    response.end();
  }

  async post(request, response) {
    const { headers } = request;

    const {
      query: { socketId },
    } = parse(request.url, true);

    const uploadHandler = new UploadHandler({
      socketId,
      io: this.io,
      downloadsFolder: this.downloadsFolder,
    });

    const onFinish = (response) => () => {
      response.writeHead(200);
      const data = JSON.stringify({ result: 'files uploaded' });
      response.end(data);
    };

    const busboyInstance = uploadHandler.registerEvents(
      headers,
      onFinish(response)
    );

    await pipeline(request, busboyInstance);

    logger.info('request finished successfully');
  }

  async get(request, response) {
    logger.info('GET');

    const files = await this.fileHelper.getFileStatus(this.downloadsFolder);

    response.writeHead(200);

    response.end(JSON.stringify(files));
  }

  handler(request, response) {
    response.setHeader('Access-Control-Allow-Origin', '*');

    const chosen = this[request.method.toLowerCase()] || this.defaultRoute;

    return chosen.apply(this, [request, response]);
  }
}
