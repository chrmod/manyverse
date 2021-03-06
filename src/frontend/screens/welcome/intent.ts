/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs from 'xstream';
import {ReactSource} from '@cycle/react';
import {AsyncStorageSource} from 'cycle-native-asyncstorage';
import RNFS = require('react-native-fs');
import path = require('path');

export default function intent(
  screenSource: ReactSource,
  storageSource: AsyncStorageSource,
) {
  const accountExists$ = xs.fromPromise(
    (async () => {
      const appPath = RNFS.DocumentDirectoryPath;
      const flumeLogPath = path.join(appPath, '.ssb', 'flume', 'log.offset');
      if (!(await RNFS.exists(flumeLogPath))) return false;
      const stat = await RNFS.stat(flumeLogPath);
      const exists = ((stat.size as any) as number) >= 10;
      return exists;
    })(),
  );

  const latestVisit$ = storageSource.getItem('latestVisit');

  return {
    createAccount$: screenSource.select('create-account').events('press'),

    restoreAccount$: screenSource.select('restore-account').events('press'),

    skipOrNot$: xs
      .combine(accountExists$, latestVisit$)
      .map(([accountExists, latestVisit]) => accountExists || !!latestVisit),

    scrollBy$: xs
      .merge(
        screenSource.select('continue1').events('press'),
        screenSource.select('continue2').events('press'),
        screenSource.select('continue3').events('press'),
        screenSource.select('continue4').events('press'),
        screenSource.select('continue5').events('press'),
        screenSource.select('continue6').events('press'),
      )
      .mapTo([/* offset */ +1, /* animated */ true] as [number, boolean]),

    pageChanged$: screenSource.select('swiper').events('indexChanged'),

    learnMoreSSB$: screenSource.select('learn-more-ssb').events('press'),

    learnMoreOffGrid$: screenSource
      .select('learn-more-off-grid')
      .events('press'),

    learnMoreConnections$: screenSource
      .select('learn-more-connections')
      .events('press'),

    learnMoreModeration$: screenSource
      .select('learn-more-moderation')
      .events('press'),

    learnMorePermanence$: screenSource
      .select('learn-more-permanence')
      .events('press'),
  };
}
