#!/bin/bash

# RFID 해성 관리 시스템 - 서비스 재시작 스크립트
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PORT="${1:-3000}"

echo "서비스 재시작 중..."
"$SCRIPT_DIR/stop.sh"
sleep 1
"$SCRIPT_DIR/start.sh" "$PORT"
