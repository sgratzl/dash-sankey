import PropTypes from 'prop-types';

export function classNames(...cs: (string | boolean | null | undefined)[]): string {
  return cs.filter(Boolean).join(' ');
}

export class OverlapHelper<T> {
  private readonly set: Set<T>;

  readonly has: (v: T) => boolean;

  constructor(ids: Iterable<T> | Set<T>) {
    this.set = ids instanceof Set ? ids : new Set(ids);
    this.has = this.set.has.bind(this.set);
  }

  get elems(): T[] {
    return [...this.set];
  }

  get isEmpty(): boolean {
    return this.set.size === 0;
  }

  get isNotEmpty(): boolean {
    return this.set.size > 0;
  }

  get size(): number {
    return this.set.size;
  }

  get length(): number {
    return this.set.size;
  }

  intersect(v: Iterable<T> | OverlapHelper<T>): OverlapHelper<T> {
    if (this.isEmpty) {
      return new OverlapHelper(new Set<T>());
    }

    const r = new Set<T>();
    if (v instanceof OverlapHelper) {
      v.set.forEach((vi) => {
        if (this.has(vi)) {
          r.add(vi);
        }
      });
    } else {
      for (const vi of v) {
        if (this.has(vi)) {
          r.add(vi);
        }
      }
    }
    return new OverlapHelper(r);
  }

  copy(): OverlapHelper<T> {
    return new OverlapHelper(new Set(this.set));
  }

  intersectUpdate(v: Iterable<T> | OverlapHelper<T>): void {
    if (this.isEmpty) {
      return;
    }

    if (v instanceof OverlapHelper) {
      if (v.isEmpty) {
        this.set.clear();
        return;
      }
      for (const elem of this.elems) {
        if (!v.has(elem)) {
          this.set.delete(elem);
        }
      }
    } else {
      const has = new Set(v);
      for (const elem of this.elems) {
        if (!has.has(elem)) {
          this.set.delete(elem);
        }
      }
    }
  }

  withoutUpdate(v: OverlapHelper<T>): void {
    if (this.isEmpty || v.isEmpty) {
      return;
    }

    for (const elem of this.elems) {
      if (v.has(elem)) {
        this.set.delete(elem);
      }
    }
  }

  addUpdate(v: OverlapHelper<T>): void {
    for (const vi of v.set) {
      this.set.add(vi);
    }
  }
}

export interface IBox {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export function deriveBox(p: number | IBox, defaultValue: IBox): IBox {
  return {
    ...defaultValue,
    left: typeof p === 'number' ? p : p.left,
    right: typeof p === 'number' ? p : p.right,
    top: typeof p === 'number' ? p : p.top,
    bottom: typeof p === 'number' ? p : p.bottom,
  };
}

export const PADDING_PROP_TYPES = PropTypes.oneOfType([
  PropTypes.number.isRequired,
  PropTypes.shape({
    left: PropTypes.number.isRequired,
    top: PropTypes.number.isRequired,
    right: PropTypes.number.isRequired,
    bottom: PropTypes.number.isRequired,
  }).isRequired,
]);

export function isArray<T>(a: unknown): a is readonly T[] {
  return Array.isArray(a);
}
