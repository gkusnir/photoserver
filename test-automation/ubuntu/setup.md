# Setup of an Ubuntu server for testing automation

This document describes how to set up a server with Ubuntu installed to serve as a 
- Docker server
- Jenkins automation server
- Puppeteer web UI testing server
- Nginx reverse proxy with
- Certbot with Let's Encrypt certificates

## Docker

Follow this tutorial: https://docs.docker.com/engine/install/ubuntu/. 

For docker-compose follow this one: https://docs.docker.com/compose/install/.

## Two Factor Authentication

To provide state of the art security on remote machine with ssh exposed on the internet we install Two Factor Auth with Google-Authenticator and set key-based authentication.

There is a script to automate this task `2fa-setup.sh` on the server.

### Sources
- https://systemoverlord.com/2018/03/03/openssh-two-factor-authentication-but-not-service-accounts.html
- https://serverfault.com/questions/307407/ssh-allow-password-for-one-user-rest-only-allow-public-keys?newreg=fa2d42aa88bc47fa88b7d5ff7a27fee8
- http://linux-pam.org/Linux-PAM-html/sag-configuration-file.html
- https://serverfault.com/questions/629883/trying-to-get-ssh-with-public-key-no-password-google-authenticator-working-o
- https://blog.webnersolutions.com/google-authenticator-not-working-along-with-ssh-key-and-password/
- https://askubuntu.com/questions/147241/execute-sudo-without-password
- https://www.answertopia.com/ubuntu/configuring-ssh-key-based-authentication-on-ubuntu/
- https://www.opensourceforu.com/2019/04/using-google-authenticator-with-ssh-to-secure-your-servers/
- https://github.com/google/google-authenticator-libpam

### Config Files

#### /etc/ssh/sshd_config

```config
#	$OpenBSD: sshd_config,v 1.103 2018/04/09 20:41:22 tj Exp $

# This is the sshd server system-wide configuration file.  See
# sshd_config(5) for more information.

# This sshd was compiled with PATH=/usr/bin:/bin:/usr/sbin:/sbin

# The strategy used for options in the default sshd_config shipped with
# OpenSSH is to specify options with their default value where
# possible, but leave them commented.  Uncommented options override the
# default value.

Include /etc/ssh/sshd_config.d/*.conf

#Port 22
#AddressFamily any
#ListenAddress 0.0.0.0
#ListenAddress ::

#HostKey /etc/ssh/ssh_host_rsa_key
#HostKey /etc/ssh/ssh_host_ecdsa_key
#HostKey /etc/ssh/ssh_host_ed25519_key

# Ciphers and keying
#RekeyLimit default none

# Logging
#SyslogFacility AUTH
#LogLevel INFO

# Authentication:

#LoginGraceTime 2m
#PermitRootLogin prohibit-password
PermitRootLogin yes
#StrictModes yes
#MaxAuthTries 6
#MaxSessions 10

# Expect .ssh/authorized_keys2 to be disregarded by default in future.
#AuthorizedKeysFile	.ssh/authorized_keys .ssh/authorized_keys2

#AuthorizedPrincipalsFile none

#AuthorizedKeysCommand none
#AuthorizedKeysCommandUser nobody

# For this to work you will also need host keys in /etc/ssh/ssh_known_hosts
#HostbasedAuthentication no
# Change to yes if you don't trust ~/.ssh/known_hosts for
# HostbasedAuthentication
#IgnoreUserKnownHosts no
# Don't read the user's ~/.rhosts and ~/.shosts files
#IgnoreRhosts yes

# To disable tunneled clear text passwords, change to no here!
#PasswordAuthentication yes
#PermitEmptyPasswords no

# Change to yes to enable challenge-response passwords (beware issues with
# some PAM modules and threads)
ChallengeResponseAuthentication yes

# Kerberos options
#KerberosAuthentication no
#KerberosOrLocalPasswd yes
#KerberosTicketCleanup yes
#KerberosGetAFSToken no

# GSSAPI options
#GSSAPIAuthentication no
#GSSAPICleanupCredentials yes
#GSSAPIStrictAcceptorCheck yes
#GSSAPIKeyExchange no

# Set this to 'yes' to enable PAM authentication, account processing,
# and session processing. If this is enabled, PAM authentication will
# be allowed through the ChallengeResponseAuthentication and
# PasswordAuthentication.  Depending on your PAM configuration,
# PAM authentication via ChallengeResponseAuthentication may bypass
# the setting of "PermitRootLogin without-password".
# If you just want the PAM account and session checks to run without
# PAM authentication, then enable this but set PasswordAuthentication
# and ChallengeResponseAuthentication to 'no'.
UsePAM yes

#AllowAgentForwarding yes
#AllowTcpForwarding yes
#GatewayPorts no
X11Forwarding yes
#X11DisplayOffset 10
#X11UseLocalhost yes
#PermitTTY yes
PrintMotd no
#PrintLastLog yes
#TCPKeepAlive yes
#PermitUserEnvironment no
#Compression delayed
#ClientAliveInterval 0
#ClientAliveCountMax 3
#UseDNS no
#PidFile /var/run/sshd.pid
#MaxStartups 10:30:100
#PermitTunnel no
#ChrootDirectory none
#VersionAddendum none

# no default banner path
#Banner none

# Allow client to pass locale environment variables
AcceptEnv LANG LC_*

# override default of no subsystems
Subsystem sftp	/usr/lib/openssh/sftp-server

# Example of overriding settings on a per-user basis
#Match User anoncvs
#	X11Forwarding no
#	AllowTcpForwarding no
#	PermitTTY no
#	ForceCommand cvs server
#PasswordAuthentication no

UseDNS no

# allow no2fa group to sign in with password
Match Group no2fa
AuthenticationMethods password
PasswordAuthentication yes
PubkeyAuthentication no

Match all
AuthenticationMethods publickey,keyboard-interactive
PasswordAuthentication no
PubkeyAuthentication yes
```

