import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import type {CompositeScreenProps} from '@react-navigation/native';

export type MainTabParamList = {
  Home: undefined;
  Habits: undefined;
  Tasks: undefined;
  Focus: undefined;
  Insights: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
  HabitDetail: {habitId: string};
  ScoreBreakdown: {dateKey: string};
  Profile: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type MainTabScreenProps<T extends keyof MainTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, T>,
    NativeStackScreenProps<RootStackParamList>
  >;
