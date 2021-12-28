import BusBoy from 'busboy';
import { pipeline } from 'stream/promises';

export class UploadHandler {
  constructor({ io, socketId, downloadsFolder }) {
    this.io = io;
    this.socketId = socketId;
    this.downloadsFolder = downloadsFolder;
  }

  handleFileBytes() {}

  async onFile(fieldname, file, filename) {
    await pipeline(file, this.handleFileBytes.apply(this, [filename]));
  }

  registerEvents(headers, onFinish) {
    const busboy = new BusBoy({ headers });

    busboy.on('file', this.onFile.bind(this));

    busboy.on('finish', onFinish);

    return busboy;
  }
}
