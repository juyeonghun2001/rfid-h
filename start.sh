#!/bin/bash

# RFID 해성 관리 시스템 - 서비스 시작 스크립트
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PID_FILE="$SCRIPT_DIR/.service.pid"
LOG_FILE="$SCRIPT_DIR/.service.log"
PORT="${1:-7890}"

if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if kill -0 "$PID" 2>/dev/null; then
        echo "서비스가 이미 실행 중입니다. (PID: $PID, PORT: $PORT)"
        echo "재시작하려면 ./restart.sh $PORT 를 사용하세요."
        exit 1
    else
        rm -f "$PID_FILE"
    fi
fi

cd "$SCRIPT_DIR"

# 빌드 확인
if [ ! -d ".next" ]; then
    echo "빌드가 없습니다. npm run build 실행 중..."
    npm run build
    if [ $? -ne 0 ]; then
        echo "빌드 실패!"
        exit 1
    fi
fi

echo "서비스 시작 중... (PORT: $PORT)"
nohup npx next start -p "$PORT" > "$LOG_FILE" 2>&1 &
echo $! > "$PID_FILE"

sleep 2

PID=$(cat "$PID_FILE")
if kill -0 "$PID" 2>/dev/null; then
    echo "서비스가 시작되었습니다. (PID: $PID, PORT: $PORT)"
    echo "로그: $LOG_FILE"
else
    echo "서비스 시작 실패! 로그를 확인하세요: $LOG_FILE"
    rm -f "$PID_FILE"
    exit 1
fi
