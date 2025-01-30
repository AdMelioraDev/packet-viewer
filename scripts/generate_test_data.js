const fs = require('fs');
const path = require('path');

// 상수 정의
const NUM_IPS = 10;
const QUEUE_SIZES = [8, 16, 32, 64];
const QUEUE_LENGTH = 256;

// 테스트 데이터 디렉토리 생성
const testDataDir = path.join(__dirname, '..', 'test_data');
if (!fs.existsSync(testDataDir)) {
    fs.mkdirSync(testDataDir);
}

// dump 파일 생성
function generateDumpFile() {
    const dumpPath = path.join(testDataDir, 'test_dump.bin');
    const dumpSize = NUM_IPS * QUEUE_LENGTH * (8 + 16 + 32 + 64); // 307,200 bytes
    const buffer = Buffer.alloc(dumpSize);
    
    let offset = 0;
    for (let ip = 0; ip < NUM_IPS; ip++) {
        for (let queueType of QUEUE_SIZES) {
            for (let i = 0; i < QUEUE_LENGTH; i++) {
                // 각 패킷에 대해 테스트 데이터 생성
                for (let j = 0; j < queueType; j++) {
                    buffer.writeUInt8(Math.floor(Math.random() * 256), offset + j);
                }
                offset += queueType;
            }
        }
    }

    fs.writeFileSync(dumpPath, buffer);
    console.log(`Created dump file: ${dumpPath} (${dumpSize} bytes)`);
}

// tail 파일 생성
function generateTailFile() {
    const tailPath = path.join(testDataDir, 'test_tail.bin');
    const tailSize = NUM_IPS * QUEUE_SIZES.length * 4; // 160 bytes
    const buffer = Buffer.alloc(tailSize);
    
    let offset = 0;
    for (let ip = 0; ip < NUM_IPS; ip++) {
        for (let queueType of QUEUE_SIZES) {
            // 각 큐의 tail 값을 0~255 사이의 랜덤값으로 설정
            const tailValue = Math.floor(Math.random() * QUEUE_LENGTH);
            buffer.writeUInt32LE(tailValue, offset);
            offset += 4;
        }
    }

    fs.writeFileSync(tailPath, buffer);
    console.log(`Created tail file: ${tailPath} (${tailSize} bytes)`);
}

// 파일 생성 실행
generateDumpFile();
generateTailFile();
