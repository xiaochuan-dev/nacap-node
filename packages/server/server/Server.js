const Koa = require('koa');
const { WebSocketServer } = require('ws');
const { createServer, Server } = require('http');
const { compile } = require('handlebars');
const { renderToString } = require('react-dom/server');
const { readFile } = require('fs/promises');
const { join, resolve } = require('path');
const { Sniffer } = require('@xiaochuan-dev/nacap-node');
const { Parse } = require('@xiaochuan-dev/nacap-parse');

const port = 9000;

const clientPath = join(__dirname, '../dist/client');

class ServerWithWs extends Koa {
  /**
   * @type {Server}
   */
  server;
  /**
   * @type {WebSocketServer}
   */
  wss;

  sniffer = new Sniffer();

  clients = new Set();

  constructor(options) {
    super(options);
  }

  initRoute() {
    this.use(async (ctx) => {
      switch (ctx.path) {
        case '/':
        case '/index.html': {
          const template = compile(await readFile(join(__dirname, 'index.hbs'), 'utf-8'));
          const appElem = require('../dist/server/App').default;
          const html = renderToString(appElem);
          const res = template({ content: html });

          ctx.body = res;
          ctx.type = 'html';

          break;
        }
        case '/main.css': {
          const css = await readFile(join(clientPath, 'main.css'), 'utf-8');
          ctx.body = css;
          ctx.type = 'css';
          break;
        }
        case '/vendor.css': {
          const css = await readFile(join(clientPath, 'vendor.css'), 'utf-8');
          ctx.body = css;
          ctx.type = 'css';
          break;
        }

        case '/main.js': {
          const js = await readFile(join(clientPath, 'main.js'), 'utf-8');
          ctx.body = js;
          ctx.type = 'js';
          break;
        }
        case '/vendor.js': {
          const js = await readFile(join(clientPath, 'vendor.js'), 'utf-8');
          ctx.body = js;
          ctx.type = 'js';
          break;
        }
        case '/main.js.map': {
          const js = await readFile(join(clientPath, 'main.js.map'), 'utf-8');
          ctx.body = js;
          ctx.type = 'js';
          break;
        }

        case '/font.woff2': {
          const js = await readFile(resolve(__dirname, 'font.woff2'));
          ctx.body = js;
          ctx.type = 'font/woff2';
          break;
        }

        // api start
        case '/getalldevs': {
          const alldevs = Sniffer.getAllDevs();
          ctx.body = alldevs;
          ctx.type = 'json';
          break;
        }

        case '/setdev': {
          const { devname } = ctx.query;
          if (devname?.length > 0) {
            this.sniffer.setCurDevname(devname);
            ctx.body = {
              success: true,
            };
          } else {
            ctx.body = {
              success: false,
            }
          }
          ctx.type = 'json';
          break;
        }
        case '/getdev': {
          const name = this.sniffer.curDevname;
          ctx.body = {
            devname: name ?? '',
          };
          ctx.type = 'json';
          break;
        }

        case '/start': {
          this.sniffer.startCapture((raw) => {
            const b = Buffer.from(raw.data);
            const p = new Parse(b, raw.length);
            const res = p.startParse();
            this.broadcase(JSON.stringify({
              hex: b.toString('hex'),
              data: res,
              time: new Date().toISOString(),
            }));
          });

          ctx.body = {
            success: true,
          };
          ctx.type = 'json';
          break;
        }
        case '/stop': {
          this.sniffer.stopCapture();
          ctx.body = {
            success: true,
          };
          ctx.type = 'json';
          break;
        }
        case '/running': {
          const running = this.sniffer.isRunning();
          ctx.body = {
            running
          };
          ctx.type = 'json';
          break;
        }

        default:
          break;
      }
    });
  }

  initWs() {
    this.wss.on('connection', (ws) => {
      this.clients.add(ws);
      ws.on('error', console.error);

      ws.on('close', () => {
        this.clients.delete(ws);
      });
    });
  }

  broadcase(message) {
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  start() {
    this.initRoute();
    this.server = createServer(this.callback());

    this.wss = new WebSocketServer({ server: this.server });
    this.initWs();

    this.server.listen(port, () => {
      console.log(`server in port ${port}`);
    });

  }

}

module.exports = {
  ServerWithWs
}