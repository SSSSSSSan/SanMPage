const path = require('path');
const fs = require('fs');
class Config {
    static instance = null;
    watcher = null;
    debounceTimer = null;

    constructor(dir, configFilePath = null) {
        if (Config.instance) {
            console.log('[configHandlers][constructor]已有实例');
            return Config.instance;
        }
        Config.instance = this;

        this.usingConfigName = 'config.ini';

        try {
            let filePath;
            if (configFilePath) {
                // 使用指定的配置文件路径
                filePath = configFilePath;
                this.usingConfigName = path.basename(configFilePath);
            } else {
                // 尝试在dir读取config.ini
                const configPath = path.join(dir, 'config.ini');
                if (fs.existsSync(configPath)) {
                    filePath = configPath;
                } else {
                    // 如果config.ini不存在，尝试读取config.example.ini
                    const examplePath = path.join(dir, 'config.example.ini');
                    if (fs.existsSync(examplePath)) {
                        filePath = examplePath;
                        this.usingConfigName = 'config.example.ini';
                    } else {
                        throw new Error('Neither config.ini nor config.example.ini found in directory: ' + dir);
                    }
                }
            }

            // 读取并解析INI文件
            const fileContent = fs.readFileSync(filePath, 'utf8');
            this.config = this._parseIni(fileContent);
            this.configFilePath = filePath;
            this._setupWatcher(); // 设置文件监视
            console.log(`[configHandlers][constructor]加载配置文件: ${this.usingConfigName}`)
        } catch (err) {
            console.error('Error loading configuration:', err);
            throw err;
        }
        // console.log(this.config);
    }

    static getInstance() {
        if (!Config.instance) {
            Config.instance = new Config();
        }
        return Config.instance;
    }
    getUsingConfigName() {
        return this.usingConfigName;
    }
    get(key, section = null) {
        if (section) {
            return this.config[section]?.[key];
        }

        // 如果没有指定section，搜索所有section
        for (const sectionName in this.config) {
            if (this.config[sectionName][key] !== undefined) {
                return this.config[sectionName][key];
            }
        }

        return undefined;
    }
    verify(key, value, section = null) {
        const target = this.get(key, section);
        if (target === "*") return true;
        if (Array.isArray(target)) {
            // 数组值搜索
            return target.some(item => {
                if (typeof item === 'string' && typeof value === 'string') {
                    return item.toLowerCase() === value.toLowerCase();
                }
                return item === value;
            });
        } else if (target !== undefined) {
            // 单值比较
            if (typeof target === 'string' && typeof value === 'string') {
                return target.toLowerCase() === value.toLowerCase();
            }
            return target === value;
        }

        return false;
    }

    _parseIni(content) {
        const result = {};
        let currentSection = null;

        const lines = content.split(/\r?\n/);
        for (const line of lines) {
            const trimmedLine = line.trim();

            // 跳过空行和注释
            if (!trimmedLine || trimmedLine.startsWith(';') || trimmedLine.startsWith('#')) {
                continue;
            }

            // 处理节(section)
            const sectionMatch = trimmedLine.match(/^\[([^\]]+)\]$/);
            if (sectionMatch) {
                currentSection = sectionMatch[1];
                result[currentSection] = {};
                continue;
            }

            // 处理键值对
            const keyValueMatch = trimmedLine.match(/^([^=]+)=(.*)$/);
            if (keyValueMatch) {
                const key = keyValueMatch[1].trim();
                let value = keyValueMatch[2].trim();

                // 处理数组（逗号分隔的值）
                if (value.includes(',')) {
                    value = value.split(',').map(item => {
                        const trimmed = item.trim();
                        // 空字符串保持原值
                        if (trimmed === '') return '';
                        // 对每个元素单独进行类型转换
                        if (trimmed.toLowerCase() === 'true') return true;
                        if (trimmed.toLowerCase() === 'false') return false;
                        // 避免空字符串转为0
                        if (trimmed !== '' && !isNaN(trimmed)) return Number(trimmed);
                        return trimmed;
                    });
                } else {
                    // 处理单个值
                    if (value === '') {
                        // 空字符串保持原值
                    } else if (value.toLowerCase() === 'true') value = true;
                    else if (value.toLowerCase() === 'false') value = false;
                    else if (!isNaN(value) && value !== '') value = Number(value);
                }

                if (currentSection) {
                    result[currentSection][key] = value;
                } else {
                    result[key] = value;
                }
            }
        }

        return result;
    }

    _setupWatcher() {
        if (this.watcher) {
            this.watcher.close();
        }
        this.watcher = fs.watch(this.configFilePath, (eventType) => {
            if (eventType === 'change') {
                // 防抖处理，避免频繁触发
                clearTimeout(this.debounceTimer);
                this.debounceTimer = setTimeout(() => {
                    this._reloadConfig();
                }, 500);
            }
        });
    }

    _reloadConfig() {
        try {
            const fileContent = fs.readFileSync(this.configFilePath, 'utf8');
            this.config = this._parseIni(fileContent);
            console.log(`[${new Date().toLocaleString()}] 配置文件已重新加载`);
        } catch (err) {
            console.error('重新加载配置失败:', err);
        }
    }

}

module.exports = Config;
