export const MOCK_USERS = [
  {
    id: 'u1',
    name: 'Steve Rogers',
    username: 'steve',
    avatar: 'SR',
    status: 'ONLINE',
    bio: 'Full-stack dev',
  },
  {
    id: 'u2',
    name: 'Pepper Potts',
    username: 'pepper',
    avatar: 'PP',
    status: 'AWAY',
    bio: 'UI/UX Designer',
  },
  {
    id: 'u3',
    name: 'Tony Stark',
    username: 'tony',
    avatar: 'TS',
    status: 'ONLINE',
    bio: 'Backend engineer',
  },
  {
    id: 'u4',
    name: 'Scarlet Johanson',
    username: 'scarlet',
    avatar: 'SJ',
    status: 'DND',
    bio: 'DevOps specialist',
  },
  {
    id: 'u5',
    name: 'Bruce Banner',
    username: 'bruce',
    avatar: 'BB',
    status: 'INVISIBLE',
    bio: 'Data scientist',
  },
];

export const MOCK_ROOMS = [
  {
    id: 'r1',
    name: 'General',
    type: 'GROUP',
    avatar: 'GN',
    lastMessage: 'Hey everyone!',
    lastMessageAt: '10:42 AM',
    unread: 3,
    members: ['u1', 'u2', 'u3', 'u4', 'u5'],
  },
  {
    id: 'r2',
    name: 'Engineering',
    type: 'GROUP',
    avatar: 'EN',
    lastMessage: 'Deploying v2.1 tonight',
    lastMessageAt: '9:15 AM',
    unread: 0,
    members: ['u1', 'u3', 'u4'],
  },
];

export const MOCK_MESSAGES: any = {
  r1: [{ id: 'm1', senderId: 'u2', content: 'Good morning everyone!', sentAt: '10:30 AM' }],
};

export const ME = {
  id: 'u1',
  name: 'Steve Rogers',
  username: 'steve',
  avatar: 'SR',
  status: 'ONLINE',
};
