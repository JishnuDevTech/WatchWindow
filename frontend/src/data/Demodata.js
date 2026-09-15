import { addHours, addDays, format } from 'date-fns';

const now = new Date();

export const getDemoFamilies = () => [
  {
    id: 'family_1',
    name: 'The Smiths',
    description: 'Our happy family household',
    inviteCode: 'SMITH123',
    createdAt: new Date(now.getFullYear(), now.getMonth(), 1),
    tvName: 'Living Room TV'
  }
];

export const getDemoFamilyMembers = () => [
  {
    id: 'member_1',
    uid: 'user_mom',
    name: 'Mom',
    email: 'mom@example.com',
    role: 'admin',
    avatar: '👩',
    joinedAt: new Date(now.getFullYear(), now.getMonth(), 1)
  },
  {
    id: 'member_2',
    uid: 'user_dad',
    name: 'Dad',
    email: 'dad@example.com',
    role: 'member',
    avatar: '👨',
    joinedAt: new Date(now.getFullYear(), now.getMonth(), 5)
  },
  {
    id: 'member_3',
    uid: 'user_sister',
    name: 'Sister',
    email: 'sister@example.com',
    role: 'member',
    avatar: '👧',
    joinedAt: new Date(now.getFullYear(), now.getMonth(), 10)
  },
  {
    id: 'member_4',
    uid: 'user_you',
    name: 'You',
    email: 'you@example.com',
    role: 'member',
    avatar: '🧑',
    joinedAt: new Date(now.getFullYear(), now.getMonth(), 15)
  }
];

export const getDemoSchedule = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return [
    {
      id: 'event_1',
      title: 'Morning News',
      memberId: 'member_1',
      memberName: 'Mom',
      description: 'Daily news briefing',
      startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 7, 0),
      endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 7, 30),
      status: 'completed',
      date: format(today, 'yyyy-MM-dd')
    },
    {
      id: 'event_2',
      title: 'Dad\'s Workout Show',
      memberId: 'member_2',
      memberName: 'Dad',
      description: 'Morning fitness routine',
      startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 8, 0),
      endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 8, 45),
      status: 'ongoing',
      date: format(today, 'yyyy-MM-dd')
    },
    {
      id: 'event_3',
      title: 'Cinderella',
      memberId: 'member_3',
      memberName: 'Sister',
      description: 'Disney classic',
      startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0),
      endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 16, 15),
      status: 'scheduled',
      date: format(today, 'yyyy-MM-dd')
    },
    {
      id: 'event_4',
      title: 'Movie Night - Action Thriller',
      memberId: 'member_4',
      memberName: 'You',
      description: 'Latest action-packed thriller',
      startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 18, 0),
      endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 20, 0),
      status: 'scheduled',
      date: format(today, 'yyyy-MM-dd')
    },
    {
      id: 'event_5',
      title: 'Evening Serial',
      memberId: 'member_1',
      memberName: 'Mom',
      description: 'Follow-up on favorite drama series',
      startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 21, 0),
      endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 22, 30),
      status: 'scheduled',
      date: format(today, 'yyyy-MM-dd')
    },
    {
      id: 'event_6',
      title: 'Soccer Game Replay',
      memberId: 'member_2',
      memberName: 'Dad',
      description: 'Championship match highlights',
      startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 19, 30),
      endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 21, 30),
      status: 'scheduled',
      date: format(addDays(today, 1), 'yyyy-MM-dd')
    },
    {
      id: 'event_7',
      title: 'Cooking Show',
      memberId: 'member_1',
      memberName: 'Mom',
      description: 'Learn new recipes',
      startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 15, 0),
      endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 16, 0),
      status: 'scheduled',
      date: format(addDays(today, 1), 'yyyy-MM-dd')
    }
  ];
};

export const getDemoReservations = () => {
  const today = new Date();
  return [
    {
      id: 'res_1',
      memberId: 'member_4',
      memberName: 'You',
      title: 'Request: Movie night this weekend',
      startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 19, 0),
      endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 21, 30),
      status: 'pending',
      createdAt: new Date()
    },
    {
      id: 'res_2',
      memberId: 'member_3',
      memberName: 'Sister',
      title: 'Reserved: Kids show Saturday afternoon',
      startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 14, 0),
      endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 15, 30),
      status: 'confirmed',
      createdAt: new Date()
    }
  ];
};