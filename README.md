# saberhub

![bootstrap v4.2.1](https://img.shields.io/badge/Bootstrap%204-v4.2.1-blue.svg) ![vue.js v2.6.2](https://img.shields.io/badge/vue.js-v2.6.2-blue.svg)

**saberhub** is a landing page template for Beat Saber multiplayer hub from [multiplayer mod](https://github.com/andruzzzhka/BeatSaberMultiplayer).


### Usage

* Clone or copy this repository inside your web server folder

* Open `index.html` and edit hub settings at the end of file

```javascript
// Hub settings
hubApp.host = "<hub hostname>"; // Hub hostname
hubApp.port = "<hub port>"; // Hub port
hubApp.ws = "<hub websocket address>"; // Hub websocket
hubApp.wss = "<hub secure websocket address>"; // Hub secure websocket
```

* Do same thing inside `clear.html` if you plan to use room clear view

```javascript
// Hub settings
roomApp.host = "<hub hostname>"; // Hub hostname
roomApp.port = "<hub port>"; // Hub port
roomApp.ws = "<hub websocket address>"; // Hub websocket
roomApp.wss = "<hub secure websocket address>"; // Hub secure websocket
```


### Additionals settings

```javascript
hubApp.refreshEvery = 15000; // Interval in ms between two room details refresh
```

```javascript
hubApp.enableClearview = false; // Disable clear view link display
```


### Using HTTPS with Websocket on Apache

If you want to use HTTPS with this landing page you will need to upgrade websocket to websocket secure using a reverse proxy.

* Enable Apache `proxy` and `proxy_wstunnel` mods.

* In your Apache virtual host file of your hub add this following lines

```
ProxyRequests Off
ProxyPass /wss ws://<host>:<port>
```

* Use url `wss://<host>/wss` for connecting to websocket server


Example of virtual host file for websocket host hub.pawz.xyz on port 3800

```
<IfModule mod_ssl.c>
<VirtualHost *:443>
	ServerName hub.pawz.xyz
	ServerAdmin contact@pawz.xyz
	DocumentRoot /var/www/hub

	<Directory "/var/www/hub">
		Options -Indexes +FollowSymLinks
		AllowOverride All
		Require all granted
	</Directory>

	ErrorLog ${APACHE_LOG_DIR}/error.log
	CustomLog ${APACHE_LOG_DIR}/access.log combined

	SSLCertificateFile /dir/fullchain.pem
	SSLCertificateKeyFile /dir/privkey.pem
	Include /etc/letsencrypt/options-ssl-apache.conf

	ProxyRequests Off
	ProxyPass /wss ws://hub.pawz.xyz:3800
</VirtualHost>
</IfModule>
```

Websocket secure url for hub.pawz.xyz is `wss://hub.pawz.xyz/wss`


### Using HTTPS with Websocket on NGINX

* Look example on [HubStatistics landing page](https://github.com/beat-saber-modding-group/HubStatistics)


### License

MIT License
