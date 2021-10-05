# Set Up 2FA on Ubuntu in ssh

This is the description from [https://ubuntu.com/tutorials/configure-ssh-2fa#2-installing-and-configuring-required-packages](https://ubuntu.com/tutorials/configure-ssh-2fa#2-installing-and-configuring-required-packages.)

## Installing and configuring required packages

### Installing the Google Authenticator PAM module

Start a terminal session and type:

```bash
sudo apt install libpam-google-authenticator
```

### Configuring SSH

To make SSH use the Google Authenticator PAM module, add the following line to the /etc/pam.d/sshd file:

```
auth required pam_google_authenticator.so
```

Modify /etc/ssh/sshd_config – change ChallengeResponseAuthentication from no to yes, so this part of the file looks like this:

```
# Change to yes to enable challenge-response passwords (beware issues with
# some PAM modules and threads)
ChallengeResponseAuthentication yes

# Change to no to disable tunnelled clear text passwords
PasswordAuthentication no
```

## Configuring authentication

Google Authenticator makes the configuration of two-factor authentication much easier, comparing to (for example) libpam-oath.

In a terminal, run the `google-authenticator` command.

It will ask you a series of questions, here is a recommended configuration:

```
Make tokens “time-base””: yes
Update the .google_authenticator file: yes
Disallow multiple uses: yes
Increase the original generation time limit: no
Enable rate-limiting: yes
```

You may have noticed the giant QR code that appeared during the process, underneath are your emergency scratch codes to be used if you don’t have access to your phone: write them down on paper and keep them in a safe place.

Now you need to restart the sshd daemon using:

```
sudo systemctl restart sshd.service
```

That’s all. Now, let’s open Google Authenticator and add our secret key to make it work.

## Exception from 2FA for certain group

The description comes from [https://askubuntu.com/questions/819110/google-authenticator-for-certain-users](https://askubuntu.com/questions/819110/google-authenticator-for-certain-users).

Create a user group on the Linux instance. MFA/PAM will be disabled for users present in this new group

```bash
sudo groupadd <groupname>
```

Create User or add existing user to newly created group

```bash
sudo useradd <username>
sudo usermod -a -G <groupname> <username>
```

Edit `/etc/pam.d/sshd` file and add the below statement to skip PAM module for the newly created group, but this must come before the google authenticator line

```config
auth [success=done default=ignore] pam_succeed_if.so user ingroup <groupname>
```

Then restart the sshd daemon again:

```
sudo systemctl restart sshd.service
```
