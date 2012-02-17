const St = imports.gi.St;
const UiPopupMenu = imports.ui.popupMenu;
const Lang = imports.lang;

function PopupProgressMenuItem() {
    this._init.apply(this, arguments);
}

PopupProgressMenuItem.prototype = {
    __proto__: UiPopupMenu.PopupBaseMenuItem.prototype,

    _init: function(value) {
        UiPopupMenu.PopupBaseMenuItem.prototype._init.call(this, { activate: false, reactive: false });

        if (isNaN(value))
            throw TypeError('The progress bar value must be a number');

        this._value = Math.max(Math.min(value, 1), 0);

        this._progress = new St.DrawingArea({ style_class: 'popup-slider-menu-item', reactive: false });
        this.addActor(this._progress, { span: -1, expand: true });
        this._progress.connect('repaint', Lang.bind(this, this._progressRepaint));

        this._releaseId = this._motionId = 0;
    },

    setValue: function(value) {
        if (isNaN(value))
            throw TypeError('The progress bar value must be a number');

        this._value = Math.max(Math.min(value, 1), 0);
        this._progress.queue_repaint();
    },

    _progressRepaint: function(area) {
        let cr = area.get_context();
        let themeNode = area.get_theme_node();
        let [width, height] = area.get_surface_size();

        let handleRadius = themeNode.get_length('-slider-handle-radius');

        let sliderWidth = width - 2 * handleRadius;
        let sliderHeight = themeNode.get_length('-slider-height');

        let sliderBorderWidth = themeNode.get_length('-slider-border-width');

        let sliderBorderColor = themeNode.get_color('-slider-border-color');
        let sliderColor = themeNode.get_color('-slider-background-color');

        let sliderActiveBorderColor = themeNode.get_color('-slider-active-border-color');
        let sliderActiveColor = themeNode.get_color('-slider-active-background-color');

        cr.setSourceRGBA (
            sliderActiveColor.red / 255,
            sliderActiveColor.green / 255,
            sliderActiveColor.blue / 255,
            sliderActiveColor.alpha / 255);
        cr.rectangle(handleRadius, (height - sliderHeight) / 2, sliderWidth * this._value, sliderHeight);
        cr.fillPreserve();
        cr.setSourceRGBA (
            sliderActiveBorderColor.red / 255,
            sliderActiveBorderColor.green / 255,
            sliderActiveBorderColor.blue / 255,
            sliderActiveBorderColor.alpha / 255);
        cr.setLineWidth(sliderBorderWidth);
        cr.stroke();

        cr.setSourceRGBA (
            sliderColor.red / 255,
            sliderColor.green / 255,
            sliderColor.blue / 255,
            sliderColor.alpha / 255);
        cr.rectangle(handleRadius + sliderWidth * this._value, (height - sliderHeight) / 2, sliderWidth * (1 - this._value), sliderHeight);
        cr.fillPreserve();
        cr.setSourceRGBA (
            sliderBorderColor.red / 255,
            sliderBorderColor.green / 255,
            sliderBorderColor.blue / 255,
            sliderBorderColor.alpha / 255);
        cr.setLineWidth(sliderBorderWidth);
        cr.stroke();
    },

    get value() {
        return this._value;
    }
};

function PopupQuotaMenuItem (props) {
    this._init(props);
}

PopupQuotaMenuItem.prototype = {
    __proto__: UiPopupMenu.PopupMenuSection.prototype,

    _init: function(props) {
        UiPopupMenu.PopupMenuSection.prototype._init.call(this);

        this._max = props.max;
        this._unit = props.unit;
        this._textual = new St.Label({ text: '' });
        this._progress = new PopupProgressMenuItem(0);

        let label = new UiPopupMenu.PopupMenuItem(_(props.label), { reactive: false });
        label.addActor(this._textual, { align: St.Align.END });
        
        this.addMenuItem(label);
        this.addMenuItem(this._progress);

        this.setValue(props.value);
    },

    setValue: function(value) {
        let ratio;
        let text;

        this._value = value;
        
        if (this._value == -1) {
            text = 'Unlimited';
            //this._progress.hide();
        } else {
            ratio = this._value / this._max;
            text = this._value + " " + this._unit + " (" + Math.round(ratio * 100) + "%)";
            //this._progress.show();
        }

        this._progress.setValue(ratio);
        this._textual.text = text;
    },

    get value() {
        return this._value;
    }
};
