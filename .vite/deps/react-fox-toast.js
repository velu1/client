import {
  h,
  j,
  m
} from "./chunk-57RRUQPG.js";
import {
  require_react
} from "./chunk-Z2U7T4W2.js";
import {
  __toESM
} from "./chunk-LK32TJAX.js";

// node_modules/react-fox-toast/dist/index.mjs
var import_react = __toESM(require_react(), 1);
var import_react2 = __toESM(require_react(), 1);
var import_react3 = __toESM(require_react(), 1);
var import_react4 = __toESM(require_react(), 1);
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var toastSubscribers = [];
var toastList = [];
var defaultDuration;
var defaultPosition;
var setToastDefaults = (duration, position) => {
  if (duration !== void 0) {
    defaultDuration = duration;
  }
  if (position !== void 0) {
    defaultPosition = position;
  }
};
var addToast = (toast2) => {
  var _a, _b, _c;
  const id = Math.random().toString(36).substring(2, 9);
  (_a = toast2.position) != null ? _a : toast2.position = defaultPosition;
  const newToast = __spreadProps(__spreadValues({}, toast2), {
    id,
    isClosing: false,
    isVisible: true,
    isExpanded: false,
    isPausedOnHover: (_b = toast2.isPausedOnHover) != null ? _b : true
    // Default to true for pausing
  });
  toastList = ((_c = toast2.position) == null ? void 0 : _c.includes("top")) ? [newToast, ...toastList] : [...toastList, newToast];
  notifySubscribers();
  newToast.duration = newToast.duration || defaultDuration;
  if (newToast.duration && newToast.duration !== Infinity) {
    startToastTimer(id, newToast.duration);
  }
  return id;
};
var startToastTimer = (id, duration) => {
  const toast2 = toastList.find((t) => t.id === id);
  if (toast2) {
    if (toast2.timerId) {
      clearTimeout(toast2.timerId);
    }
    const timerId = setTimeout(() => {
      removeToast(id);
    }, duration);
    toastList = toastList.map(
      (t) => t.id === id ? __spreadProps(__spreadValues({}, t), { timerId, startTime: Date.now() }) : t
    );
    notifySubscribers();
  }
};
var onExpandToast = (id) => {
  const toast2 = toastList.find((t) => t.id === id);
  if (toast2 == null ? void 0 : toast2.onExpandContent) {
    toast2.onExpandContent(toast2.id, toast2.message);
  }
};
var removeToast = (id) => {
  const toast2 = toastList.find((t) => t.id === id);
  if (toast2 == null ? void 0 : toast2.onDismiss) {
    toast2.onDismiss(toast2.id, toast2.message);
  }
  toastList = toastList.map(
    (toast3) => toast3.id === id ? __spreadProps(__spreadValues({}, toast3), { isClosing: true }) : toast3
  );
  notifySubscribers();
  setTimeout(() => {
    toastList = toastList.filter((toast3) => toast3.id !== id);
    notifySubscribers();
  }, 300);
};
var removeAllToast = () => {
  toastList = toastList.map((toast2) => __spreadProps(__spreadValues({}, toast2), {
    isClosing: true
  }));
  notifySubscribers();
  setTimeout(() => {
    toastList = [];
    notifySubscribers();
  }, 300);
};
var updateToast = (id, updates) => {
  const toast2 = toastList.find((t) => t.id === id);
  if (toast2 && updates.duration !== void 0) {
    startToastTimer(id, updates.duration);
  }
  toastList = toastList.map(
    (toast3) => toast3.id === id ? __spreadValues(__spreadValues({}, toast3), updates) : toast3
  );
  notifySubscribers();
};
var pauseToastTimer = (id) => {
  var _a;
  const toast2 = toastList.find((t) => t.id === id);
  if (toast2 && toast2.timerId && !toast2.isPaused) {
    clearTimeout(toast2.timerId);
    const elapsedTime = Date.now() - (toast2.startTime || 0);
    const remainingTime = ((_a = toast2.remainingTime) != null ? _a : toast2.duration) - elapsedTime;
    toastList = toastList.map(
      (t) => t.id === id ? __spreadProps(__spreadValues({}, t), { isPaused: true, remainingTime }) : t
    );
    notifySubscribers();
  }
};
var resumeToastTimer = (id) => {
  const toast2 = toastList.find((t) => t.id === id);
  if (toast2 && toast2.isPaused && toast2.remainingTime !== void 0) {
    toastList = toastList.map(
      (t) => t.id === id ? __spreadProps(__spreadValues({}, t), { isPaused: false, startTime: Date.now() }) : t
    );
    startToastTimer(id, toast2.remainingTime);
  }
};
var getRemainingTimeForToast = (id) => {
  const toast2 = toastList.find((t) => t.id === id);
  if (toast2 && toast2.isPaused && toast2.remainingTime !== void 0) {
    return toast2.remainingTime;
  }
  if (toast2 && !toast2.isPaused && toast2.duration !== void 0) {
    const elapsedTime = Date.now() - (toast2.startTime || 0);
    const remainingTime = toast2.duration - elapsedTime;
    return remainingTime > 0 ? remainingTime : 0;
  }
  return null;
};
var subscribeToToasts = (callback) => {
  toastSubscribers.push(callback);
  callback(toastList);
  return () => {
    const index = toastSubscribers.indexOf(callback);
    if (index > -1) toastSubscribers.splice(index, 1);
  };
};
var notifySubscribers = () => {
  toastSubscribers.forEach((callback) => callback([...toastList]));
};
var defaultIcons = {
  success: import_react4.default.createElement(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      width: "24",
      height: "24",
      viewBox: "0 0 100 100"
    },
    import_react4.default.createElement("circle", { cx: "50", cy: "50", r: "0", fill: "green" }, import_react4.default.createElement("animate", { attributeName: "r", from: "0", to: "45", dur: "0.3s", fill: "freeze" })),
    import_react4.default.createElement(
      "path",
      {
        d: "M35,50 L45,60 L65,40",
        stroke: "white",
        strokeWidth: "5",
        fill: "transparent",
        strokeDasharray: "0, 100"
      },
      import_react4.default.createElement(
        "animate",
        {
          attributeName: "stroke-dasharray",
          from: "0, 100",
          to: "100, 0",
          dur: "0.3s",
          begin: "0.3s",
          fill: "freeze"
        }
      )
    )
  ),
  error: import_react4.default.createElement(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      width: "24",
      height: "24",
      viewBox: "0 0 100 100"
    },
    import_react4.default.createElement("circle", { cx: "50", cy: "50", r: "0", fill: "red" }, import_react4.default.createElement("animate", { attributeName: "r", from: "0", to: "45", dur: "0.3s", fill: "freeze" })),
    import_react4.default.createElement("g", { stroke: "white", strokeWidth: "5", fill: "transparent" }, import_react4.default.createElement("line", { x1: "35", y1: "35", x2: "35", y2: "35" }, import_react4.default.createElement(
      "animate",
      {
        attributeName: "x2",
        from: "35",
        to: "65",
        dur: "0.2s",
        begin: "0.3s",
        fill: "freeze"
      }
    ), import_react4.default.createElement(
      "animate",
      {
        attributeName: "y2",
        from: "35",
        to: "65",
        dur: "0.2s",
        begin: "0.3s",
        fill: "freeze"
      }
    )), import_react4.default.createElement("line", { x1: "65", y1: "35", x2: "65", y2: "35" }, import_react4.default.createElement(
      "animate",
      {
        attributeName: "x2",
        from: "65",
        to: "35",
        dur: "0.2s",
        begin: "0.3s",
        fill: "freeze"
      }
    ), import_react4.default.createElement(
      "animate",
      {
        attributeName: "y2",
        from: "35",
        to: "65",
        dur: "0.2s",
        begin: "0.3s",
        fill: "freeze"
      }
    )))
  ),
  info: import_react4.default.createElement(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      width: "24",
      height: "24",
      viewBox: "0 0 100 100"
    },
    import_react4.default.createElement("circle", { cx: "50", cy: "50", r: "0", fill: "blue" }, import_react4.default.createElement("animate", { attributeName: "r", from: "0", to: "45", dur: "0.3s", fill: "freeze" })),
    import_react4.default.createElement(
      "text",
      {
        x: "50",
        y: "60",
        fontSize: "60",
        fontWeight: "bold",
        textAnchor: "middle",
        fill: "white",
        opacity: "0",
        style: { dominantBaseline: "middle" }
      },
      "i",
      import_react4.default.createElement(
        "animate",
        {
          attributeName: "opacity",
          from: "0",
          to: "1",
          dur: "0.3s",
          begin: "0.3s",
          fill: "freeze"
        }
      )
    )
  ),
  warning: import_react4.default.createElement(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      width: "24",
      height: "24",
      viewBox: "0 0 100 100"
    },
    import_react4.default.createElement("circle", { cx: "50", cy: "50", r: "0", fill: "#FFA500" }, import_react4.default.createElement(
      "animate",
      {
        attributeName: "r",
        from: "0",
        to: "45",
        dur: "0.3s",
        keyTimes: "0;1",
        fill: "freeze"
      }
    )),
    import_react4.default.createElement("g", null, import_react4.default.createElement(
      "line",
      {
        x1: "50",
        y1: "25",
        x2: "50",
        y2: "25",
        stroke: "white",
        strokeWidth: "8",
        strokeLinecap: "round"
      },
      import_react4.default.createElement(
        "animate",
        {
          attributeName: "y2",
          from: "25",
          to: "60",
          dur: "0.2s",
          begin: "0.3s",
          fill: "freeze"
        }
      ),
      import_react4.default.createElement(
        "animate",
        {
          attributeName: "opacity",
          from: "0",
          to: "1",
          dur: "0.2s",
          begin: "0.3s",
          fill: "freeze"
        }
      )
    ), import_react4.default.createElement("circle", { cx: "50", cy: "73", r: "0", fill: "white" }, import_react4.default.createElement(
      "animate",
      {
        attributeName: "r",
        from: "0",
        to: "4",
        dur: "0.2s",
        begin: "0.5s",
        fill: "freeze"
      }
    ), import_react4.default.createElement(
      "animate",
      {
        attributeName: "opacity",
        from: "0",
        to: "1",
        dur: "0.2s",
        begin: "0.5s",
        fill: "freeze"
      }
    )))
  ),
  custom: null,
  promise: import_react4.default.createElement(
    "svg",
    {
      width: "24",
      height: "24",
      viewBox: "0 0 24 24",
      xmlns: "http://www.w3.org/2000/svg"
    },
    import_react4.default.createElement("style", null, `
          .spinner_Pcrv {
            transform-origin: center;
            animation: spinner_xeMo 0.6s linear infinite;
          }
          @keyframes spinner_xeMo {
            100% {
              transform: rotate(360deg);
            }
          }
        `),
    import_react4.default.createElement(
      "path",
      {
        className: "spinner_Pcrv",
        d: "M2,12A10.94,10.94,0,0,1,5,4.65c-.21-.19-.42-.36-.62-.55h0A11,11,0,0,0,12,23c.34,0,.67,0,1-.05C6,23,2,17.74,2,12Z"
      }
    )
  ),
  drawer: import_react4.default.createElement(
    "svg",
    {
      width: "25",
      height: "25",
      viewBox: "0 0 50 50",
      xmlns: "http://www.w3.org/2000/svg"
    },
    import_react4.default.createElement(
      "circle",
      {
        cx: "25",
        cy: "25",
        r: "24",
        fill: "#FFBF00",
        stroke: "",
        strokeWidth: "2"
      }
    ),
    import_react4.default.createElement("g", { transform: "translate(7, 7) scale(1.5)" }, import_react4.default.createElement("path", { fill: "none", d: "M0 0h24v24H0z" }), import_react4.default.createElement(
      "path",
      {
        d: "M3 13h18v8.002c0 .551-.445.998-.993.998H3.993A.995.995 0 0 1 3 21.002V13zM3 2.998C3 2.447 3.445 2 3.993 2h16.014c.548 0 .993.446.993.998V11H3V2.998zM9 5v2h6V5H9zm0 11v2h6v-2H9z",
        fill: "#713f11"
      }
    ))
  ),
  envelope: import_react4.default.createElement(
    "svg",
    {
      width: "25",
      height: "25",
      viewBox: "0 0 100 100",
      xmlns: "http://www.w3.org/2000/svg",
      version: "1.1"
    },
    import_react4.default.createElement("g", { style: { stroke: "#333333", strokeWidth: "2" } }, import_react4.default.createElement("path", { style: { fill: "#ffc247" }, d: "m 3,16 94,0 0,68 -94,0 z" }), import_react4.default.createElement(
      "path",
      {
        style: { fill: "#ffe45c" },
        d: "m 4,16 34,33 c 7,7 15,7 23,0 L 96,16 z"
      }
    ), import_react4.default.createElement("path", { style: { fill: "none" }, d: "M 96,84 59,51 M 4,84 40,51" }))
  )
};
var fadeIn = (position) => h`
  0% { 
    opacity: 0; 
    transform: ${position.includes("top") ? "translateY(-200%) scale(0.8)" : "translateY(200%) scale(0.8)"};
  }
  100% { 
    opacity: 1; 
    transform: translateY(0) scale(1);
  }
`;
var fadeOut = (position) => h`
  0% { 
    opacity: 1; 
    transform: scale(1);
  }
  100% { 
    opacity: 0; 
    transform: ${position.includes("top") ? "translateY(-30%) scale(0.8)" : "translateY(30%) scale(0.8)"};
  }
`;
var ToastContainer = j("div")((props) => {
  const { isclosing, position, direction, style, type } = props;
  return `
      will-change: transform;
      animation: ${isclosing === "false" ? fadeIn(position) : fadeOut(position)} 0.35s ease-in-out;
      direction: ${direction};

      /* Using :where() to apply low specificity styles */
      :where(&) {
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        padding: 0.55rem 0.85rem;
        border-radius: 0.5rem;
        background-color: ${backgroundColors[type] || backgroundColors.custom};
        color: black;
        max-width: 50vw;
      }
        
      /* Mobile view (80vw) */
      @media (max-width: 768px) {
        max-width: 80vw;
      }
      ${style}
    `;
});
var FlexContainer = j("div")(
  () => `
    display: flex;
    align-items: center;
    justify-content: space-between;
  `
);
var FlexItems = j("div")(
  () => `
    display: flex;
    align-items: center;
    gap: 0.75rem;
  `
);
var ExpandedContent = j("div")(
  (props) => `
    color: black;
    overflow: hidden;
    transition: all 0.3s ease-in-out;
    max-height: ${props.isexpanded === "true" ? props.expandedheight : "0px"};
  `
);
var backgroundColors = {
  success: "#D1FAE5",
  error: "#FEE2E2",
  info: "#DBEAFE",
  custom: "#ffffff",
  warning: "#fff4b7",
  tip: "#ffffff"
};
var MessageContainer = j("div")`
  overflow: hidden;
  transition: max-height 0.35s ease-in-out, opacity 0.35s ease-in-out;
  ${({ type, fadeout }) => (type === "envelope" || type === "drawer") && `
      max-height: ${fadeout === "true" ? "0" : "500px"};
      opacity: ${fadeout === "true" ? "0" : "1"};
    `}
`;
var IconContainer = j("div")`
  overflow: hidden;
  transition: max-height 0.35s ease-in-out, opacity 0.35s ease-in-out;
  ${({ type, fadeout }) => (type === "envelope" || type === "drawer") && `
      max-height: ${fadeout === "true" ? "0" : "500px"};
      opacity: ${fadeout === "true" ? "0" : "1"};
    `}
`;
var CloseButton = j("button")(
  (props) => `
    ${props.position === "right" ? "left: -0.3rem;" : "right: -0.3rem;"}
    font-size: 0.6rem;
    position: absolute;
    top: -0.3rem;
    width: 1.1rem;
    height: 1.1rem;
    border-radius: 50%;
    border: 1px solid #ddd;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    z-index: 9999;
    transition: transform 0.2s ease, background-color 0.2s ease;
    background-color: #ffffff;
    color: #000;
    
    &:hover {
      background-color: #f0f0f0;
      transform: scale(1.1);
    }
  `
);
var Toast = import_react3.default.memo(
  ({
    id,
    message,
    type = "custom",
    position = "bottom-center",
    isCloseBtn = false,
    onClose,
    icon,
    className,
    style,
    iconStyle,
    expandedContent,
    onExpand,
    isClosing,
    expandedClassName,
    closeBtnStyle,
    toastTypeTheming = {},
    isPausedOnHover = true,
    direction = "ltr",
    aria
    // Expected to be an object like { role: 'status', 'label': 'Custom notification' }
  }) => {
    var _a, _b, _c, _d;
    const [isExpanded, setIsExpanded] = (0, import_react3.useState)(false);
    const expandedContentRef = (0, import_react3.useRef)(null);
    const [fadeOutMessage, setFadeOutMessage] = (0, import_react3.useState)(false);
    const handleClick = (e) => {
      if (e.target.closest("button") || e.target.closest("[data-action]"))
        return;
      if (expandedContent) {
        if (type === "envelope") {
          if (!isExpanded) {
            setFadeOutMessage(true);
            setTimeout(() => {
              setIsExpanded(true);
              onExpand(true);
            }, 150);
            onExpandToast(id);
          }
        } else if (type === "drawer") {
          if (!isExpanded) {
            setFadeOutMessage((p) => !p);
            setTimeout(() => {
              setIsExpanded((p) => !p);
              onExpand(!isExpanded);
            }, 150);
          } else {
            setIsExpanded((p) => !p);
            onExpand(!isExpanded);
            setFadeOutMessage(!isExpanded);
          }
          onExpandToast(id);
        } else {
          if (!isExpanded) onExpandToast(id);
          setIsExpanded((prev) => !prev);
          onExpand(!isExpanded);
        }
      }
    };
    const handleMouseEnter = () => {
      if (isPausedOnHover) {
        pauseToastTimer(id);
      }
    };
    const handleMouseLeave = () => {
      if (isPausedOnHover) {
        resumeToastTimer(id);
      }
    };
    const toastFunctions = {
      update: (updates) => updateToast(id, updates),
      remove: () => removeToast(id),
      removeAll: () => removeAllToast()
    };
    const expandedHeight = ((_a = expandedContentRef.current) == null ? void 0 : _a.scrollHeight) + "px";
    const typeThemeStyle = ((_b = toastTypeTheming[type]) == null ? void 0 : _b.style) || {};
    const typeThemeClass = `${((_c = toastTypeTheming[type]) == null ? void 0 : _c.className) || ""}`;
    icon = ((_d = toastTypeTheming[type]) == null ? void 0 : _d.icon) || icon || defaultIcons[type];
    const defaultAriaProps = {
      role: "alert",
      label: "Notification"
    };
    const ariaProps = __spreadValues(__spreadValues({}, defaultAriaProps), aria);
    return import_react3.default.createElement(
      ToastContainer,
      __spreadValues({
        onClick: handleClick,
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
        className: `toast-container-default-${id} ${className} ${typeThemeClass}`,
        type,
        position,
        isclosing: isClosing.toString(),
        direction,
        style: __spreadValues(__spreadValues({}, style), typeThemeStyle)
      }, ariaProps),
      typeof message === "function" ? import_react3.default.createElement(import_react3.default.Fragment, null, message(toastFunctions)) : import_react3.default.createElement(FlexContainer, null, import_react3.default.createElement(FlexItems, null, import_react3.default.createElement(
        IconContainer,
        {
          type,
          fadeout: fadeOutMessage.toString(),
          style: __spreadValues({ flexShrink: 0 }, iconStyle)
        },
        icon
      ), import_react3.default.createElement(MessageContainer, { type, fadeout: fadeOutMessage.toString() }, message)), isCloseBtn && import_react3.default.createElement(
        CloseButton,
        {
          onClick: onClose,
          position: position.includes("right") ? "right" : "left",
          style: closeBtnStyle
        },
        "✕"
      )),
      expandedContent && import_react3.default.createElement(
        ExpandedContent,
        {
          ref: expandedContentRef,
          isexpanded: isExpanded.toString(),
          expandedheight: expandedHeight,
          className: expandedClassName
        },
        expandedContent
      )
    );
  }
);
var toast_component_default = Toast;
var DEFAULT_POSITION = "bottom-center";
var DEFAULT_DURATION = 3e3;
var DEFAULT_SPACING = 0;
var DEFAULT_DIRECTION = "ltr";
var DEFAULT_IS_PAUSED_ON_HOVER = true;
var DEFAULT_TOAST_TYPE_THEMING = {};
var DEFAULT_ARIA = void 0;
var ToastContainer2 = ({
  toastTypeTheming = DEFAULT_TOAST_TYPE_THEMING,
  spacing = DEFAULT_SPACING,
  position = DEFAULT_POSITION,
  duration = DEFAULT_DURATION,
  direction = DEFAULT_DIRECTION,
  isPausedOnHover = DEFAULT_IS_PAUSED_ON_HOVER,
  aria = DEFAULT_ARIA
}) => {
  setToastDefaults(duration, position);
  const [toasts, setToasts] = (0, import_react2.useState)([]);
  const [isExpansion, setIsExpansion] = (0, import_react2.useState)(false);
  const [enableTransition, setEnableTransition] = (0, import_react2.useState)(true);
  const [toastHeights, setToastHeights] = (0, import_react2.useState)({});
  const toastRefs = (0, import_react2.useRef)({});
  const updateToastHeights = () => {
    const newHeights = {};
    Object.keys(toastRefs.current).forEach((id) => {
      const el = toastRefs.current[id];
      if (el) {
        newHeights[id] = el.offsetHeight;
      }
    });
    setToastHeights(newHeights);
  };
  (0, import_react2.useEffect)(() => {
    const unsubscribe = subscribeToToasts(setToasts);
    return () => unsubscribe();
  }, []);
  (0, import_react2.useEffect)(() => {
    const resizeObserver = new ResizeObserver(() => {
      updateToastHeights();
    });
    Object.values(toastRefs.current).forEach((el) => {
      if (el) resizeObserver.observe(el);
    });
    return () => {
      resizeObserver.disconnect();
    };
  }, [toasts]);
  (0, import_react2.useEffect)(() => {
    if (!isExpansion) {
      const timeout = setTimeout(() => {
        setEnableTransition(true);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [isExpansion]);
  const calculatePositions = (positionToasts, isBottom, spacing2) => {
    let cumulativeHeight = 0;
    const positions = isBottom ? [...positionToasts].reverse() : positionToasts;
    return positions.map((toast2) => {
      const height = toastHeights[toast2.id] || 80;
      const positionValue = isBottom ? cumulativeHeight : cumulativeHeight;
      cumulativeHeight += height + (spacing2 || 8);
      return { id: toast2.id, positionValue };
    });
  };
  const positionStyles = {
    "top-left": {
      top: "1rem",
      left: "1rem",
      display: "flex",
      justifyContent: "start",
      alignItems: "start"
    },
    "top-center": {
      top: "1rem",
      left: "50%",
      transform: "translateX(-50%)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    },
    "top-right": {
      top: "1rem",
      right: "1rem",
      display: "flex",
      justifyContent: "end",
      alignItems: "start"
    },
    "bottom-left": {
      bottom: "1rem",
      left: "1rem",
      display: "flex",
      justifyContent: "start",
      alignItems: "end"
    },
    "bottom-center": {
      bottom: "1rem",
      left: "50%",
      transform: "translateX(-50%)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    },
    "bottom-right": {
      bottom: "1rem",
      right: "1rem",
      display: "flex",
      justifyContent: "end",
      alignItems: "end"
    }
  };
  return import_react2.default.createElement(import_react2.default.Fragment, null, Object.entries(positionStyles).map(([pos, style]) => {
    const isBottom = pos.includes("bottom");
    const positionToasts = toasts.filter((toast2) => toast2.position === pos);
    const toastPositions = calculatePositions(
      positionToasts,
      isBottom,
      spacing
    );
    return import_react2.default.createElement("div", { key: pos, style: __spreadProps(__spreadValues({}, style), { position: "fixed", zIndex: 9999 }) }, toastPositions.map(({ id, positionValue }) => import_react2.default.createElement(
      "div",
      {
        key: id,
        ref: (el) => toastRefs.current[id] = el,
        style: {
          marginBottom: "0.5rem",
          top: isBottom ? void 0 : `${positionValue}px`,
          bottom: isBottom ? `${positionValue}px` : void 0,
          position: "absolute",
          width: "max-content",
          transition: enableTransition ? "all 0.2s ease-in-out" : void 0
        }
      },
      import_react2.default.createElement(
        toast_component_default,
        __spreadProps(__spreadValues({}, toasts.find((toast2) => toast2.id === id)), {
          direction,
          toastTypeTheming,
          isPausedOnHover,
          onClose: () => {
            removeToast(id);
          },
          aria,
          onExpand: (isExpanded) => {
            setIsExpansion(isExpanded);
            if (isExpanded) {
              setEnableTransition(false);
              setTimeout(() => {
                setEnableTransition(true);
              }, 300);
            } else {
              setEnableTransition(false);
            }
          }
        })
      )
    )));
  }));
};
var toast = Object.assign(
  (message, options) => {
    return addToast(__spreadProps(__spreadValues({}, options), { message, type: "custom" }));
  },
  {
    success: (message, options) => addToast(__spreadProps(__spreadValues({}, options), { message, type: "success" })),
    error: (message, options) => addToast(__spreadProps(__spreadValues({}, options), { message, type: "error" })),
    info: (message, options) => addToast(__spreadProps(__spreadValues({}, options), { message, type: "info" })),
    envelope: (message, options) => addToast(__spreadProps(__spreadValues({}, options), { message, type: "envelope" })),
    drawer: (message, options) => addToast(__spreadProps(__spreadValues({}, options), { message, type: "drawer" })),
    warning: (message, options) => addToast(__spreadProps(__spreadValues({}, options), { message, type: "warning" })),
    custom: (message, options) => addToast(__spreadProps(__spreadValues({}, options), { message, type: "custom" })),
    remove: (id) => removeToast(id),
    removeAll: () => removeAllToast(),
    update: (id, updates) => updateToast(id, updates),
    pause: (id) => pauseToastTimer(id),
    remainingTime: (id) => getRemainingTimeForToast(id),
    resume: (id) => resumeToastTimer(id),
    promise: (promise, {
      loading,
      success,
      error,
      position,
      toastOptions = {}
    }) => {
      const loadingToastId = addToast(__spreadProps(__spreadValues({
        message: loading,
        type: "promise",
        position
      }, toastOptions), {
        duration: Infinity
        // Ensure loading toast doesn't disappear
      }));
      return promise.then((result) => {
        var _a;
        updateToast(loadingToastId, {
          message: success,
          type: "success",
          duration: (_a = toastOptions.duration) != null ? _a : 3e3
          // Use toastOptions.duration
        });
        return result;
      }).catch((catchErr) => {
        var _a;
        updateToast(loadingToastId, {
          message: error,
          type: "error",
          duration: (_a = toastOptions.duration) != null ? _a : 3e3
          // Use toastOptions.duration
        });
        return catchErr;
      });
    }
  }
);
m(import_react.createElement);
export {
  ToastContainer2 as ToastContainer,
  toast
};
//# sourceMappingURL=react-fox-toast.js.map
