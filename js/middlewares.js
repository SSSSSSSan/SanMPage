const { v4: uuidv4 } = require('uuid');
const ConfigHandlers = require('./configHandlers.js');
const config = new ConfigHandlers();

// 创建token存储Map
const tokenMap = new Map();

// 清理过期token的函数
function cleanupExpiredTokens() {
    const currentTime = Date.now();
    for (const [uuid, timestamp] of tokenMap.entries()) {
        if (currentTime - timestamp > 2000) {
            tokenMap.delete(uuid);
        }
    }
}

function errhandle(error, req, res, next) {
    console.log(error);
    res.status(500).send('Internal Server Error');
    return;
}
function verifyMethod(req, res, next) {
    try {
        if (!['GET'].includes(req.method)) {
            res.status(401).send('Unauthorized');
            return;
        }
        next();
    } catch (err) {
        next(err);
    }
}

// 验证token是否有效
function isValidToken(token) {
    if (!token) return false;

    try {
        const tokenData = JSON.parse(token);
        const { uuid, timestamp } = tokenData;
        const currentTime = Date.now();

        // 检查token是否在Map中且匹配时间戳
        if (tokenMap.has(uuid) && tokenMap.get(uuid) === timestamp) {
            // 检查token是否在2秒有效期内
            if (currentTime - timestamp <= 2000) {
                return true;
            }
        }
    } catch (err) {
        console.error('Invalid token format', err);
    }
    return false;
}

// 生成并设置新token
function generateAndSetToken(res) {
    const uuid = uuidv4();
    const timestamp = Date.now();
    const tokenData = { uuid, timestamp };
    const token = JSON.stringify(tokenData);

    // 将token存入Map
    tokenMap.set(uuid, timestamp);
    res.cookie('token', token, { maxAge: 2000, httpOnly: true });

    return token;
}

function verify(req, res, next) {
    try {
        cleanupExpiredTokens();

        // 先验证账户密码
        const user = {
            name: req.query?.name || '*',
            pass: req.query?.password * 1 || req.query?.password || '*'
        };

        if (
            config.verify('name', user.name, 'user') &&
            config.verify('password', user.password, 'user')
        ) {
            // 无条件生成并设置新token
            generateAndSetToken(res);
            next();
            return;
        }

        // 如果账户密码验证失败，再检查token
        if (req.cookies.token && isValidToken(req.cookies.token)) {
            next();
            return;
        }

        console.log(`[middlewares][verify]auth failed`);
        console.log(user);
        console.log(config.get('user', 'user'), config.get('password', 'user'));
        res.status(401).send('Unauthorized');
    } catch (err) {
        next(err);
    }
}

module.exports = {
    errhandle,
    verify,
    verifyMethod,
};
