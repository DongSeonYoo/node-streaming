import * as http from 'http';
import * as url from 'url';
import * as path from 'path';
import * as zlib from 'zlib';
import * as httpAttach from 'http-attach';
import * as fsProvider from './fsProvider';
import * as debugPlayer from './debugPlayer';

const CONTENT_TYPE = {
  MANIFEST: 'application/vnd.apple.mpegurl',
  SEGMENT: 'video/MP2T',
  HTML: 'text/html',
};

class HLSServer {
  private path: string;
  private dir: string;
  private debugPlayer: boolean;
  private provider: any;

  constructor(
    server: number | http.Server,
    opts?: { path?: string; dir?: string; debugPlayer?: boolean; provider?: any },
  ) {
    if (!(this instanceof HLSServer)) return new HLSServer(server, opts);

    if (server) this.attach(server, opts);
  }

  public attach(
    server: number | http.Server,
    opts?: { path?: string; dir?: string; debugPlayer?: boolean; provider?: any },
  ) {
    opts = opts || {};
    this.path = opts.path || this.path || '/';
    this.dir = opts.dir || this.dir || '';
    this.debugPlayer = opts.debugPlayer == null ? true : opts.debugPlayer;
    this.provider = opts.provider || fsProvider;

    if (typeof server !== 'number') {
      httpAttach(server, this._middleware.bind(this));
    } else {
      const port = server;
      server = http.createServer();
      httpAttach(server, this._middleware.bind(this));
      server.listen(port);
    }
  }

  private _middleware(req: http.IncomingMessage, res: http.ServerResponse, next: () => void) {
    const uri = url.parse(req.url!).pathname!;
    const relativePath = path.relative(this.path, uri);
    const filePath = path.join(this.dir, relativePath);
    const extension = path.extname(filePath);

    (req as any).filePath = filePath;

    // Gzip support
    const ae = req.headers['accept-encoding'] || '';
    (req as any).acceptsCompression = /\bgzip\b/.test(ae);

    if (uri === '/player.html' && this.debugPlayer) {
      this._writeDebugPlayer(res, next);
      return;
    }

    this.provider.exists(req, (err: Error, exists: boolean) => {
      if (err) {
        res.statusCode = 500;
        res.end();
      } else if (!exists) {
        res.statusCode = 404;
        res.end();
      } else {
        switch (extension) {
          case '.m3u8':
            this._writeManifest(req, res, next);
            break;
          case '.ts':
            this._writeSegment(req, res, next);
            break;
          default:
            next();
            break;
        }
      }
    });
  }

  private _writeDebugPlayer(res: http.ServerResponse, next: () => void) {
    res.setHeader('Content-Type', CONTENT_TYPE.HTML);
    res.statusCode = 200;
    // TODO: Use HLS.js
    res.write(debugPlayer.html);
    res.end();
    next();
  }

  private _writeManifest(req: http.IncomingMessage, res: http.ServerResponse, next: () => void) {
    this.provider.getManifestStream(req, (err: Error, stream: NodeJS.ReadableStream) => {
      if (err) {
        res.statusCode = 500;
        res.end();
        return next();
      }

      res.setHeader('Content-Type', CONTENT_TYPE.MANIFEST);
      res.statusCode = 200;

      if ((req as any).acceptsCompression) {
        res.setHeader('content-encoding', 'gzip');
        res.statusCode = 200;
        const gzip = zlib.createGzip();
        stream.pipe(gzip).pipe(res);
      } else {
        stream.pipe(res, 'utf-8');
      }
    });
  }

  private _writeSegment(req: http.IncomingMessage, res: http.ServerResponse, next: () => void) {
    this.provider.getSegmentStream(req, (err: Error, stream: NodeJS.ReadableStream) => {
      if (err) {
        res.statusCode = 500;
        res.end();
        return;
      }
      res.setHeader('Content-Type', CONTENT_TYPE.SEGMENT);
      res.statusCode = 200;
      stream.pipe(res);
    });
  }
}
