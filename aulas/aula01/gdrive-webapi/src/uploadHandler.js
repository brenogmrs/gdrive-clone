import BusBoy from 'busboy';
import fs from 'fs';
import { pipeline } from 'stream/promises';
import { logger } from '../src/logger.js';

export class UploadHandler {
  constructor({ io, socketId, downloadsFolder, messageTimeDelay = 200 }) {
    this.io = io;
    this.socketId = socketId;
    this.downloadsFolder = downloadsFolder;
    this.ON_UPLOAD_EVENT = 'file_upload';
    this.messageTimeDelay = messageTimeDelay;
  }

  canExecute(lastExecution) {
    return Date.now() - lastExecution >= this.messageTimeDelay;
  }

  handleFileBytes(filename) {
    this.lastMessageSent = Date.now();

    async function* handleData(source) {
      let alreadyProcessed = 0;
      for await (const chunk of source) {
        yield chunk;
        alreadyProcessed += chunk.length;

        if (!this.canExecute(this.lastMessageSent)) {
          continue;
        }

        this.lastMessageSent = Date.now();

        this.io
          .to(this.socketId)
          .emit(this.ON_UPLOAD_EVENT, { alreadyProcessed, filename });

        logger.info(
          `File [${filename}] got ${alreadyProcessed} bytes to ${this.socketId}`
        );
      }
    }
    return handleData.bind(this);
  }

  async onFile(fieldname, file, filename) {
    const savePath = `${this.downloadsFolder}/${filename}`;

    await pipeline(
      file,
      this.handleFileBytes.apply(this, [filename]),
      fs.createWriteStream(savePath)
    );

    logger.info(`File [${filename}] finished`);
  }

  registerEvents(headers, onFinish) {
    const busboy = new BusBoy({ headers });

    busboy.on('file', this.onFile.bind(this));

    busboy.on('finish', onFinish);

    return busboy;
  }
}
