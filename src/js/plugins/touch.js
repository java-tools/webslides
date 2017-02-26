import MobileDetector from '../utils/mobile-detector';

const EVENTS = {
  touch: {
    START: 'touchstart',
    MOVE: 'touchmove',
    END: 'touchend'
  },
  pointer: {
    START: 'pointerdown',
    MOVE: 'pointermove',
    END: 'pointerup'
  }
};

const SLIDE_OFFSET = 50;

export default class Touch {
  /**
   * @param {WebSlides} wsInstance The WebSlides instance
   */
  constructor(wsInstance) {
    /**
     * @type {WebSlides}
     * @private
     */
    this.ws_ = wsInstance;

    /**
     * Start position for the X coord.
     * @type {number}
     * @private
     */
    this.startX_ = 0;

    /**
     * Start position for the Y coord.
     * @type {number}
     * @private
     */
    this.startY_ = 0;

    /**
     * Start position for the X coord.
     * @type {number}
     * @private
     */
    this.endX_ = 0;

    /**
     * Start position for the Y coord.
     * @type {number}
     * @private
     */
    this.endY_ = 0;

    /**
     * Whether is enabled or not. Only enabled for touch devices.
     * @type {boolean}
     * @private
     */
    this.isEnabled = false;

    let events;

    if (MobileDetector.isAny()) {
      // Likely IE
      if (window.PointerEvent && (
          MobileDetector.isWindows() || MobileDetector.isWindowsPhone())) {
        events = EVENTS.pointer;
      } else {
        events = EVENTS.touch;
      }

      this.isEnabled = true;
      document.addEventListener(events.START, this.onStart_.bind(this), false);
      document.addEventListener(events.MOVE, this.onMove_.bind(this), false);
      document.addEventListener(events.MOVE, this.onMove_.bind(this), false);
      document.addEventListener(events.END, this.onStop_.bind(this), false);
    }
  }

  /**
   * Start touch handler. Saves starting points.
   * @param event
   * @private
   */
  onStart_(event) {
    const info = Touch.normalizeEventInfo(event);

    this.startX_ = info.x;
    this.startY_ = info.y;
    this.endX_ = info.x;
    this.endY_ = info.y;
  }

  /**
   * Move touch handler. Saves end points.
   * @param event
   * @private
   */
  onMove_(event) {
    const info = Touch.normalizeEventInfo(event);

    this.endX_ = info.x;
    this.endY_ = info.y;
  }

  /**
   * Stop touch handler. Checks if it needs to make any actions.
   * @private
   */
  onStop_() {
    const diffX = this.startX_ - this.endX_;
    const diffY = this.startY_ - this.endY_;

    // It's an horizontal drag
    if (Math.abs(diffX) > Math.abs(diffY)) {
      if(diffX < -SLIDE_OFFSET) {
        this.ws_.goPrev();
      } else if(diffX > SLIDE_OFFSET) {
        this.ws_.goNext();
      }
    }
  }

  /**
   * Normalizes an event to deal with differences between PointerEvent and
   * TouchEvent.
   * @param event
   * @return {*}
   */
  static normalizeEventInfo(event) {
    let x;
    let y;
    let touchEvent = { pageX : 0, pageY : 0};

    if (typeof event.changedTouches !== 'undefined'){
      touchEvent = event.changedTouches[0];
    }
    else if (typeof event.originalEvent !== 'undefined' &&
        typeof event.originalEvent.changedTouches !== 'undefined'){
      touchEvent = event.originalEvent.changedTouches[0];
    }

    x = event.offsetX || event.layerX || touchEvent.pageX;
    y = event.offsetY || event.layerY || touchEvent.pageY;

    return { x, y };
  }
};
