import { Coordinates, getJulianDay, midDay, riseSetAngle, sunAngleTime, sunPosition } from './astronomy';
import { arccot, fixHour, tan } from './dmath';

export interface CalculationType {
	/**
	 * Degrees (`angle`) or minutes (`minute`).
	 */
	type: 'angle' | 'minute';
	value: number;
}

/**
 * The midnight calculation method
 */
export const enum MidnightMethod {
	/**
	 * from Sunset to Sunrise
	 */
	Standard = 'standard',
	/**
	 * from Sunset to Fajr
	 */
	Jafari = 'jafari',
}

/**
 * The asr juristic methods
 */
export const enum AsrJuristic {
	/**
	 * factor: 1
	 */
	Standard = 1,
	/**
	 * factor: 2
	 */
	Hanafi,
}

/**
 * Represents a calculation method (parameters)
 */
export interface CalculationMethod {
	imsak?: CalculationType;
	/**
	 * angle in degrees
	 */
	fajr: number;
	/**
	 * in minutes
	 */
	dhuhr?: number;
	asr?: AsrJuristic;
	maghrib?: CalculationType;
	isha: CalculationType;
	midnight?: MidnightMethod;
}

/**
 * Represents prayer times
 */
export interface PrayerTimes {
	/**
	 * Imsak
	 */
	imsak: number;
	/**
	 * Fajr
	 */
	fajr: number;
	/**
	 * Sunrise
	 */
	sunrise: number;
	/**
	 * Dhur
	 */
	dhuhr: number;
	/**
	 * Asr
	 */
	asr: number;
	/**
	 * Sunset
	 */
	sunset: number;
	/**
	 * Maghrif
	 */
	maghrib: number;
	/**
	 * Isha
	 */
	isha: number;
	/**
	 * Middle of the night
	 */
	midnight: number;
}

/**
 * The method to use for higher latitudes
 *
 * http://praytimes.org/calculation#Higher_Latitudes
 */
export const enum HightLatMethods {
	/**
	 * Middle of the Night
	 *
	 * > *In this method, the period from sunset to sunrise is divided into two halves.
	 * The first half is considered to be the "night" and the other half as "day break".
	 * Fajr and Isha in this method are assumed to be at mid-night during the abnormal periods.*
	 * http://praytimes.org/calculation#Higher_Latitudes
	 */
	NightMiddle = 'NightMiddle',
	/*
	 * Angle-Based Method
	 *
	 * > *This is an intermediate solution, used by some recent prayer time calculators.
	 * Let α be the twilight angle for Isha, and let t = α/60.
	 * The period between sunset and sunrise is divided into t parts.
	 * Isha begins after the first part.
	 * For example, if the twilight angle for Isha is 15, then Isha begins at the end of the first quarter (15/60) of the night.
	 * Time for Fajr is calculated similarly.*
	 * http://praytimes.org/calculation#Higher_Latitudes
	 */
	AngleBased = 'AngleBased',
	/**
	 * One-Seventh of the Night
	 *
	 * > *In this method, the period between sunset and sunrise is divided into seven parts.
	 * Isha begins after the first one-seventh part, and Fajr is at the beginning of the seventh part.*
	 * http://praytimes.org/calculation#Higher_Latitudes
	 */
	OneSeventh = 'OneSeventh',
}

/**
 * Pre-defined calculation methods
 */
export const enum CalculationMethods {
	/**
	 * Muslim World League
	 */
	MWL = 'MWL',
	/**
	 * Islamic Society of North America
	 */
	ISNA = 'ISNA',
	/*
	 * Egyptian General Authority of Survey
	 */
	Egypt = 'Egypt',
	/**
	 * Umm Al-Qura University, Makkah
	 */
	Makkah = 'Makkah',
	/**
	 * University of Islamic Sciences, Karachi
	 */
	Karachi = 'Karachi',
	/**
	 * Institute of Geophysics, University of Tehran
	 */
	Tehran = 'Tehran',
	/**
	 * Shia Ithna-Ashari, Leva Institute, Qum
	 */
	Jafari = 'Jafari',
	/**
	 * Muslims of France
	 */
	MF = 'MF',
}

