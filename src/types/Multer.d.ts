declare namespace Express {
  namespace Multer {
    interface File {
      filePath: string;
      fileLength: number;
      manifestPath: string;
    }
  }
}
