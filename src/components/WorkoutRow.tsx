import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { C } from '../theme/tokens';
import { T } from '../theme/type';
import { Row } from './List';

/** List row with a 56pt photo thumbnail and a gray "Start" capsule (W1, W3). */
export function WorkoutRow({ id, title, meta, img, pos, last }: { id: string; title: string; meta: string; img: any; pos?: { left: string; top: string }; last?: boolean }) {
  const open = () => router.push(`/workout/${id}`);
  return (
    <Row
      last={last}
      onPress={open}
      padR={12}
      leading={<Image source={img} style={{ width: 56, height: 56, borderRadius: 14 }} contentFit="cover" contentPosition={pos ?? 'center'} />}
      title={
        <T size={17} w="600" numberOfLines={1}>
          {title}
        </T>
      }
      subtitle={meta}
      trailing={
        <View style={{ height: 32, paddingHorizontal: 16, borderRadius: 999, backgroundColor: C.fill, justifyContent: 'center' }}>
          <T size={15} w="600">
            Start
          </T>
        </View>
      }
    />
  );
}

