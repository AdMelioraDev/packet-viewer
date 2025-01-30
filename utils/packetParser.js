const fs = require('fs');

class PacketParser {
    constructor() {
        this.QUEUE_SIZES = {
            QUEUE_8B: 8,
            QUEUE_16B: 16,
            QUEUE_32B: 32,
            QUEUE_64B: 64
        };
        
        this.QUEUE_ENTRIES = 256;
        this.NUM_IPS = 10;
        this.NUM_QUEUES = 4;
    }

    async readDumpFile(filePath) {
        try {
            const buffer = await fs.promises.readFile(filePath);
            return this.parseDumpData(buffer);
        } catch (error) {
            console.error('Error reading dump file:', error);
            throw error;
        }
    }

    parseDumpData(buffer) {
        const ipData = new Array(this.NUM_IPS);
        let offset = 0;

        for (let ip = 0; ip < this.NUM_IPS; ip++) {
            const queues = new Array(this.NUM_QUEUES);
            
            // Parse each queue for the current IP
            for (let q = 0; q < this.NUM_QUEUES; q++) {
                const queueSize = this.getQueueSize(q);
                const queueData = new Array(this.QUEUE_ENTRIES);
                
                // Parse each entry in the queue
                for (let entry = 0; entry < this.QUEUE_ENTRIES; entry++) {
                    queueData[entry] = this.parseQueueEntry(buffer, offset, queueSize);
                    offset += queueSize;
                }
                
                queues[q] = {
                    size: queueSize,
                    entries: queueData
                };
            }
            
            ipData[ip] = {
                index: ip,
                queues: queues
            };
        }

        return ipData;
    }

    getQueueSize(queueIndex) {
        switch(queueIndex) {
            case 0: return this.QUEUE_SIZES.QUEUE_8B;
            case 1: return this.QUEUE_SIZES.QUEUE_16B;
            case 2: return this.QUEUE_SIZES.QUEUE_32B;
            case 3: return this.QUEUE_SIZES.QUEUE_64B;
            default: throw new Error('Invalid queue index');
        }
    }

    parseQueueEntry(buffer, offset, size) {
        const entry = buffer.slice(offset, offset + size);
        const timestamp = this.extractTimestamp(entry);
        
        // 유효하지 않은 패킷은 건너뛰기
        if (!timestamp || timestamp === 0) {
            return null;
        }

        return {
            raw: entry,
            hex: this.formatHexDump(entry),
            timestamp: timestamp,
            data: this.parsePacketData(entry)
        };
    }

    formatHexDump(buffer) {
        return Array.from(buffer)
            .map(byte => byte.toString(16).padStart(2, '0'))
            .join(' ');
    }

    extractTimestamp(buffer) {
        // Assuming first 4 bytes are timestamp
        if (buffer.length >= 4) {
            const timestamp = buffer.readUInt32LE(0);
            return timestamp > 0 ? timestamp : null;  // 0은 유효하지 않은 타임스탬프로 처리
        }
        return null;
    }

    parsePacketData(buffer) {
        // Parse packet specific fields based on size
        const data = {};
        
        switch(buffer.length) {
            case 8:
                data.type = buffer[4];
                data.value = buffer.readUInt16LE(5);
                data.checksum = buffer[7];
                break;
            
            case 16:
                data.type = buffer[4];
                data.sequence = buffer.readUInt16LE(5);
                data.payload = buffer.slice(7, 14);
                data.checksum = buffer[15];
                break;
            
            case 32:
                data.type = buffer[4];
                data.sequence = buffer.readUInt16LE(5);
                data.flags = buffer[7];
                data.payload = buffer.slice(8, 30);
                data.checksum = buffer.readUInt16LE(30);
                break;
            
            case 64:
                data.type = buffer[4];
                data.sequence = buffer.readUInt32LE(5);
                data.flags = buffer.readUInt16LE(9);
                data.payload = buffer.slice(11, 60);
                data.checksum = buffer.readUInt32LE(60);
                break;
        }
        
        return data;
    }

    async readTailFile(filePath) {
        try {
            const buffer = await fs.promises.readFile(filePath);
            return this.parseTailData(buffer);
        } catch (error) {
            console.error('Error reading tail file:', error);
            throw error;
        }
    }

    parseTailData(buffer) {
        const tailData = new Array(this.NUM_IPS);
        let offset = 0;

        for (let ip = 0; ip < this.NUM_IPS; ip++) {
            const queues = new Array(this.NUM_QUEUES);
            
            for (let q = 0; q < this.NUM_QUEUES; q++) {
                queues[q] = {
                    head: buffer.readUInt16LE(offset),
                    tail: buffer.readUInt16LE(offset + 2)
                };
                offset += 4; // 2 bytes for head + 2 bytes for tail
            }
            
            tailData[ip] = {
                index: ip,
                queues: queues
            };
        }

        return tailData;
    }
}

module.exports = PacketParser;