/**
 * Create complete calculation method
 *
 * @param method The calculation method
 * @returns The provided method with defaults
 */
export function createCalculationMethod(method: CalculationMethod): Required<CalculationMethod> {
	return {
		imsak: method.imsak ?? { type: 'minute', value: 10 },
		fajr: method.fajr,
		dhuhr: method.dhuhr ?? 0,
		asr: method.asr ?? AsrJuristic.Standard,
		maghrib: method.maghrib ?? { type: 'minute', value: 0 },
		isha: method.isha,
		midnight: method.midnight ?? MidnightMethod.Standard,
	};
}

/**
 * Get calculation method
 *
 *
 * # Example
 * ~~~~
 * import { getCalculationMethod } from 'praye.js';
 *
 * getCalculationMethod('MWL');
 * getCalculationMethod('Makkah', true); // in ramadan period
 * getCalculationMethod('ISNA');
 * ~~~~
 *
 * @param method The calculation method
 * @param isRamadan if it's in the ramadan period (only for Makkah's method), default `false`
 * @returns calculation method
 */
export function getCalculationMethod(
	method: keyof typeof CalculationMethods,
	isRamadan = false,
): CalculationMethod | undefined {
	return {
		[CalculationMethods.MWL]: { fajr: 18, isha: { type: 'angle', value: 17 } },
		[CalculationMethods.ISNA]: { fajr: 15, isha: { type: 'angle', value: 15 } },
		[CalculationMethods.Egypt]: { fajr: 19.5, isha: { type: 'angle', value: 17.5 } },
		[CalculationMethods.Makkah]: { fajr: 19.5, isha: { type: 'minute', value: isRamadan ? 120 : 90 } },
		[CalculationMethods.Karachi]: { fajr: 18, isha: { type: 'angle', value: 18 } },
		[CalculationMethods.Tehran]: {
			fajr: 17.7,
			maghrib: { type: 'angle', value: 4.5 },
			isha: { type: 'angle', value: 14 },
			midnight: MidnightMethod.Jafari,
		},
		[CalculationMethods.Jafari]: {
			fajr: 16,
			maghrib: { type: 'angle', value: 4 },
			isha: { type: 'angle', value: 14 },
			midnight: MidnightMethod.Jafari,
		},
		[CalculationMethods.MF]: { fajr: 12, isha: { type: 'angle', value: 12 } },
	}[method] as CalculationMethod | undefined;
}

function timeDiff(time1: number, time2: number): number {
	return fixHour(time2 - time1);
}

function asrTime(julianDay: number, latitude: number, factor: AsrJuristic, time: number): number {
	const decl = sunPosition(julianDay + time)[0];
	const angle = -arccot(factor + tan(Math.abs(latitude - decl)));
	return sunAngleTime(julianDay, latitude, angle, time, false);
}

/**
 * The prayer manager
 *
 * # Example
 * ~~~~
 * import { PrayerManager, getCalculationMethod } from 'praye.js';
 *
 * const prayerManager = new PrayerManager(getCalculationMethod('MWL'));
 * // With Makkah
 * const prayerManager = new PrayerManager(getCalculationMethod('Makkah', true)); // we are in Ramadan!
 * // Custom
 * const prayerManager = new PrayerManager({ fajr: Math.random() * 10 }); // don't do this
 *
 * const aDate = new Date(2021, 4, 12);
 * const aHouse = [38.8976763, -77.036529, 18];
 *
 * const prayers = prayerManager.getTimes(aDate, aHouse);
 * ~~~~
 */
export class PrayerManager {
	// eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
	#method!: Required<CalculationMethod>;

	public getCalculationMethod(): Required<CalculationMethod> {
		return this.#method;
	}

