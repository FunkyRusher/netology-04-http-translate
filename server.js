const http = require('http');
const port = process.env.PORT || 3000;
const querystring = require('querystring');

const https = require('https');

function serverHandler(req, res) {
    if (req.method === 'GET') {

        res.writeHead(200, 'OK', {'Content-Type': 'text/html'});
        res.write('<form action="/" method="post" style="text-align: center"><textarea name="text"></textarea><br><br><button>Отправить</button></form>');
        res.end();

    } else if (req.method === 'POST') {

        let data = '';

        req.on('data', chunk => data += chunk);

        req.on('end', () => {

            data = querystring.parse(data);

            /*

            let query = querystring.stringify({
                'key': 'trnsl.1.1.20160723T183155Z.f2a3339517e26a3c.d86d2dc91f2e374351379bb3fe371985273278df',
                'lang': 'ru-en',
                'text': data.text
            });

            let options = {
                hostname: 'translate.yandex.net',
                port: 80,
                path: '/api/v1.5/tr.json/translate?' + query,
                method: 'GET',
                query: query
            };

            Не получилось с yandexRequest = https.request(options);

            */

            let result = '';
            const yandexRequest = https.request('https://translate.yandex.net/api/v1.5/tr.json/translate?key=trnsl.1.1.20160723T183155Z.f2a3339517e26a3c.d86d2dc91f2e374351379bb3fe371985273278df&lang=ru-en&text=' + encodeURIComponent(data.text));

            yandexRequest.on('response', function(yandexResponse) {

                let translateData = '';

                yandexResponse.on('data', function (yandexChunk) {
                    translateData += yandexChunk;
                });

                yandexResponse.on('end', function () {
                    result = JSON.parse(translateData);
                    res.writeHead(200, 'OK', {'Content-Type': 'text/plain'});
                    res.write(result.text[0]);
                    res.end();
                });

            });
            yandexRequest.end();

        });

    } else {
        res.writeHead(404, 'Not Found', {'Content-Type': 'text/plain'});
        res.write('Метод не поддерживается');
        res.end();
    }
}

const server = http.createServer();
server.on('error', err => console.error(err));
server.on('request', serverHandler);
server.on('listening', () => {
    console.log('Start HTTP on port %d', port);
});
server.listen(port);