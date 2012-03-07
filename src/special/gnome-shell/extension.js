const Gio           = imports.gi.Gio;
const GLib          = imports.gi.GLib;
const St            = imports.gi.St;
const Lang          = imports.lang;
const Mainloop      = imports.mainloop;
const KotNet        = imports.ui.extensionSystem.extensions["kotnet@dennisdegryse.be"];
const Main          = imports.ui.main;
const PanelMenu     = imports.ui.panelMenu;
const PopupMenu     = imports.ui.popupMenu;
const KPopupMenu    = KotNet.popupMenu;
const KConf         = KotNet.conf;

let _indicator;
let _extensionMeta;
let _conf;

function Indicator(extensionMeta, conf) {
    this._init.apply(this, arguments);
}

Indicator.prototype = {
    __proto__: PanelMenu.Button.prototype,

    _init: function(extensionMeta, conf) {
        PanelMenu.Button.prototype._init.call(this, St.Align.START);

        this._conf = conf;
        this._conf.loadInto(this);

        this._extensionMeta = extensionMeta;
        this._quotaFile = this._extensionMeta.path + '/data/quota';
        this._icon = new St.Icon({ style_class: 'system-status-icon' });
        this._status = null;

        // MESSAGE
        this._message = new PopupMenu.PopupMenuItem(_('Loading...'), { reactive: false });

        // QUOTAS
        this._quotas = new PopupMenu.PopupMenuSection();

        this._downloadQuota = new KPopupMenu.PopupQuotaMenuItem({ 
            label: "Download:",
            value: 0,
            max: 10000,
            unit: "MB"});
        this._quotas.addMenuItem(this._downloadQuota);

        this._uploadQuota = new KPopupMenu.PopupQuotaMenuItem({ 
            label: "Upload:",
            value: 0,
            max: 1024,
            unit: "MB"});
        this._quotas.addMenuItem(this._uploadQuota);

        // CREDENTIALS
        let credentials = new PopupMenu.PopupSubMenuMenuItem('Options');

        let item = new PopupMenu.PopupMenuItem(_('User ID:'), { reactive: false });
        this._uid = new St.Entry({
            text: this._credentialsUid,
            style_class: 'kotnet-entry',
            can_focus: true});
        this._uid.clutter_text.connect('text-changed', Lang.bind(this, function () {
            this._credentialsUid = this._uid.text;
            this._conf.saveFrom(this);
        }));
        item.addActor(this._uid, { align: St.Align.END });
        credentials.menu.addMenuItem(item);

        item = new PopupMenu.PopupMenuItem(_('Password:'), { reactive: false });
        this._pwd = new St.Entry({
            text: this._credentialsPwd,
            style_class: 'kotnet-entry',
            can_focus: true});
        this._pwd.clutter_text.set_password_char('\u25cf');
        this._pwd.clutter_text.connect('text-changed', Lang.bind(this, function () {
            this._credentialsPwd = this._pwd.text;
            this._conf.saveFrom(this);
        }));
        item.addActor(this._pwd, { align: St.Align.END });
        credentials.menu.addMenuItem(item);

        this.menu.addMenuItem(this._message);
        this.menu.addMenuItem(this._quotas);
        this.menu.addMenuItem(credentials);
        this.actor.add_actor(this._icon);

        this._setStatus(false);
        this._startDaemon();
    },

    _setStatus: function(connected) {
        let icon = connected ? 'connected' : 'disconnected';

        if (connected == this._status)
            return;

        if (connected) {
            this._message.actor.hide(); 
            this._quotas.actor.show();
        } else {
            this._message.actor.show();
            this._quotas.actor.hide();
        }

        this._status = connected;
        this._icon.gicon = Gio.icon_new_for_string(this._extensionMeta.path + '/icons/ext-kotnet-' + icon + '.svg');
    },

    _setConnected: function(dlQuota, ulQuota) {
        this._downloadQuota.setValue(dlQuota);
        this._uploadQuota.setValue(ulQuota);

        this._setStatus(true);
    },

    _setDisconnected: function(errorMessage) {
        this._message.label.text = "Unable to connect: " + errorMessage + ".\nPlease check your connection and credentials.";

        this._setStatus(false);
    },

    _startDaemon: function() {
        GLib.timeout_add_seconds(0, 2, Lang.bind(this, function() {
            let command = [this._extensionMeta.path + '/bin/inspectquota', this._credentialsUid, this._credentialsPwd, this._quotaFile];

            global.log('Starting daemon...');

            if (this._credentialsUid == '' || this._credentialsPwd == '') {
                this._setDisconnected('incomplete configuraton');
                // reschedule for a retry
                return true;
            }

            try {
                if (GLib.file_test(this._quotaFile, 1<<4))
                    GLib.unlink(this._extensionMeta.path + '/data/quota');

                GLib.spawn_async(null, command, null, 0, null);
            } catch (e) {
                global.log(e.toString());
            }

            this._readQuota();

            // daemon started
            return false;
        }));
    },

    _readQuota: function() {
        global.log('Starting quota reader...');

        GLib.timeout_add_seconds(0, 10, Lang.bind(this, function() {
            let response = "UNKNOWN";
        
            if (GLib.file_test(this._quotaFile, 1<<4))
                response = GLib.file_get_contents(this._quotaFile)[1].toString();
            
            response = response.split(' ');

            switch (response[0]) {
            case 'OK':
                this._setConnected(response[1], response[2]);
                break;

            case 'ERR':
                let message = [];

                for (let i = 2; i < response.length; i++)
                    message.push(response[i]);

                this._setDisconnected(message.join(' '));
                this._startDaemon();
                return false;

            case 'UNKOWN':
                this._setDisconnected("Loading...");
                break;
            }

            // reschedule for next read
            return true;
        }));
    }
};

function init(extensionMeta) {
    _extensionMeta = extensionMeta;
    _conf = new KConf.Conf({
        version: '0.1',
        dir: '/gnome-shell-kotnet',
        file: '/gnome-shell-kotnet.json',
        options: [
            ["_credentialsUid", "credentials", "uid", ''],
            ["_credentialsPwd", "credentials", "pwd", '']]
    });
}

function enable() {
    if (_indicator == null) {
        _indicator = new Indicator(_extensionMeta, _conf);
        Main.panel.addToStatusArea('kotnet', _indicator);
    }
}

function disable() {
    if (_indicator != null) {
        _indicator.destroy();
        _indicator = null;
    }
}
