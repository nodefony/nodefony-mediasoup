#!/usr/bin/env bash


npx nodefony sequelize:sync force

npx nodefony users:fixtures:default

npx nodefony fixtures:load mediasoup room

npx nodefony fixtures:load calendar calendar

npx nodefony fixtures:load calendar events
