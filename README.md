# WhaTicket

A _very simple_ Ticket System based on WhatsApp messages.

Backend uses [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js) to receive and send WhatsApp messages, create tickets from them and store all in a MySQL database.

Frontend is a full-featured multi-user _chat app_ bootstrapped with react-create-app and Material UI, that comunicates with backend using REST API and Websockets. It allows you to interact with contacts, tickets, send and receive WhatsApp messagees.

**NOTE**: I can't guarantee you will not be blocked by using this method, although it has worked for me. WhatsApp does not allow bots or unofficial clients on their platform, so this shouldn't be considered totally safe.

## Motivation

I'm a SysAdmin, and in my daily work, I do a lot of support through WhatsApp. Since WhatsApp Web doesn't allow multiple users, and 90% of our tickets comes from this channel, we created this to share same whatsapp account cross our team.

## How it works?

On every new message received in an associated WhatsApp, a new Ticket is created. Then, this ticket can be reached in a _queue_ on _Tickets_ page, where you can assign ticket to your yourself by _aceppting_ it, respond ticket messagee and eventually _resolve_ it.

Subsequent messages from same contact will be related to first **open/pending** ticket found.

If a contact sent a new message in less than 2 hours interval, and there is no ticket from this contact with **pending/open** status, the newest **closed** ticket will be reopen, instead of creating a new one.

## Screenshots

<img src="https://raw.githubusercontent.com/canove/whaticket/master/images/chat2.png" width="350"> <img src="https://raw.githubusercontent.com/canove/whaticket/master/images/chat3.png" width="350">

## Installation and Usage (Linux Debian/Ubuntu)

Create Mysql Database using docker:
_Note_: change dbname, username password.

```bash
docker run --name whaticketdb -e MYSQL_ROOT_PASSWORD=strongpassword -e MYSQL_DATABASE=whaticket -e MYSQL_USER=whaticket -e MYSQL_PASSWORD=whaticket --restart always -p 3306:3306 -d mariadb:latest --character-set-server=utf8mb4 --collation-server=utf8mb4_bin
```

Install puppeteer dependencies:

```bash
sudo apt-get install -y libgbm-dev wget unzip fontconfig locales gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils
```

- Clone this repo
- On backend folder:
  - Copy .env.example to .env and fill it with database details
  - Install dependecies: `npm install` (Only in the first time)
  - Create database tables: `npx sequelize db:migrate` (Only in the first time)
  - Start backend: `npm start`
- In another terminal, on frontend folder:
  - Copy .env.example to .env and fill it with backend URL (normally localhost:port)
  - Install dependecies: `npm install` (Only in the first time)
  - Start frontend: `npm start`
- Go to http://your_server_ip:3000/signup
- Create an user and login with it.
- On the sidebard, go to _Connection_ and read QRCode with your WhatsApp.
- Done. Every message received by your synced WhatsApp number will appear in Tickets List.

## Basic production deployment (Ubuntu 18.04 VPS)

You need two subdomains forwarding to youts VPS ip to follow these instructions. We'll use `myapp.mydomain.com` and `api.mydomain.com` in examples.

Update all system packages:

```bash
apt update && apt upgrade
```

Install node and confirm node command is available:

```bash
curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v
npm -v
```

Install docker:

```bash
sudo apt install apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu bionic stable"
sudo apt update
sudo apt install docker-ce
sudo systemctl status docker
```

Add current user to docker group:

```bash
sudo usermod -aG docker \${USER}
su - \${USER}
```

Create database container (Instructions in installation)

Clone this repository:

```bash
git clone https://github.com/canove/whaticket whaticket
```

Create the backend .env file and fill with database details:

```bash
cp whaticket/backend/.env.example whaticket/backend/.env
nano whaticket/backend/.env
```

Install puppeteer dependencies(Instructions in installation)

Install backend dependencies and run migrations:

```bash
cd whaticket/backend
npm install
npx sequelize db:migrate
```

Start backend to confirm its working, you should see: `Server started on port...` on console.

Install pm2 **with sudo**:

```bash
sudo npm install -g pm2
```

Start backend with pm2:

```bash
pm2 start src/app.js --name whaticket-backend
```

Make pm2 auto start afeter reboot:

```bash
pm2 startup ubuntu -u YOUR_USERNAME
```

Copy the last line outputed from previus command and run it, its something like:

```bash
sudo env PATH=\$PATH:/usr/bin pm2 startup ubuntu -u YOUR_USERNAME --hp /home/YOUR_USERNAM
```

Now, lets prepare frontend:

```bash
cd ../whaticket/frontend
npm install
```

Edit .env file and fill it with your backend address, it should look like this:

```bash
REACT_APP_BACKEND_URL = https://api.mydomain.com/
```

Build frontend app:

```bash
npm run build
```

Start frotend with pm2:

```bash
pm2 start server.js --name whaticket-frontend
```

Save pm2 process list to start automatically after reboot:

```bash
pm2 save
```

Install nginx:

```bash
sudo apt install nginx
```

Remove nginx default site:

```bash
sudo rm /etc/nginx/sites-enabled/default
sudo service nginx restart
```

Create a new nginx site to frontend app:

```bash
sudo nano /etc/nginx/sites-available/whaticket-frontend
```

Edit and fill it with this information, changing `server_name` to yours equivalent to `myapp.mydomain.com`:

```bash
server {
  server_name myapp.mydomain.com;

  location / {
    proxy_pass http://127.0.0.1:3333;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_cache_bypass $http_upgrade;
  }
}
```

Create another one to backend api, changing `server_name` to yours equivalent to `api.mydomain.com`, and `proxy_pass` to you localhost backend node server URL:

```bash
sudo cp /etc/nginx/sites-available/whaticket-frontend /etc/nginx/sites-available/whaticket-backend
sudo nano /etc/nginx/sites-available/whaticket-backend
```

```bash
server {
  server_name api.mydomain.com;

  location / {
    proxy_pass http://127.0.0.1:8080;
    ......
}
```

Create a symbolic link to enalbe nginx site:

```bash
sudo ln -s /etc/nginx/sites-available/whaticket-frontend /etc/nginx/sites-enabled
sudo ln -s /etc/nginx/sites-available/whaticket-backend /etc/nginx/sites-enabled
```

Test nginx configuration and restart server:

```bash
sudo nginx -t
sudo service nginx restart
```

Now, enable SSL (https) on your sites to use all app features like notifications and sending audio messages. A easy way to this is using Certbot:

Install certbor with snapd:

```bash
sudo snap install --classic certbot
```

Enable SSL on nginx (Accept all information asked):

```bash
sudo certbot --nginx
```

## Demo

**Note**: It's not a good idea to sync your whatsapp account is this demo enviroment, because all your received messages will be stored in database and will be accessible by everyone that access this URL and creates an account.

If you want to test it, do it with a dummy whatsapp number and delete all tickets and contacts after your tests.

https://whaticket.economicros.com.br/

## Features

- Have multiple users chating in same WhatsApp Number ✅
- Create and chat with new contacts without touching cellphone ✅
- Send and receive message ✅
- Send media (images/audio/documents) ✅
- Receive media (images/audio/video/documents) ✅

## Contributing

Any help and suggestions are welcome!

## Disclaimer

I just started leaning Javascript a few months ago and this is my first project. It may have security issues and many bugs. I recommend using it only on local network.

This project is not affiliated, associated, authorized, endorsed by, or in any way officially connected with WhatsApp or any of its subsidiaries or its affiliates. The official WhatsApp website can be found at https://whatsapp.com. "WhatsApp" as well as related names, marks, emblems and images are registered trademarks of their respective owners.
