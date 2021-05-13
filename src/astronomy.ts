import { arccos, arcsin, arctan2, cos, fixAngle, fixHour, sin } from './dmath';

export type Coordinates = [latitude: number, longitude: number, altitude?: number];

export function getJulianDay(date: Date): number {
	let year = date.getFullYear();
	let month = date.getMonth() + 1;
	const day = date.getDate();

	if (month < 3) {
		year -= 1;
		month += 12;
	}

	return Math.floor(365.2425 * year + 30.6001 * month) + day + 1_721_027.5;
}

export function midDay(julianDate: number, time: number): number {
	const eqt = sunPosition(julianDate + time)[1];
	return fixHour(12 - eqt);
}

export function sunAngleTime(julianDate: number, latitude: number, angle: number, time: number, ccw: boolean): number {
	const [decl, eqt] = sunPosition(julianDate + time);
	const t = (1 / 15) * arccos((-sin(angle) - sin(decl) * sin(latitude)) / (cos(decl) * cos(latitude)));
	return fixHour(12 - eqt) + (ccw ? -t : t);
}

export function sunPosition(jd: number): [decl: number, eqt: number] {
	const D = jd - 2_451_545;

	const q = fixAngle(280.460_618_37 + 0.985_647_36 * D);
	const g = fixAngle(357.528 + 0.985_600_28 * D);
	const L = fixAngle(q + 1.915 * sin(g) + 0.02 * sin(2 * g));
	const e = 23.439 - 0.000_000_36 * D;

	const decl = arcsin(sin(e) * sin(L));
	const eqt = q / 15 - fixHour(arctan2(cos(e) * sin(L), cos(L)) / 15);
	return [decl, eqt];
}

const EARTH_RADIUS = 6_371_008.7714; // in meters

export function riseSetAngle(elevation: number): number {
	return 0.833 + arccos(EARTH_RADIUS / (EARTH_RADIUS + elevation));
}
