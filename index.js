const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');  // 添加cookie解析中间件

app.use(cookieParser());  // 启用cookie解析

// -- 引入自定义模块
const ConfigHandlers = require('./js/configHandlers');
const config = new ConfigHandlers(path.join(__dirname, 'data'));
// -- 载入中间件
const middlewares = require('./js/middlewares.js');

app.use(
    middlewares.errhandle
    , middlewares.verifyMethod
    , middlewares.verify
);

app.get(/.*/, handleGet);

app.listen(config.get('port', 'server'), () => {
    console.log(`Server is running on port ${config.get('port', 'server')}`);
});


function handleGet(req, res) {
    const basePath = path.join(__dirname, 'data', 'web');
    let filePath = path.join(basePath, req.path);
    if (req.path === '/') {
        filePath = path.join(basePath, 'index.html');
    }
    // 检查文件是否存在
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            res.status(404).send('Not found');
            return;
        }

        // 设置正确的内容类型
        const ext = path.extname(filePath);
        const mimeTypes = {
            '.html': 'text/html',
            '.css': 'text/css',
            '.js': 'application/javascript'
        };
        const contentType = mimeTypes[ext] || 'text/plain';

        // 读取并返回文件
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.status(500).send('Internal server error');
                return;
            }
            res.setHeader('Content-Type', contentType);
            res.send(data);
        });
    });
}