#### /etc/pam.d/sshd

```config
# PAM configuration for the Secure Shell service

# exception from 2FA for a group
auth [success=1 default=ignore] pam_succeed_if.so user ingroup no2fa

# 2FA with Google auth
auth sufficient pam_google_authenticator.so

# Standard Un*x authentication.
@include common-auth

# Disallow non-root logins when /etc/nologin exists.
account    required     pam_nologin.so

# Uncomment and edit /etc/security/access.conf if you need to set complex
# access limits that are hard to express in sshd_config.
# account  required     pam_access.so

# Standard Un*x authorization.
@include common-account

# SELinux needs to be the first session rule.  This ensures that any
# lingering context has been cleared.  Without this it is possible that a
# module could execute code in the wrong domain.
session [success=ok ignore=ignore module_unknown=ignore default=bad]        pam_selinux.so close

# Set the loginuid process attribute.
session    required     pam_loginuid.so

# Create a new session keyring.
session    optional     pam_keyinit.so force revoke

# Standard Un*x session setup and teardown.
@include common-session

# Print the message of the day upon successful login.
# This includes a dynamically generated part from /run/motd.dynamic
# and a static (admin-editable) part from /etc/motd.
session    optional     pam_motd.so  motd=/run/motd.dynamic
session    optional     pam_motd.so noupdate

# Print the status of the user's mailbox upon successful login.
session    optional     pam_mail.so standard noenv # [1]

# Set up user limits from /etc/security/limits.conf.
session    required     pam_limits.so

# Read environment variables from /etc/environment and
# /etc/security/pam_env.conf.
session    required     pam_env.so # [1]
# In Debian 4.0 (etch), locale-related environment variables were moved to
# /etc/default/locale, so read that as well.
session    required     pam_env.so user_readenv=1 envfile=/etc/default/locale

# SELinux needs to intervene at login time to ensure that the process starts
# in the proper default security context.  Only sessions which are intended
# to run in the user's context should be run after this.
session [success=ok ignore=ignore module_unknown=ignore default=bad]        pam_selinux.so open

# Standard Un*x password updating.
@include common-password
```

## Jenkins with Nginx as reverse proxy in Docker

### Sources
- https://lukems.com/en/install-jenkins-and-nginx-with-docker-compose/

Localhost or 127.0.0.1 is not defined within container. Docker network defines hosts and the nginx reverse proxy muste refer to the jenkins server as 'jenkins' - the name of the service in docker compose.
