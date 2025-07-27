#!/bin/sh
echo "initializing..."
echo "首次启动后"
echo "请前往data目录"
echo "按照config.example.ini配置config.ini"
echo "按照web/list.example.json配置web/list.json"
echo "配置完成后重启容器即可正常使用"
# 检查/app/data目录是否为空
if [ -z "$(ls -A /app/data)" ]; then
  echo "初始化数据目录..."
  cp -r /app/initial-data/* /app/data/
fi

# 启动主应用
exec "$@"
