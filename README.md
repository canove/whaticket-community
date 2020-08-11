# WhaTicket

A _very simple_ Ticket System based on WhatsApp messages.

Backend uses [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js) to receive and send WhatsApp messages, create tickets from them and store all in a MySQL database.

The frontend is a full-featured _chat app_ bootstrapped with react-create-app and Material UI, that comunicates with backend using REST API and Websockets.

## Motivation

I'm a SysAdmin, and in my daily work, I do a lot of support through WhatsApp. Since WhatsApp Web doesn't allow multiple users, and 90% of our tickets comes from this channel, we created this to avoid the: 'Can I use Whatsapp now?' shoulder taps.

## How it works?

On every new message received in an associated WhatsApp, a new Ticket is created with **pending** status. Then, this ticket can be reached in frontend, where you can assign ticket to your yourself by _aceppting_ it (changing the status to **open**), respond ticket and eventually _resolve_ it (changing status to **closed**).

Subsequent messages from same contact will be related to first **open/pending** ticket found.

If a contact sent a new message in less than 2 hours, and there is no ticket from this contact with **pending/open** status, the newest **closed** ticket will be reopen, instead of creating a new one.

## Installation and Usage (Linux)

### Create database

Using docker, run:

```bash
docker run --name whaticketdb -e MYSQL_ROOT_PASSWORD=strongpassword -e MYSQL_DATABASE=whaticket -e MYSQL_USER=whaticket -e MYSQL_PASSWORD=whaticket --restart always -p 3306:3306 -d mariadb:latest --character-set-server=utf8mb4 --collation-server=utf8mb4_bin
```

_Note_: change dbname, username password.

- Clone this repo
- Install all dependencies with yarn or npm
- On backend folder, copy .env.example to .env and fill it with database details
- On frontend folder, copy .env.example to .env and fill it with backend URL

- Start backend `cd backend && yarn start`
- Start frontend `cd ../frontend && yarn start`
- Goto http://localhost:3000/signup
- Create an user and login with it.
- In navigation menu, go to "Whatsapp" >> Connection and read QRCode with your whatsapp.
- Go to Whatsapp >> Chat.
- Send a text message to yout synced whatsapp number and start testing.

## Features

Have multiple users chating in same WhatsApp Number ✅

Create and chat with new contacts without touching cellphone ✅

Send and receive message ✅

Send media (images/audio/documents) ✅

Receive media (images/audio/video/documents) ✅

## Links

- [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js)

## Contributing

Any help and suggestions are welcome!

## Disclaimer

I just started leaning Javascript a few months ago and this is my first project. It may have security issues and many bugs. I recommend using it only on local network.

This project is not affiliated, associated, authorized, endorsed by, or in any way officially connected with WhatsApp or any of its subsidiaries or its affiliates. The official WhatsApp website can be found at https://whatsapp.com. "WhatsApp" as well as related names, marks, emblems and images are registered trademarks of their respective owners.
