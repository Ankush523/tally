import React from 'react';
import {
  BottomTabBarButtonProps,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import {Platform, StyleSheet, Text, View} from 'react-native';
import {
  IconCalendar,
  IconCalendarFilled,
  IconChartBar,
  IconClock,
  IconClockFilled,
  IconHeadphones,
  IconHeadphonesFilled,
  IconLayoutGrid,
  IconLayoutGridFilled,
} from '@tabler/icons-react-native';
import {FocusScreen} from '../screens/FocusScreen';
import {HabitsScreen} from '../screens/HabitsScreen';
import {HomeScreen} from '../screens/HomeScreen';
import {InsightsScreen} from '../screens/InsightsScreen';
import {TasksScreen} from '../screens/TasksScreen';
import {useTheme} from '../hooks/useTheme';
import {rimThinWidth} from '../theme/shadows';
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
}) as string;

type OutlineIcon = React.ComponentType<{
  color: string;
  size?: number;
  strokeWidth?: number;
}>;
type FilledIcon = React.ComponentType<{color: string; size?: number}>;

function TabPairGlyph({
  focused,
  color,
  Outline,
  Filled,
}: {
  focused: boolean;
  color: string;
  Outline: OutlineIcon;
  Filled: FilledIcon;
}) {
  return (
    <View style={tabGlyphStyles.glyphWrap}>
      {focused ? (
        <Filled color={color} size={TAB_ICON_SIZE} />
      ) : (
        <Outline color={color} size={TAB_ICON_SIZE} strokeWidth={2} />
      )}
    </View>
  );
}

function InsightsGlyph({focused, color}: {focused: boolean; color: string}) {
  return (
    <View style={tabGlyphStyles.glyphWrap}>
      <IconChartBar
        color={color}
        size={TAB_ICON_SIZE}
        strokeWidth={focused ? 2.85 : 2}
      />
    </View>
  );
}

export function MainTabs() {
  const {colors, isDark} = useTheme();

  /** Light: parchment rail + one ink hairline (no upward shadow — avoids white seam + double rim). */
  const tabBarSurface = isDark ? colors.sheetSurface : colors.parchment;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.inkViolet,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarHideOnKeyboard: true,
        tabBarButton: TabBarButton,
        tabBarActiveBackgroundColor: colors.violet50,
        /**
         * Padding must stay 0: RN applies tabBarItemStyle to the OUTER wrapper; any
         * padding here sits outside the Pressable, so active gray cannot paint it (white/parchment gaps).
         */
        tabBarItemStyle: {
          borderRadius: 0,
          marginHorizontal: 0,
          marginVertical: 0,
          padding: 0,
          paddingVertical: 0,
          paddingHorizontal: 0,
        },
        tabBarLabel: ({focused, color, children}) => (
          <Text
            style={[
              Typography.tabLabel,
              {
                color,
                fontFamily: headerMono,
                fontWeight: focused ? '700' : '500',
              },
            ]}>
            {children}
          </Text>
        ),
        tabBarStyle: {
          backgroundColor: tabBarSurface,
          borderTopColor: isDark ? 'transparent' : colors.border,
          borderTopWidth: isDark ? 0 : rimThinWidth,
          paddingTop: 0,
          /** 0 so tab row + Pressable fill full bar height; bottom inset is applied inside AnimatedTabBarButton. */
          paddingBottom: 0,
          elevation: 0,
          shadowOpacity: 0,
          shadowOffset: {width: 0, height: 0},
          shadowRadius: 0,
        },
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'HOME',
          tabBarIcon: ({focused, color}) => (
            <TabPairGlyph
              focused={focused}
              color={color}
              Outline={IconLayoutGrid}
              Filled={IconLayoutGridFilled}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Habits"
        component={HabitsScreen}
        options={{
          tabBarLabel: 'HABITS',
          tabBarIcon: ({focused, color}) => (
            <TabPairGlyph
              focused={focused}
              color={color}
              Outline={IconClock}
              Filled={IconClockFilled}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Tasks"
        component={TasksScreen}
        options={{
          tabBarLabel: 'TASKS',
          tabBarIcon: ({focused, color}) => (
            <TabPairGlyph
              focused={focused}
              color={color}
              Outline={IconCalendar}
              Filled={IconCalendarFilled}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Focus"
        component={FocusScreen}
        options={{
          tabBarLabel: 'FOCUS',
          tabBarIcon: ({focused, color}) => (
            <TabPairGlyph
              focused={focused}
              color={color}
              Outline={IconHeadphones}
              Filled={IconHeadphonesFilled}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Insights"
        component={InsightsScreen}
        options={{
          tabBarLabel: 'INSIGHTS',
          tabBarIcon: ({focused, color}) => (
            <InsightsGlyph focused={focused} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const tabGlyphStyles = StyleSheet.create({
  glyphWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 28,
  },
});
