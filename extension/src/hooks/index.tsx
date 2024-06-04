import React from "react";

export const useOnMount = (effect: React.EffectCallback) =>
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(effect, []);
