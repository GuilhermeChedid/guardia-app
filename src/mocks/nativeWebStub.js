import React from 'react';

const noop = async () => false;
const WebNativeComponent = () => null;

const NativeWebStub = new Proxy(WebNativeComponent, {
    get(target, property) {
        if (property === 'default') return target;
        return noop;
    },
});

export const canDrawOverlays = () => false;
export const closeBubble = noop;
export const openApp = noop;
export const requestPermission = noop;
export const setBubbleRendererForBubble = noop;
export const showBubble = noop;
export const setAppIcon = noop;

export default NativeWebStub;
