# 阶段1: 构建依赖
FROM node:18-alpine AS builder
WORKDIR /app

# 复制包管理文件（利用Docker缓存层）
COPY package*.json ./
RUN npm install --only=production && \
    npm cache clean --force

# 阶段2: 创建最终镜像
FROM node:18-alpine
WORKDIR /app

# 从构建阶段复制依赖
COPY --from=builder /app/node_modules ./node_modules

# 复制应用代码
COPY . .
COPY ./init-data.sh /
RUN chmod +x /init-data.sh && \
    mkdir -p /app/initial-data && \
    cp -r /app/data/* /app/initial-data/ && \
    sed -i 's/\r$//' /init-data.sh

# 暴露端口
EXPOSE 3000

# 声明数据卷
VOLUME ["/app"]

# 启动命令
ENTRYPOINT ["/init-data.sh"]
CMD ["npm", "start"]
