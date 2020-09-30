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
Here are two configuration files: config.docker and config.docker2
> config.docker
```
clientSip 0.2

[TIMER]
t1=500
t2=4000

[CHANNEL]
number=1

[CODEC]
numberAudio=4
numberVideo=0
numberImage=0
fmtpValues=0-15
idCodecEvent=-1


[CHANNEL 0]
active=1
fpp=2
inumber=default
number=1000
login=1000
name=\n
password=1000
frequencyPercent=95
expires=3416
registerRetry=60
registrar=172.17.0.1
line=2
sendNumber=#
inoRegister=1
idCodecFallback=9
noSubscribe=1
idCodecAudio=8 18
dscpRTP=42
dscpProto=24
ignoreMwi=1

[NUMBERING]
regExpVOIP=^01[[:digit:]]{8}|^02[[:digit:]]{8}|^03[[:digit:]]{8}|^04[[:digit:]]{8}|^05[[:digit:]]{8}|^06[[:digit:]]{8}|^07[[:digit:]]{8}|^08[[:digit:]]{8}|^09[[:digit:]]{8}|^10[[:digit:]]{2}|^30[[:digit:]]{2}|^3131|^32[[:digit:]]{2}|^34[[:digit:]]{2}|^35[[:digit:]]{2}|^36[[:digit:]]{2}|^37[[:digit:]]{2}|^38[[:digit:]]|^39[[:digit:]]{2}
regExpPSTN=z
iregExpAuthorized=^12$


[CODEC_AUDIO 0]
idCodec=18
payload=a=rtpmap:18 G729/8000

[CODEC_AUDIO 1]
idCodec=8
payload=a=rtpmap:8 PCMA/8000

[CODEC_AUDIO 2]
idCodec=0
payload=a=rtpmap:0 PCMU/8000

[CODEC_AUDIO 3]
idCodec=9
payload=a=rtpmap:9 FTPS/8000


[GENERAL]
fifo=/tmp/fifo_clientSip
strictAddress=1
strictSSRC=1
packetChanging=1
strictProxy=0
noSubscribeRegister=0
proxy=127.0.0.1
iproxySRV=_sip._udp.example.com
portProxy=5066
port=6050
interface=docker0
portRTPMin=35500
portRTPMax=35599
maxActiveChannel=1
noUnregister=1
rtcp=1

[IDENTIFICATION]
userAgent=Config pour sipp

[DEBUG]
debugFunction=1
debugError=1
debugWarning=1
debugInformation=1
debugFlood=0
debugPid=0
debugDate=0

debugDspFunction=1
debugDspError=1
debugDspWarning=1
debugDspInformation=1
debugDspFlood=0

debugMMIFunction=1
debugMMIError=1
debugMMIWarning=1
debugMMIInformation=1
debugMMIFlood=0

debugStateFunction=1
debugStateError=1
debugStateWarning=1
debugStateInformation=1
debugStateFlood=0

debugDate=1

debugFilePid=/tmp/pidClientSip
```

> config.docker2
```
clientSip 0.2

[TIMER]
t1=500
t2=4000

[CHANNEL]
number=1

[CODEC]
numberAudio=4
numberVideo=0
numberImage=0
fmtpValues=0-15
idCodecEvent=-1


[CHANNEL 0]
active=1
fpp=2
inumber=default
number=1001
login=1002
name=\n
password=1000
frequencyPercent=95
expires=3416
registerRetry=60
registrar=172.17.0.1
line=2
sendNumber=#
inoRegister=1
idCodecFallback=9
noSubscribe=1
idCodecAudio=8 18
dscpRTP=42
dscpProto=24
ignoreMwi=1

[NUMBERING]
regExpVOIP=^01[[:digit:]]{8}|^02[[:digit:]]{8}|^03[[:digit:]]{8}|^04[[:digit:]]{8}|^05[[:digit:]]{8}|^06[[:digit:]]{8}|^07[[:digit:]]{8}|^08[[:digit:]]{8}|^09[[:digit:]]{8}|^10[[:digit:]]{2}|^30[[:digit:]]{2}|^3131|^32[[:digit:]]{2}|^34[[:digit:]]{2}|^35[[:digit:]]{2}|^36[[:digit:]]{2}|^37[[:digit:]]{2}|^38[[:digit:]]|^39[[:digit:]]{2}
regExpPSTN=z
iregExpAuthorized=^12$


[CODEC_AUDIO 0]
idCodec=18
payload=a=rtpmap:18 G729/8000

[CODEC_AUDIO 1]
idCodec=8
payload=a=rtpmap:8 PCMA/8000

[CODEC_AUDIO 2]
idCodec=0
payload=a=rtpmap:0 PCMU/8000

[CODEC_AUDIO 3]
idCodec=9
payload=a=rtpmap:9 FTPS/8000


[GENERAL]
fifo=/tmp/fifo_clientSip
strictAddress=1
strictSSRC=1
packetChanging=1
strictProxy=0
noSubscribeRegister=0
proxy=127.0.0.1
iproxySRV=_sip._udp.example.com
portProxy=5066
port=6052
interface=docker0
portRTPMin=35500
portRTPMax=35599
maxActiveChannel=1
noUnregister=1
rtcp=1

[IDENTIFICATION]
userAgent=Config pour sipp

[DEBUG]
debugFunction=1
debugError=1
debugWarning=1
debugInformation=1
debugFlood=0
debugPid=0
debugDate=0

debugDspFunction=1
debugDspError=1
debugDspWarning=1
debugDspInformation=1
debugDspFlood=0

debugMMIFunction=1
debugMMIError=1
debugMMIWarning=1
debugMMIInformation=1
debugMMIFlood=0

debugStateFunction=1
debugStateError=1
debugStateWarning=1
debugStateInformation=1
debugStateFlood=0

debugDate=1

debugFilePid=/tmp/pidClientSip

```
