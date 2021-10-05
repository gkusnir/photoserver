#! /bin/sh

echo Installing 2FA with Google Authenticator PAM module

# check if root
if [[ "$EUID" -ne 0 ]]; then
    echo "You must be root (sudo) to run this script."
    exit 1
fi

# install 
#sudo apt install libpam-google-authenticator

echo Tou are there