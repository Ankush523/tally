/* eslint-env jest */
jest.mock('@shopify/react-native-skia', () => ({
  Canvas: 'Canvas',
  Rect: 'Rect',
}));

jest.mock('react-native-keep-awake', () => 'KeepAwake');

jest.mock('react-native-modal', () => {
  const React = require('react');
  const {View} = require('react-native');
  return ({children, isVisible}) =>
    isVisible ? <View testID="mock-modal">{children}</View> : null;
});

jest.mock('@notifee/react-native', () => ({
  __esModule: true,
  default: {
    requestPermission: jest.fn(async () => ({authorizationStatus: 1})),
    createChannel: jest.fn(async () => {}),
    createTriggerNotification: jest.fn(async () => 'notif'),
    cancelTriggerNotifications: jest.fn(async () => {}),
  },
  AndroidImportance: {DEFAULT: 3},
  RepeatFrequency: {DAILY: 1},
  TriggerType: {TIMESTAMP: 1},
}));

jest.mock('react-native-mmkv', () => ({
  createMMKV: jest.fn(() => ({
    getString: jest.fn(() => undefined),
    set: jest.fn(),
    getBoolean: jest.fn(() => false),
    getNumber: jest.fn(() => undefined),
    remove: jest.fn(),
    contains: jest.fn(() => false),
    clearAll: jest.fn(),
  })),
}));

jest.mock('@nozbe/watermelondb/react', () => ({
  DatabaseProvider: ({children}) => children,
  useDatabase: () => ({
    write: jest.fn(async fn => fn()),
    get: () => ({
      query: () => ({
        observe: () => ({subscribe: () => ({unsubscribe: jest.fn()})}),
        fetch: jest.fn(async () => []),
      }),
      create: jest.fn(),
      find: jest.fn(async () => ({})),
    }),
  }),
}));

jest.mock('./src/db/database', () => ({
  database: {
    write: jest.fn(async fn => fn()),
    get: () => ({
      query: () => ({
        observe: () => ({subscribe: () => ({unsubscribe: jest.fn()})}),
        fetch: jest.fn(async () => []),
      }),
      create: jest.fn(),
      find: jest.fn(async () => ({})),
    }),
  },
}));
