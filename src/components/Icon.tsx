// Phosphor icons used by the design (per-icon imports keep the web bundle small).
import React from 'react';
import { Platform, View } from 'react-native';
import { AppleLogoIcon } from 'phosphor-react-native/src/icons/AppleLogo';
import { ArrowUpIcon } from 'phosphor-react-native/src/icons/ArrowUp';
import { BarbellIcon } from 'phosphor-react-native/src/icons/Barbell';
import { BarcodeIcon } from 'phosphor-react-native/src/icons/Barcode';
import { BatteryFullIcon } from 'phosphor-react-native/src/icons/BatteryFull';
import { BellIcon } from 'phosphor-react-native/src/icons/Bell';
import { BicycleIcon } from 'phosphor-react-native/src/icons/Bicycle';
import { BookmarkSimpleIcon } from 'phosphor-react-native/src/icons/BookmarkSimple';
import { BowlFoodIcon } from 'phosphor-react-native/src/icons/BowlFood';
import { CalendarBlankIcon } from 'phosphor-react-native/src/icons/CalendarBlank';
import { CameraIcon } from 'phosphor-react-native/src/icons/Camera';
import { CameraRotateIcon } from 'phosphor-react-native/src/icons/CameraRotate';
import { CaretDownIcon } from 'phosphor-react-native/src/icons/CaretDown';
import { CaretLeftIcon } from 'phosphor-react-native/src/icons/CaretLeft';
import { CaretRightIcon } from 'phosphor-react-native/src/icons/CaretRight';
import { CarrotIcon } from 'phosphor-react-native/src/icons/Carrot';
import { CellSignalFullIcon } from 'phosphor-react-native/src/icons/CellSignalFull';
import { ChartBarIcon } from 'phosphor-react-native/src/icons/ChartBar';
import { ChartLineUpIcon } from 'phosphor-react-native/src/icons/ChartLineUp';
import { ChatCircleIcon } from 'phosphor-react-native/src/icons/ChatCircle';
import { CheckIcon } from 'phosphor-react-native/src/icons/Check';
import { CheckCircleIcon } from 'phosphor-react-native/src/icons/CheckCircle';
import { ClockIcon } from 'phosphor-react-native/src/icons/Clock';
import { ClockCounterClockwiseIcon } from 'phosphor-react-native/src/icons/ClockCounterClockwise';
import { CoffeeIcon } from 'phosphor-react-native/src/icons/Coffee';
import { DesktopTowerIcon } from 'phosphor-react-native/src/icons/DesktopTower';
import { DotsThreeIcon } from 'phosphor-react-native/src/icons/DotsThree';
import { FireIcon } from 'phosphor-react-native/src/icons/Fire';
import { FishIcon } from 'phosphor-react-native/src/icons/Fish';
import { FlameIcon } from 'phosphor-react-native/src/icons/Flame';
import { FlowerLotusIcon } from 'phosphor-react-native/src/icons/FlowerLotus';
import { ForkKnifeIcon } from 'phosphor-react-native/src/icons/ForkKnife';
import { GoogleLogoIcon } from 'phosphor-react-native/src/icons/GoogleLogo';
import { HeartIcon } from 'phosphor-react-native/src/icons/Heart';
import { HeartbeatIcon } from 'phosphor-react-native/src/icons/Heartbeat';
import { HouseIcon } from 'phosphor-react-native/src/icons/House';
import { HouseSimpleIcon } from 'phosphor-react-native/src/icons/HouseSimple';
import { LightningIcon } from 'phosphor-react-native/src/icons/Lightning';
import { MagnifyingGlassIcon } from 'phosphor-react-native/src/icons/MagnifyingGlass';
import { MicrophoneIcon } from 'phosphor-react-native/src/icons/Microphone';
import { MinusIcon } from 'phosphor-react-native/src/icons/Minus';
import { MoonIcon } from 'phosphor-react-native/src/icons/Moon';
import { OrangeSliceIcon } from 'phosphor-react-native/src/icons/OrangeSlice';
import { PauseIcon } from 'phosphor-react-native/src/icons/Pause';
import { PersonSimpleRunIcon } from 'phosphor-react-native/src/icons/PersonSimpleRun';
import { PersonSimpleTaiChiIcon } from 'phosphor-react-native/src/icons/PersonSimpleTaiChi';
import { PersonSimpleWalkIcon } from 'phosphor-react-native/src/icons/PersonSimpleWalk';
import { PlayIcon } from 'phosphor-react-native/src/icons/Play';
import { PlusIcon } from 'phosphor-react-native/src/icons/Plus';
import { ScalesIcon } from 'phosphor-react-native/src/icons/Scales';
import { SkipBackIcon } from 'phosphor-react-native/src/icons/SkipBack';
import { SkipForwardIcon } from 'phosphor-react-native/src/icons/SkipForward';
import { SlidersHorizontalIcon } from 'phosphor-react-native/src/icons/SlidersHorizontal';
import { SneakerMoveIcon } from 'phosphor-react-native/src/icons/SneakerMove';
import { SpeakerHighIcon } from 'phosphor-react-native/src/icons/SpeakerHigh';
import { WarningCircleIcon } from 'phosphor-react-native/src/icons/WarningCircle';
import { WifiHighIcon } from 'phosphor-react-native/src/icons/WifiHigh';
import { WifiSlashIcon } from 'phosphor-react-native/src/icons/WifiSlash';
import { XIcon } from 'phosphor-react-native/src/icons/X';

