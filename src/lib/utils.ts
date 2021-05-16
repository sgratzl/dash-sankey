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

  overlap(v: Iterable<T> | OverlapHelper<T>): OverlapHelper<T> {
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
}
