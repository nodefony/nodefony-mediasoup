# Build and Use Asterisk under Docker

## Build Docker
```bash
$ cd docker/asterisk
$ docker build --tag asterisk:1.0 .
```

## Dockerfile
```Dockerfile
FROM debian:buster
MAINTAINER Medix Corporation <olivier.castillo@sfr.com>

ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update \
    && apt-get install -y \
        build-essential \
        openssl \
        libxml2-dev \
        libncurses5-dev \
        uuid-dev \
        sqlite3 \
        libsqlite3-dev \
        pkg-config \
        libjansson-dev \
        libssl-dev \
        curl \
        libedit-dev \
        msmtp \
        libsrtp2-1 \
        libsrtp2-dev \
        apt-utils \
        libssl-dev

# Asterisk expects /usr/sbin/sendmail
RUN ln -s /usr/bin/msmtp /usr/sbin/sendmail

ENV ASTERISK_VERSION 17-current
RUN cd /tmp && curl -o asterisk.tar.gz http://downloads.asterisk.org/pub/telephony/asterisk/asterisk-${ASTERISK_VERSION}.tar.gz \
    && tar xf asterisk.tar.gz

RUN cd /tmp/asterisk* \
    && ./configure --with-pjproject-bundled --with-crypto --with-ssl \
    && make \
    && make install \
    && make samples \
    && make config

CMD asterisk -fvvv
```
## Use Docker container
```bash
$ docker run -d -p 127.0.0.1:5066:5062/udp -p 127.0.0.1:8090:8089/tcp -p 127.0.0.1:10000-10010:10000-10010/udp  --name asterisk -v $(pwd)/conf:/etc/asterisk asterisk:1.0
```
  Asterisk run on the local machine, on port 5066 (in the docker, it runs on port 5062). The websocket (in https) listens on port 8090 (8089 in the image of the docker). All the configuration is in the conf / directory if there is a need to change things. Ten RTP ports are open (from 10,000 to 10010).

## Stop Docker container
```
$ docker container stop asterisk
$ docker rm -f asterisk
```

## Access to the container shell
For debugging, you can access the container shell with the following command:
```
$ docker exec -it  asterisk bash
```
## Usable SIP Accounts

The configuration provided allows the use of 4 accounts. Two are classic accounts (1000 and 1002) and two are websocket accounts (1001 and 1003).
Here are configuration file : pjsip.conf
> docker/asterisk/conf/pjsip.conf
```
;===============TRANSPORT

[system-tcp]
type=transport
protocol=tcp
bind=0.0.0.0:5060

[system-tls]
type=transport
protocol=tls
bind=0.0.0.0:5061
cert_file=certificate

[simpletrans]
type=transport
protocol=udp
bind=0.0.0.0:5062

[transport-wss]
type=transport
protocol=wss
bind=0.0.0.0

;===============ENDPOINT TEMPLATES

[endpoint-basic](!)
type=endpoint
context=internal
;disallow=all
allow=alaw,vp8

[auth-userpass](!)
type=auth
auth_type=userpass

[aor-single-reg](!)
type=aor
max_contacts=42

;===============EXTENSION 1000

[1000](endpoint-basic)
auth=auth1000
aors=1000

[auth1000](auth-userpass)
username=1000
password=1000

[1000](aor-single-reg)

;===============EXTENSION 1001

[1001](endpoint-basic)
;auth=auth1001
aors=1001
webrtc=yes

[auth1001](auth-userpass)
password=1001
username=1001

[1001](aor-single-reg)

;===============EXTENSION 1002

[1002](endpoint-basic)
auth=auth1002
aors=1002

[auth1002](auth-userpass)
password=1002
username=1002

[1002](aor-single-reg)

;===============EXTENSION 1003

[1003](endpoint-basic)
;auth=auth1003
aors=1003
webrtc=yes

[auth1003](auth-userpass)
password=1234
username=1003

[1003](aor-single-reg)
```
