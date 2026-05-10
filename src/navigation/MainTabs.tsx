import React from 'react';
import {
  BottomTabBarButtonProps,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import {Platform} from 'react-native';
import {
  IconCalendar,
  IconChartBar,
  IconClock,
  IconHeadphones,
  IconLayoutGrid,
} from '@tabler/icons-react-native';
import {FocusScreen} from '../screens/FocusScreen';
import {HabitsScreen} from '../screens/HabitsScreen';
import {HomeScreen} from '../screens/HomeScreen';
import {InsightsScreen} from '../screens/InsightsScreen';
import {TasksScreen} from '../screens/TasksScreen';
import {useTheme} from '../hooks/useTheme';
import {Radius} from '../theme/radius';
import {brutalBorderWidth, tabBarShadow} from '../theme/shadows';
import {Typography} from '../theme/typography';
import {AnimatedTabBarButton} from './AnimatedTabBarButton';
import type {MainTabParamList} from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

function TabBarButton(props: BottomTabBarButtonProps) {
  return <AnimatedTabBarButton {...props} />;
}

const TAB_ICON_SIZE = 22;

const headerMono = Platform.select({
  ios: 'JetBrainsMono-Medium',
  android: 'JetBrainsMono_500Medium',
  default: 'JetBrainsMono-Medium',
});

function HomeTabIcon({color, size}: {color: string; size?: number}) {
  return <IconLayoutGrid color={color} size={size ?? TAB_ICON_SIZE} strokeWidth={2.5} />;
}

function HabitsTabIcon({color, size}: {color: string; size?: number}) {
  return <IconClock color={color} size={size ?? TAB_ICON_SIZE} strokeWidth={2.5} />;
}

function TasksTabIcon({color, size}: {color: string; size?: number}) {
  return <IconCalendar color={color} size={size ?? TAB_ICON_SIZE} strokeWidth={2.5} />;
}

function FocusTabIcon({color, size}: {color: string; size?: number}) {
  return <IconHeadphones color={color} size={size ?? TAB_ICON_SIZE} strokeWidth={2.5} />;
}

function InsightsTabIcon({color, size}: {color: string; size?: number}) {
  return <IconChartBar color={color} size={size ?? TAB_ICON_SIZE} strokeWidth={2.5} />;
}

export function MainTabs() {
  const {colors, isDark} = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.inkViolet,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarLabelStyle: [Typography.tabLabel, {fontFamily: headerMono}],
        tabBarHideOnKeyboard: true,
        tabBarButton: TabBarButton,
        tabBarActiveBackgroundColor: colors.violet50,
        tabBarItemStyle: {
          borderRadius: Radius.sm,
          marginHorizontal: 2,
        },
        tabBarStyle: [
          {
            backgroundColor: colors.sheetSurface,
            borderTopColor: isDark ? 'transparent' : colors.border,
            borderTopWidth: isDark ? 0 : brutalBorderWidth,
            paddingTop: 0,
            paddingBottom: 0,
          },
          /* Light: upward brutal shadow separates bar from content; dark skips border + shadow (no white strip). */
          !isDark && tabBarShadow(colors),
        ],
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'HOME',
          tabBarIcon: HomeTabIcon,
        }}
      />
      <Tab.Screen
        name="Habits"
        component={HabitsScreen}
        options={{
          tabBarLabel: 'HABITS',
          tabBarIcon: HabitsTabIcon,
        }}
      />
      <Tab.Screen
        name="Tasks"
        component={TasksScreen}
        options={{
          tabBarLabel: 'TASKS',
          tabBarIcon: TasksTabIcon,
        }}
      />
      <Tab.Screen
        name="Focus"
        component={FocusScreen}
        options={{
          tabBarLabel: 'FOCUS',
          tabBarIcon: FocusTabIcon,
        }}
      />
      <Tab.Screen
        name="Insights"
        component={InsightsScreen}
        options={{
          tabBarLabel: 'INSIGHTS',
          tabBarIcon: InsightsTabIcon,
        }}
      />
    </Tab.Navigator>
  );
}
