const EPSILON = 1e-1;

export const isCloseEnough = (value: number, target: number): boolean => {
  return Math.abs(value - target) <= EPSILON;
};

export const autobalanceAllocations = (
  allocations: Array<{ id: string; allocation: number; locked: boolean }>,
  idToSkip: string
) => {
  const [amountToBalance, totalUnlocked, unlockedEntities] = allocations.reduce(
    (acc, allocation) => {
      acc[0] -=
        allocation.locked || allocation.id === idToSkip
          ? Number(allocation.allocation.toFixed(2))
          : 0;
      return [
        acc[0] < 0 ? 0 : acc[0],
        acc[1] +
          (allocation.locked || allocation.id === idToSkip
            ? 0
            : Number(allocation.allocation.toFixed(2))),
        acc[2] + (allocation.locked || allocation.id === idToSkip ? 0 : 1),
      ];
    },
    [100, 0, 0]
  );

  return allocations.map((allocation) => {
    if (!allocation.locked && allocation.id !== idToSkip) {
      return {
        ...allocation,
        allocation: totalUnlocked
          ? (Number(allocation.allocation.toFixed(2)) / totalUnlocked) *
            amountToBalance
          : unlockedEntities
          ? amountToBalance / unlockedEntities
          : 0,
      };
    }
    return allocation;
  });
};

export const calculateBalancedAmounts = (
  allocations: Record<string, number>,
  lockedFields: Record<string, boolean>,
  changedCategoryId: string,
  newValue: number
) => {
  let newAllocations = Object.entries(allocations).map(([id, allocation]) => ({
    id,
    allocation: id === changedCategoryId ? newValue : allocation,
    locked: lockedFields[id],
  }));

  const balancedAllocations = autobalanceAllocations(
    newAllocations,
    changedCategoryId
  );

  return Object.fromEntries(
    balancedAllocations.map(({ id, allocation }) => [
      id,
      Number(allocation.toFixed(14)),
    ])
  );
};
