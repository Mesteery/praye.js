# praye.js

_Lightweight and highly accurate low-level library for calculating (Islamic) prayer times._

## Usage

```typescript
import { PrayerManager, getCalculationMethod } from 'praye.js';

const prayerManager = new PrayerManager(getCalculationMethod('MWL'));

const aDate = new Date(2021, 4, 12);
const aHouse: Coordinates = [38.8976763, -77.036529, 18.0];

const times = prayerManager.getTimes(aDate, aHouse);
```
