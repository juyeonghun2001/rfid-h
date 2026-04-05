#!/bin/bash

# RFID 해성 관리 시스템 - 서비스 중지 스크립트
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PID_FILE="$SCRIPT_DIR/.service.pid"

if [ ! -f "$PID_FILE" ]; then
    echo "실행 중인 서비스가 없습니다."
    exit 0
fi

PID=$(cat "$PID_FILE")

if kill -0 "$PID" 2>/dev/null; then
    echo "서비스 중지 중... (PID: $PID)"
    kill "$PID"

    # 종료 대기 (최대 10초)
    for i in $(seq 1 10); do
        if ! kill -0 "$PID" 2>/dev/null; then
            break
        fi
        sleep 1
    done

    # 강제 종료
    if kill -0 "$PID" 2>/dev/null; then
        echo "강제 종료 중..."
        kill -9 "$PID"
        sleep 1
    fi

    rm -f "$PID_FILE"
    echo "서비스가 중지되었습니다."
else
    echo "서비스가 이미 중지되어 있습니다. (PID: $PID)"
    rm -f "$PID_FILE"
fi