	public setCalculationMethod(method: CalculationMethod): void {
		this.#method = createCalculationMethod(method);
	}

	/**
	 * Initialize a PrayerManager
	 *
	 * @param method The calculation method to use
	 * @param hightLatMethod The high latitudes method to use
	 */
	public constructor(method: CalculationMethod, public hightLatMethod?: keyof typeof HightLatMethods) {
		this.setCalculationMethod(method);
	}

	/**
	 * The prayer manager
	 *
	 * # Example
	 * ~~~~
	 * import { PrayerManager, getPrayerMethod } from 'praye.js';
	 *
	 * const prayerManager = new PrayerManager(getPrayerMethod('MWL'));
	 *
	 * const aDate = new Date(2021, 4, 12);
	 * const aHouse = [38.8976763, -77.036529, 18];
	 * const prayers = prayerManager.getTimes(aDate, aHouse);
	 * ~~~~
	 */
	public getTimes(date: Date, [latitude, longitude, altitude = 0]: Coordinates): PrayerTimes {
		const julianDay = getJulianDay(date) - longitude / (15 * 24);
		const method = this.#method;
		const adjust = longitude / 15;

		let imsak = sunAngleTime(julianDay, latitude, method.imsak.value, 5 / 24, true) - adjust;
		let fajr = sunAngleTime(julianDay, latitude, method.fajr, 5 / 24, true) - adjust;
		const sunrise = sunAngleTime(julianDay, latitude, riseSetAngle(altitude), 6 / 24, true) - adjust;
		const dhuhr = midDay(julianDay, 12 / 24) - adjust + method.dhuhr / 60;
		const asr = asrTime(julianDay, latitude, method.asr, 13 / 24) - adjust;
		const sunset = sunAngleTime(julianDay, latitude, riseSetAngle(altitude), 18 / 24, false) - adjust;
		let maghrib = sunAngleTime(julianDay, latitude, method.maghrib.value, 18 / 24, false) - adjust;
		let isha = sunAngleTime(julianDay, latitude, method.isha.value, 18 / 24, false) - adjust;

		if (this.hightLatMethod) {
			const nightTime = timeDiff(sunset, sunrise);

			imsak = this.adjustHighlatTime(imsak, sunrise, method.imsak.value, nightTime, true);
			fajr = this.adjustHighlatTime(fajr, sunrise, method.fajr, nightTime, true);
			maghrib = this.adjustHighlatTime(maghrib, sunset, method.maghrib.value, nightTime, false);
			isha = this.adjustHighlatTime(isha, sunset, method.isha.value, nightTime, false);
		}

		if (method.imsak.type === 'minute') {
			imsak = fajr - method.imsak.value / 60;
		}
		if (method.maghrib.type === 'minute') {
			maghrib = sunset - method.maghrib.value / 60;
		}
		if (method.isha.type === 'minute') {
			isha = maghrib - method.isha.value / 60;
		}

		return {
			imsak,
			fajr,
			sunrise,
			dhuhr,
			asr,
			sunset,
			maghrib,
			isha,
			midnight:
				sunset + (method.midnight === MidnightMethod.Standard ? timeDiff(sunset, sunrise) : timeDiff(sunset, fajr)) / 2,
		};
	}

	private adjustHighlatTime(time: number, base: number, angle: number, night: number, ccw: boolean): number {
		const portion = this.nightPortion(angle, night);
		const diff = ccw ? timeDiff(time, base) : timeDiff(base, time);

		if (portion > diff) {
			return time;
		}

		return base + (ccw ? -portion : portion);
	}

	private nightPortion(angle: number, night: number): number {
		return (
			{
				[HightLatMethods.NightMiddle]: 1 / 2,
				[HightLatMethods.AngleBased]: (1 / 60) * angle,
				[HightLatMethods.OneSeventh]: 1 / 7,
			}[this.hightLatMethod!] * night
		);
	}
}
