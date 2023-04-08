export const stripAttr = (nameAttribute: string) => {
  if (nameAttribute.indexOf('attr_') === 0) {
    return nameAttribute.substring('attr_'.length);
  }
  return nameAttribute;
};

export const workerScope: {} /*DedicatedWorkerGlobalScope*/ = self;
