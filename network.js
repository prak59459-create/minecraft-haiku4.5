export class NetworkManager {
    constructor(serverUrl = 'ws://localhost:8080') {
        this.serverUrl = serverUrl;
        this.ws = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.messageHandlers = new Map();
    }

    connect() {
        try {
            this.ws = new WebSocket(this.serverUrl);

            this.ws.onopen = () => {
                this.isConnected = true;
                this.reconnectAttempts = 0;
                console.log('Connected to server');
                this.emit('connected');
            };

            this.ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    this.handleMessage(message);
                } catch (error) {
                    console.error('Failed to parse message:', error);
                }
            };

            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.emit('error', error);
            };

            this.ws.onclose = () => {
                this.isConnected = false;
                console.log('Disconnected from server');
                this.attemptReconnect();
                this.emit('disconnected');
            };
        } catch (error) {
            console.error('Failed to connect:', error);
        }
    }

    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = Math.pow(2, this.reconnectAttempts) * 1000;
            console.log(`Attempting to reconnect in ${delay}ms...`);
            setTimeout(() => this.connect(), delay);
        }
    }

    send(type, data = {}) {
        if (!this.isConnected || !this.ws) {
            console.warn('Not connected to server');
            return false;
        }

        try {
            this.ws.send(JSON.stringify({ type, data, timestamp: Date.now() }));
            return true;
        } catch (error) {
            console.error('Failed to send message:', error);
            return false;
        }
    }

    on(type, handler) {
        if (!this.messageHandlers.has(type)) {
            this.messageHandlers.set(type, []);
        }
        this.messageHandlers.get(type).push(handler);
    }

    off(type, handler) {
        if (this.messageHandlers.has(type)) {
            const handlers = this.messageHandlers.get(type);
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
    }

    emit(type, data) {
        if (this.messageHandlers.has(type)) {
            this.messageHandlers.get(type).forEach(handler => handler(data));
        }
    }

    handleMessage(message) {
        const { type, data } = message;
        this.emit(type, data);
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
        }
    }

    sendPlayerPosition(position, rotation) {
        this.send('playerPosition', { position, rotation });
    }

    sendBlockUpdate(x, y, z, blockId) {
        this.send('blockUpdate', { x, y, z, blockId });
    }

    sendChat(message) {
        this.send('chat', { message });
    }
}