const MAP = {
  'apple-logo': AppleLogoIcon,
  'arrow-up': ArrowUpIcon,
  'barbell': BarbellIcon,
  'barcode': BarcodeIcon,
  'battery-full': BatteryFullIcon,
  'bell': BellIcon,
  'bicycle': BicycleIcon,
  'bookmark-simple': BookmarkSimpleIcon,
  'bowl-food': BowlFoodIcon,
  'calendar-blank': CalendarBlankIcon,
  'camera': CameraIcon,
  'camera-rotate': CameraRotateIcon,
  'caret-down': CaretDownIcon,
  'caret-left': CaretLeftIcon,
  'caret-right': CaretRightIcon,
  'carrot': CarrotIcon,
  'cell-signal-full': CellSignalFullIcon,
  'chart-bar': ChartBarIcon,
  'chart-line-up': ChartLineUpIcon,
  'chat-circle': ChatCircleIcon,
  'check': CheckIcon,
  'check-circle': CheckCircleIcon,
  'clock': ClockIcon,
  'clock-counter-clockwise': ClockCounterClockwiseIcon,
  'coffee': CoffeeIcon,
  'desktop-tower': DesktopTowerIcon,
  'dots-three': DotsThreeIcon,
  'fire': FireIcon,
  'fish': FishIcon,
  'flame': FlameIcon,
  'flower-lotus': FlowerLotusIcon,
  'fork-knife': ForkKnifeIcon,
  'google-logo': GoogleLogoIcon,
  'heart': HeartIcon,
  'heartbeat': HeartbeatIcon,
  'house': HouseIcon,
  'house-simple': HouseSimpleIcon,
  'lightning': LightningIcon,
  'magnifying-glass': MagnifyingGlassIcon,
  'microphone': MicrophoneIcon,
  'minus': MinusIcon,
  'moon': MoonIcon,
  'orange-slice': OrangeSliceIcon,
  'pause': PauseIcon,
  'person-simple-run': PersonSimpleRunIcon,
  'person-simple-tai-chi': PersonSimpleTaiChiIcon,
  'person-simple-walk': PersonSimpleWalkIcon,
  'play': PlayIcon,
  'plus': PlusIcon,
  'scales': ScalesIcon,
  'skip-back': SkipBackIcon,
  'skip-forward': SkipForwardIcon,
  'sliders-horizontal': SlidersHorizontalIcon,
  'sneaker-move': SneakerMoveIcon,
  'speaker-high': SpeakerHighIcon,
  'warning-circle': WarningCircleIcon,
  'wifi-high': WifiHighIcon,
  'wifi-slash': WifiSlashIcon,
  'x': XIcon,
} as const;

export type IconName = keyof typeof MAP;
export type IconWeight = 'regular' | 'fill' | 'bold';

export function Icon({
  name,
  size = 20,
  color = '#0A0A0F',
  weight = 'regular',
}: {
  name: IconName;
  size?: number;
  color?: string;
  weight?: IconWeight;
}) {
  const Cmp = MAP[name] as React.ComponentType<any>;
  const el = <Cmp size={size} color={color} weight={weight} />;
  // on web a static <svg> paints below positioned siblings (e.g. glass layers); a View wrapper is position:relative
  return Platform.OS === 'web' ? <View pointerEvents="none" style={{ width: size, height: size }}>{el}</View> : el;
}
