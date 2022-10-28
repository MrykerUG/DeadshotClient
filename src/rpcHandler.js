let RPC = require('discord-rpc');
let startTimestamp = Date.now();

const clientId = '1016740004187357214';
const rpc = new RPC.Client({ transport: 'ipc' });

let activity = {
	details: 'Loading client',
	largeImageKey: 'logo-big',
	startTimestamp,
	buttons: [{ label: 'Download', url: 'https://github.com/FeeshDev/DeadshotClient/releases/latest' }]
}

const updateActivity = details => {
	let { presence, rich, data } = details;
	let [time, mode, map, ingame] = data;
	//console.log(map)
	activity.enabled = presence;

	if (presence) {
		if (rich) {
			if (ingame) {
				let [minutes, seconds] = time.split(':');
				let totalSeconds = parseInt(minutes) * 60 + parseInt(seconds);

				activity.details = `Playing ${mode} on ${map}`;
				activity.state = 'In game';
				activity.endTimestamp = Date.now() + totalSeconds * 1000;
				activity.largeImageKey = map.toLowerCase();
				activity.largeImageText = `${mode} on ${map}`;
				activity.smallImageKey = undefined;
				activity.smallImageText = undefined;
			} else {
				activity.details = undefined;
				activity.state = 'In menu';
				activity.endTimestamp = undefined;
				activity.largeImageKey = 'logo-big';
				activity.largeImageText = 'What peculiar action is the dog partaking in?';
				activity.smallImageKey = 'logo-small';
				activity.smallImageText = 'Probably matchmaking...';
			}
		} else {
			activity.details = undefined;
			activity.state = undefined;
			activity.endTimestamp = undefined;
			activity.startTimestamp = startTimestamp;
			activity.largeImageKey = 'logo-big';
			activity.largeImageText = undefined;
			activity.smallImageKey = undefined;
			activity.smallImageText = undefined;
		}
	} else {
		rpc.clearActivity();
	}
}

const setActivity = () => {
	if (!activity.enabled) return;
	rpc.setActivity(activity);
}

rpc.on('ready', () => {
	setActivity();

	// activity can only be set every 15 seconds
	setInterval(() => {
		setActivity();
	}, 15000 / 3);
});

rpc.login({ clientId }).catch(console.error);

module.exports = { updateActivity }