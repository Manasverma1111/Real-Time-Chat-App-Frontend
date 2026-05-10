import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { ChatComponent } from './chat.component';

import { RoomService } from '../../core/services/room.service';
import { MessageService } from '../../core/services/message.service';
import { SocketService } from '../../core/services/socket.service';
import { AuthService } from '../../core/services/auth.service';

import { Router } from '@angular/router';

describe('ChatComponent', () => {
  let component: ChatComponent;
  let fixture: ComponentFixture<ChatComponent>;

  let mockRoomService: any;
  let mockMessageService: any;
  let mockSocketService: any;
  let mockAuthService: any;
  let mockRouter: any;

  beforeEach(async () => {
    mockRoomService = {
      getUserRooms: vi.fn().mockReturnValue(of([])),
      createRoom: vi.fn().mockReturnValue(of({})),
      getRoomMembers: vi.fn().mockReturnValue(of([])),
      leaveRoom: vi.fn().mockReturnValue(of({})),
      deleteRoom: vi.fn().mockReturnValue(of({})),
    };

    mockMessageService = {
      getMessagesByRoom: vi.fn().mockReturnValue(of([])),
      markMessagesAsSeen: vi.fn().mockReturnValue(of({})),
      uploadMedia: vi.fn().mockReturnValue(
        of({
          filePath: 'uploaded-file-url',
        }),
      ),
      reactToMessage: vi.fn().mockReturnValue(of({})),
      deleteMessageForMe: vi.fn().mockReturnValue(of({})),
    };

    mockSocketService = {
      connect: vi.fn(),
      disconnect: vi.fn(),
      subscribe: vi.fn(),
      subscribeTyping: vi.fn(),
      send: vi.fn(),
      sendTyping: vi.fn(),
    };

    mockAuthService = {
      getCurrentUser: vi.fn().mockReturnValue(
        of({
          username: 'manas',
        }),
      ),
      logout: vi.fn().mockReturnValue(of({})),
      markUserOffline: vi.fn().mockReturnValue(of({})),
      searchUsers: vi.fn().mockReturnValue(of([])),
      updateProfile: vi.fn().mockReturnValue(of({})),
      uploadProfileImage: vi.fn().mockReturnValue(of({})),
    };

    mockRouter = {
      navigate: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ChatComponent],

      providers: [
        {
          provide: RoomService,
          useValue: mockRoomService,
        },
        {
          provide: MessageService,
          useValue: mockMessageService,
        },
        {
          provide: SocketService,
          useValue: mockSocketService,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: Router,
          useValue: mockRouter,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ChatComponent);

    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create chat component', () => {
    expect(component).toBeTruthy();
  });

  it('should load rooms on init', () => {
    expect(mockRoomService.getUserRooms).toHaveBeenCalled();
  });

  it('should open create room modal', () => {
    component.handleCreateRoom();

    expect(component.showCreateRoomModal).toBe(true);
  });

  it('should close create room modal', () => {
    component.showCreateRoomModal = true;

    component.closeCreateRoomModal();

    expect(component.showCreateRoomModal).toBe(false);
  });

  it('should select room', () => {
    const room = {
      id: 'room1',
      name: 'General',
    };

    const loadMessagesSpy = vi.spyOn(component, 'loadMessages');

    const subscribeSpy = vi.spyOn(component, 'subscribeToRoom');

    component.selectRoom(room);

    expect(component.selectedRoom).toEqual(room);

    expect(loadMessagesSpy).toHaveBeenCalledWith('room1');

    expect(subscribeSpy).toHaveBeenCalledWith('room1');
  });

  it('should send message', () => {
    component.socketConnected = true;

    component.selectedRoom = {
      id: 'room1',
    };

    component.sendMessage('Hello');

    expect(mockSocketService.send).toHaveBeenCalled();
  });

  it('should not send empty message', () => {
    component.socketConnected = true;

    component.selectedRoom = {
      id: 'room1',
    };

    component.sendMessage('   ');

    expect(mockSocketService.send).not.toHaveBeenCalled();
  });

  it('should emit typing event', () => {
    component.selectedRoom = {
      id: 'room1',
    };

    component.handleTyping();

    expect(mockSocketService.sendTyping).toHaveBeenCalled();
  });

  it('should handle logout', () => {
    component.handleLogout();

    expect(mockSocketService.disconnect).toHaveBeenCalled();

    expect(mockAuthService.logout).toHaveBeenCalled();
  });
});
