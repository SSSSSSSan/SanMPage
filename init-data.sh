#!/bin/sh
echo "initializing..."
# 检查/app/data目录是否为空
if [ -z "$(ls -A /app/data)" ]; then
  echo "初始化数据目录..."
  cp -r /app/initial-data/* /app/data/
fi

# 启动主应用
exec "$@"
