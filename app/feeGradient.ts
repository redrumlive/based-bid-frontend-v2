const limit = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

function mixHex(a: string, b: string, amount: number) {
  const normalize = (value: string) => {
    const raw = value.startsWith('#') ? value.slice(1) : value;
    return raw.length === 3 ? raw.split('').map((part) => part + part).join('') : raw;
  };
  const left = normalize(a);
  const right = normalize(b);
  if (left.length !== 6 || right.length !== 6) return b;
  const lerp = (start: number, end: number) => Math.round(start + (end - start) * limit(amount, 0, 1));
  const hex = (value: number) => value.toString(16).padStart(2, '0');
  const leftRgb = [parseInt(left.slice(0, 2), 16), parseInt(left.slice(2, 4), 16), parseInt(left.slice(4, 6), 16)];
  const rightRgb = [parseInt(right.slice(0, 2), 16), parseInt(right.slice(2, 4), 16), parseInt(right.slice(4, 6), 16)];
  return `#${hex(lerp(leftRgb[0], rightRgb[0]))}${hex(lerp(leftRgb[1], rightRgb[1]))}${hex(lerp(leftRgb[2], rightRgb[2]))}`;
}

export function featheredFeeGradient(parts: Array<{ weight: number; color: string }>) {
  if (!parts.length) return 'rgba(0,0,0,0)';
  const steps = [0.06, 0.14, 0.24, 0.36, 0.5, 0.64, 0.76, 0.86, 0.94] as const;
  const stops: Array<{ color: string; position: number }> = [{ color: parts[0].color, position: 0 }];
  const push = (color: string, position: number) => stops.push({ color, position: limit(position, 0, 100) });
  let accumulated = 0;

  for (let index = 0; index < parts.length; index += 1) {
    const current = parts[index];
    const next = parts[index + 1];
    const end = limit(accumulated + current.weight, 0, 100);
    if (!next) {
      push(current.color, end);
      break;
    }
    const feather = limit(Math.min(8.25, current.weight * 0.58, next.weight * 0.58), 0, 8.25);
    const left = limit(end - feather, accumulated, 100);
    const right = limit(end + feather, 0, 100);
    if (feather < 0.15) {
      push(current.color, end);
      push(next.color, end);
      accumulated = end;
      continue;
    }
    push(current.color, left);
    steps.forEach((step) => push(mixHex(current.color, next.color, step), left + (right - left) * step));
    push(next.color, right);
    accumulated = end;
  }

  const segments: string[] = [];
  let last = -Infinity;
  stops.forEach((stop, index) => {
    const position = Math.max(stop.position, last);
    const finalStop = index === stops.length - 1;
    if (segments.length && !finalStop && position - last < 0.01) {
      segments[segments.length - 1] = `${stop.color} ${last.toFixed(4)}%`;
    } else {
      last = position;
      segments.push(`${stop.color} ${last.toFixed(4)}%`);
    }
  });

  return `linear-gradient(90deg, ${segments.join(', ')})`;
}
