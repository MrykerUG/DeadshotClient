const { contextBridge, ipcRenderer } = require('electron');
const $ = (selector) => document.querySelector(selector);

const genSetting = (type, details) => {
	let element = document.createElement('template');
	switch (type) {
		case 'spacer': {
			element.innerHTML = `<div class="bar"></div>`;
			break;
		}
		case 'info': {
			element.innerHTML = `
			<div class="setting toggle" style="margin-top: 14px; margin-bottom: 14px;">
			<p style="font-size: 22px; margin-top: 2px;/* visibility: hidden; */">${details.text}</p>
			<label style="visibility: hidden;">
			<input class="checkbox" type="checkbox">
			<span></span></label></div>`;
			break;
		}
		case 'toggle': {
			element.innerHTML = `
			<div class="setting toggle" style="margin-top: 14px; margin-bottom: 14px;">
			<p style="font-size: 18px; margin-top: 2px;/* visibility: hidden; */">${details.text}</p>
			<label><input id=${details.id} checked class="checkbox" type="checkbox">
			<span></span></label></div>`;
			break;
		}
	}
	return element.content;
}

const updateSetting = (id, type) => {
	if (localStorage.getItem(id) && localStorage.getItem(id) !== null && typeof localStorage.getItem(id) !== 'undefined' && localStorage.getItem(id) !== '') {
		let elem = $(`#${id}`);
		switch (type) {
			case 'input':
				elem.value = JSON.parse(localStorage.getItem(id));
				break;
			case 'checkbox':
				elem.checked = JSON.parse(localStorage.getItem(id));
				break;
			default:
				elem.value = JSON.parse(localStorage.getItem(id));
				break;
		}
	}
}
const addSetting = (id, type, cb = () => { }) => {
	let elem = $(`#${id}`);

	elem.onchange = () => {
		cb();
		switch (type) {
			case 'input':
				localStorage.setItem(id, elem.value);
				break;
			case 'checkbox':
				localStorage.setItem(id, elem.checked);
				break;
			default:
				localStorage.setItem(id, elem.value);
				break;
		}
	}
}

let path = require('path');
window.onload = () => {
	addEventListener("message", e => {
		let data = JSON.parse(e.data);
		if (Array.isArray(data) && data.length == 4) {
			ipcRenderer.invoke('rpcData', { data, presence: $('#enablePresence').checked, rich: $('#enableRichPresence').checked });
		}
	});
	setInterval(() => {
		window.postMessage(JSON.stringify({ type: "gimmerich" }))
	}, 1000);

	let fpsCounter = document.createElement('p');
	fpsCounter.textContent = 'X FPS';
	fpsCounter.classList.add('fpsCounter');

	document.body.appendChild(fpsCounter);

	let settings = $('#settingsDiv');

	let link = document.createElement('link');
	link.setAttribute('rel', 'stylesheet');
	link.setAttribute('href', path.join(__dirname, 'extra.css'));
	document.head.appendChild(link);

	settings.addEventListener('wheel', (e) => {
		settings.scrollBy(0, e.deltaY);
	});

	let gameSettingsInfo = genSetting('info', { text: 'Game Settings: ' });
	settings.insertBefore(gameSettingsInfo, settings.firstChild);
	let clientSettingsInfo = genSetting('info', { text: 'Client Settings: ' });
	settings.append(genSetting('spacer'), clientSettingsInfo);
	let presenceEnabled = genSetting('toggle', { text: 'Enable discord presence', id: 'enablePresence' });
	settings.append(genSetting('spacer'), presenceEnabled);
	let presenceRichEnabled = genSetting('toggle', { text: 'Enable discord rich presence', id: 'enableRichPresence' });
	settings.append(genSetting('spacer'), presenceRichEnabled);
	let fpsDisplayEnabled = genSetting('toggle', { text: 'Enable FPS display', id: 'enableFpsDisplay' });
	settings.append(genSetting('spacer'), fpsDisplayEnabled);
	updateSetting('enablePresence', 'checkbox');
	updateSetting('enableRichPresence', 'checkbox');
	updateSetting('enableFpsDisplay', 'checkbox');
	addSetting('enablePresence', 'checkbox');
	addSetting('enableRichPresence', 'checkbox');
	addSetting('enableFpsDisplay', 'checkbox', () => {
		if ($('#enableFpsDisplay').checked) {
			fpsCounter.style.display = 'block';
		} else {
			fpsCounter.style.display = 'none';
		}
	});

	$('#enableFpsDisplay').onchange();

	const times = [];
	function refreshLoop() {
		window.requestAnimationFrame(() => {
			const now = performance.now();
			while (times.length > 0 && times[0] <= now - 1000) {
				times.shift();
			}
			times.push(now);
			fpsCounter.textContent = `${times.length} FPS`;
			refreshLoop();
		});
	}
	refreshLoop();
}
