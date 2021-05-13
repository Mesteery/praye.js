import { Coordinates } from '../astronomy';
import { getCalculationMethod, PrayerManager } from '../prayer';

describe(PrayerManager.prototype.getTimes, () => {
	it('should compute the right times', () => {
		const prayerManager = new PrayerManager(getCalculationMethod('MWL'));

		const aDate = new Date(2021, 3, 12);
		const aHouse: Coordinates = [38.897_676_3, -77.036_529, 18];

		expect(prayerManager.getTimes(aDate, aHouse)).toStrictEqual({
			imsak: 8.860_089_038_173_626,
			fajr: 9.026_755_704_840_292,
			sunrise: 10.581_941_026_910_075,
			dhuhr: 17.147_080_969_043_08,
			asr: 20.831_494_870_257_075,
			sunset: 23.722_396_131_662_42,
			maghrib: 23.722_396_131_662_42,
			isha: 25.184_533_130_566_4,
			midnight: 29.152_168_579_286_247,
		});
	});
});
