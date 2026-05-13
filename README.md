# ConnectHub — Frontend

> Real-Time Chat Platform · Angular · SockJS · STOMP · TypeScript

---

## Overview

The ConnectHub frontend is a **React.js Single-Page Application (SPA)** that connects to the Spring Boot backend over WebSocket using **SockJS + @stomp/stompjs**. It delivers a fully real-time chat experience — messages, typing indicators, read receipts, presence updates, and emoji reactions — all without polling.

---

## Technology Stack

| Layer              | Technology                                                 |
| ------------------ | ---------------------------------------------------------- |
| Frontend Framework | Angular (TypeScript)                                       |
| WebSocket Client   | SockJS + `@stomp/stompjs`                                  |
| Authentication     | JWT stored in memory; passed as STOMP `CONNECT` header     |
| State Management   | Angular Services + RxJS (`BehaviorSubject` / `Observable`) |
| Styling            | Tailwind CSS                                               |
| HTTP Client        | Angular `HttpClient`                                       |
| Build Tool         | Angular CLI                                                |
| Package Manager    | npm                                                        |


---

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+
- Angular CLI 17+

### Installation

```bash
git clone https://github.com/your-org/connecthub-frontend.git
cd connecthub-frontend
npm install
```

### Run in Development

```bash
ng serve
```

App runs at `http://localhost:4200`

### Build for Production

```bash
ng build
```

---

## WebSocket Integration

The app connects to the backend using `SockJS` as the transport layer and `@stomp/stompjs` as the STOMP client.


### STOMP Event Types Handled

| Event | Trigger |
|---|---|
| `CHAT_MESSAGE` | New message received in room |
| `TYPING_INDICATOR` | Another user is typing |
| `READ_RECEIPT` | Messages marked as read |
| `REACTION` | Emoji reaction added to a message |
| `PRESENCE_UPDATE` | User comes online or goes offline |
| `MESSAGE_EDIT` | A message was edited |
| `MESSAGE_DELETE` | A message was soft-deleted |

---

## Key Features

- **Real-time messaging** — text, images, files, emoji reactions
- **Typing indicators** — debounced, cleared after 3s inactivity
- **Read receipts** — per-message SENT / DELIVERED / READ status
- **Presence** — live online/offline badges and last-seen timestamps
- **Thread replies** — quoted message preview on reply
- **Unread badge counts** — updated via personal queue subscription
- **Infinite scroll** — paginated message history via REST API
- **Media gallery** — browse all shared images and files per room
- **Notifications** — in-app alert centre with badge count
- **Auth** — email/password and Google/GitHub OAuth2

---

## REST API Usage

The frontend calls the backend REST API for persistent data operations. WebSocket is used only for real-time event delivery.

| Operation | Method | Endpoint |
|---|---|---|
| Login | POST | `/auth/login` |
| Get rooms | GET | `/rooms?userId={id}` |
| Message history | GET | `/messages/room/{roomId}?page=0` |
| Upload file | POST | `/media/upload` |
| Search messages | GET | `/messages/search?roomId={id}&q={term}` |
| Get notifications | GET | `/notifications/{userId}` |

---

*ConnectHub Platform · Version 1.0 · 2026 · Confidential — Internal Use Only*