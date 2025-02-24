import { useCallback } from 'react';
import { throttle } from 'lodash';

const useThrottleFn = (callback: (...args: any[]) => void, delay: number, deps: any[] = []) => {
    return useCallback(throttle(callback, delay), [delay, ...deps]);
};

export default useThrottleFn;
