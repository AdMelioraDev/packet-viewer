const fs = require('fs');

const NUM_IPS = 10;
const QUEUE_SIZES = [8, 16, 32, 64];
const QUEUE_LENGTH = 256;

function readDumpFile(filePath) {
    const buffer = fs.readFileSync(filePath);
    const data = [];
    
    let offset = 0;
    for (let ip = 0; ip < NUM_IPS; ip++) {
        const ipData = {
            ip: ip,
            queues: {}
        };
        
        for (let queueSize of QUEUE_SIZES) {
            const queueData = [];
            for (let i = 0; i < QUEUE_LENGTH; i++) {
                const packet = Buffer.alloc(queueSize);
                buffer.copy(packet, 0, offset, offset + queueSize);
                queueData.push(packet);
                offset += queueSize;
            }
            ipData.queues[queueSize] = queueData;
        }
        
        data.push(ipData);
    }
    
    return data;
}

function readTailFile(filePath) {
    const buffer = fs.readFileSync(filePath);
    const tailData = [];
    
    let offset = 0;
    for (let ip = 0; ip < NUM_IPS; ip++) {
        const ipTails = {
            ip: ip,
            queues: {}
        };
        
        for (let queueSize of QUEUE_SIZES) {
            ipTails.queues[queueSize] = buffer.readUInt32LE(offset);
            offset += 4;
        }
        
        tailData.push(ipTails);
    }
    
    return tailData;
}

module.exports = {
    readDumpFile,
    readTailFile,
    NUM_IPS,
    QUEUE_SIZES,
    QUEUE_LENGTH
};
