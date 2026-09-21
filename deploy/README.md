# Clean-server deployment

Target: Ubuntu/Debian VPS, PostgreSQL, Node.js 22.12+, Nginx and systemd. Replace `example.com` and `cms.example.com` everywhere before the first release.

## 1. Bootstrap once

Install Node.js, PostgreSQL, Nginx, Certbot, Git and `rsync`. Create the runtime account and directories:

```sh
sudo useradd --system --create-home --shell /bin/bash unlim
sudo install -d -o unlim -g unlim -m 755 /srv/unlim
sudo install -d -o unlim -g unlim -m 700 /srv/unlim/releases /srv/unlim/shared /srv/unlim/shared/media /srv/backups/unlim
sudo -u postgres createuser --pwprompt unlim
sudo -u postgres createdb --owner=unlim unlim
```

Clone each release into `/srv/unlim/releases/<release-id>` (or upload an archive there). Never copy local `.env`, `.next`, `dist`, `node_modules` or runtime `media`.

Create production configuration:

```sh
sudo cp deploy/env.production.example /srv/unlim/shared/.env.production
sudo chown unlim:unlim /srv/unlim/shared/.env.production
sudo chmod 600 /srv/unlim/shared/.env.production
sudoedit /srv/unlim/shared/.env.production
```

Generate independent secrets with `openssl rand -hex 32`. Keep PostgreSQL, Payload, preview, analytics and notification secrets different.

Install services and timers once:

```sh
sudo cp deploy/unlim-cms.service deploy/unlim-web.service deploy/unlim-analytics.service deploy/unlim-analytics.timer deploy/unlim-backup.service deploy/unlim-backup.timer /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable unlim-cms.service unlim-web.service unlim-analytics.timer unlim-backup.timer
```

Copy `deploy/nginx.conf.example` to `/etc/nginx/sites-available/unlim`, replace domains, let Certbot add certificate paths, then enable and validate it:

```sh
sudo ln -s /etc/nginx/sites-available/unlim /etc/nginx/sites-enabled/unlim
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d example.com -d www.example.com -d cms.example.com
```

The example enables gzip for HTML-adjacent text assets (CSS, JavaScript, JSON and SVG); keep it enabled so the roughly 108 KB raw shared stylesheet transfers at about 21 KB before protocol overhead.

Expose only SSH, HTTP and HTTPS in the firewall. Ports `3000`, `4321` and PostgreSQL stay bound to loopback/private interfaces.

## 2. First release

From the uploaded release directory:

```sh
sudo -u unlim FIRST_DEPLOY=1 RUN_BACKUP=0 ./deploy/release.sh
sudo systemctl restart unlim-cms.service unlim-web.service
```

The script validates env placeholders, installs locked dependencies, typechecks, builds both apps, applies Payload migrations, runs the idempotent seed, creates the configured owner account, links shared media and starts both services.

## 3. Later releases

```sh
sudo -u unlim ./deploy/release.sh
sudo systemctl restart unlim-cms.service unlim-web.service
```

An existing installation is backed up before migrations. The release becomes current only after dependency installation, checks, builds and migrations succeed.

## 4. Verification

```sh
systemctl --no-pager --full status unlim-cms unlim-web
systemctl list-timers 'unlim-*'
journalctl -u unlim-cms -u unlim-web -n 200 --no-pager
curl -fsS https://cms.example.com/api/public/homepage >/dev/null
curl -fsS https://example.com/ >/dev/null
curl -fsS https://example.com/robots.txt
```

Verify `/urp-panel`, preview, media upload, one test lead, Telegram/VK delivery, sitemap, backup creation and restore procedure before announcing launch.

## 5. Restore drill

Practice on a disposable database before production. A backup contains `database.dump`, `media/`, `production.env` and `release.txt`.

```sh
mkdir /tmp/unlim-restore
tar -xzf /srv/backups/unlim/unlim-backup-latest.tar.gz -C /tmp/unlim-restore
sudo systemctl stop unlim-web unlim-cms
PGPASSWORD='database-password' pg_restore --clean --if-exists --no-owner --dbname=unlim /tmp/unlim-restore/database.dump
rsync -a --delete /tmp/unlim-restore/media/ /srv/unlim/shared/media/
sudo chown -R unlim:unlim /srv/unlim/shared/media
sudo systemctl start unlim-cms unlim-web
```

Restore `production.env` only when the active environment file was lost; inspect it and set mode `600` before restarting services.

## Manual runtime fallback

When systemd is unavailable, source `/srv/unlim/shared/.env.production`, then run:

```sh
cd /srv/unlim/current/apps/cms && NODE_ENV=production PORT=3000 npm run start
cd /srv/unlim/current && NODE_ENV=production HOST=127.0.0.1 PORT=4321 node apps/web/dist/server/entry.mjs
```

## Local phone preview

For a phone on the same Wi‑Fi, bind both dev servers to all interfaces and project browser-facing media/forms through the web same-origin proxy. Replace `192.168.1.20` with the computer's LAN address:

```sh
cd apps/cms
PUBLIC_CMS_URL=http://192.168.1.20:3000 \
PUBLIC_CONTENT_URL=http://192.168.1.20:4321 \
PUBLIC_WEB_URL=http://192.168.1.20:4321 \
LEAD_ALLOWED_ORIGINS=http://192.168.1.20:4321 \
ANALYTICS_ALLOWED_ORIGINS=http://192.168.1.20:4321 \
npm run dev -- --hostname 0.0.0.0

cd apps/web
CMS_URL=http://127.0.0.1:3000 \
CMS_PROXY_URL=http://127.0.0.1:3000 \
PUBLIC_SITE_URL=http://192.168.1.20:4321 \
npx astro dev --host 0.0.0.0 --force
```

Open `http://192.168.1.20:4321` on the phone. Only the web port is needed for pages, media, analytics and lead forms. Allow incoming Node.js connections in the computer firewall and disable Wi‑Fi client isolation if the router enables it.
