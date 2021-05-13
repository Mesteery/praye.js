function toRadians(degrees: number) {
	return degrees * (Math.PI / 180);
}

function toDegrees(radians: number) {
	return (radians * 180) / Math.PI;
}

export function sin(degrees: number): number {
	return Math.sin(toRadians(degrees));
}

export function cos(degrees: number): number {
	return Math.cos(toRadians(degrees));
}

export function tan(degrees: number): number {
	return Math.tan(toRadians(degrees));
}

export function arcsin(degrees: number): number {
	return toDegrees(Math.asin(degrees));
}

export function arccos(degrees: number): number {
	return toDegrees(Math.acos(degrees));
}

export function arccot(degrees: number): number {
	return toDegrees(Math.atan(1 / degrees));
}

export function arctan2(y: number, x: number): number {
	return toDegrees(Math.atan2(y, x));
}

export function fixAngle(angle: number): number {
	return fix(angle, 360);
}

export function fixHour(hour: number): number {
	return fix(hour, 24);
}

function fix(a: number, b: number): number {
	const fixed = a % b;
	return fixed < 0 ? fixed + b : fixed;
}
