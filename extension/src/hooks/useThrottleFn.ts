import { useCallback, useRef } from 'react';
import { throttle } from 'lodash';

const useThrottleFn = (callback: (...args: any[]) => void, delay: number) => {
    const throttledFn = useRef(throttle(callback, delay)).current;

    return useCallback((...args: any[]) => {
        throttledFn(...args);
    }, []);
};

export default useThrottleFn;