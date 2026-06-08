import {
  useForkRef
} from "./chunk-4DOFI3DB.js";
import {
  useEnhancedEffect_default
} from "./chunk-O7H7W4IK.js";
import {
  require_react
} from "./chunk-Z2U7T4W2.js";
import {
  __toESM
} from "./chunk-LK32TJAX.js";

// node_modules/@mui/material/esm/utils/useForkRef.js
var useForkRef_default = useForkRef;

// node_modules/@mui/utils/esm/useEventCallback/useEventCallback.js
var React = __toESM(require_react(), 1);
function useEventCallback(fn) {
  const ref = React.useRef(fn);
  useEnhancedEffect_default(() => {
    ref.current = fn;
  });
  return React.useRef((...args) => (
    // @ts-expect-error hide `this`
    (0, ref.current)(...args)
  )).current;
}
var useEventCallback_default = useEventCallback;

export {
  useEventCallback_default,
  useForkRef_default
};
//# sourceMappingURL=chunk-Y3EOM4VG.js.map
