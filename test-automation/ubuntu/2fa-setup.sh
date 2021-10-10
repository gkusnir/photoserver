#! /bin/bash

echo "Installing 2FA with Google Authenticator PAM module"

# check if root
if [[ "$EUID" -ne 0 ]]; then
    echo "You must be root (sudo) to run this script."
    exit 1
fi

EXGROUP=no2fa
COPYUSER=copyuser
COPYUSERPASS=$1

# check password exists
...

# install 
apt install -y libpam-google-authenticator

# add exception group
groupadd $EXGROUP

# add copyuser to enable file copy automation
useradd $COPYUSER
usermod -a -G $EXGROUP $COPYUSER

# set copyuser password

# modify /etc/pam.d/sshd

# modify /etc/ssh/sshd_config

# run and config google-authenticator

# restart sshd service
systemctl restart sshd.service

# install docker 
# enable docker and container services

# handle github secret

