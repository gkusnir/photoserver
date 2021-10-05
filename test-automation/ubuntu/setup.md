# Setup of an Ubuntu server for testing automation

This document describes how to set up a server with Ubuntu installed to serve as a 
- Docker server
- Jenkins automation server
- Puppeteer web UI testing server
- Nginx reverse proxy with
- Certbot with Let's Encrypt certificates

## Two Factor Authentication

To provide state of the art security on remote machine with ssh exposed on the internet we install Two Factor Auth with Google-Authenticator. 

There is a script to automate this task `2fa-setup.sh`.
