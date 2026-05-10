import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SocketService } from './socket.service';

describe('SocketService', () => {
  let service: SocketService;

  let mockClient: any;

  beforeEach(() => {
    service = new SocketService();

    mockClient = {
      connected: true,

      activate: vi.fn(),

      deactivate: vi.fn(),

      publish: vi.fn(),

      subscribe: vi.fn(),
    };

    // inject mocked stomp client
    (service as any).stompClient = mockClient;
  });

  it('should create socket service', () => {
    expect(service).toBeTruthy();
  });

  it('should publish message when connected', () => {
    const payload = {
      content: 'Hello',
    };

    service.send(payload);

    expect(mockClient.publish).toHaveBeenCalledWith({
      destination: '/app/chat.send',
      body: JSON.stringify(payload),
    });
  });

  it('should queue message when disconnected', () => {
    mockClient.connected = false;

    const payload = {
      content: 'Queued message',
    };

    service.send(payload);

    expect(mockClient.publish).not.toHaveBeenCalled();

    expect((service as any).pendingMessages.length).toBe(1);
  });

  it('should subscribe to room topic', () => {
    const callback = vi.fn();

    service.subscribe('room1', callback);

    expect(mockClient.subscribe).toHaveBeenCalled();
  });

  it('should subscribe to typing topic', () => {
    const callback = vi.fn();

    service.subscribeTyping('room1', callback);

    expect(mockClient.subscribe).toHaveBeenCalled();
  });

  it('should send typing event', () => {
    const payload = {
      userId: '1',
      roomId: 'room1',
    };

    service.sendTyping(payload);

    expect(mockClient.publish).toHaveBeenCalledWith({
      destination: '/app/chat.typing',
      body: JSON.stringify(payload),
    });
  });

  it('should disconnect socket', () => {
    service.disconnect();

    expect(mockClient.deactivate).toHaveBeenCalled();
  });
});
