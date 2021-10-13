# Configuring agents with Docker

This is based on [Using Jenkins agents](https://www.jenkins.io/doc/book/using/using-agents/)

## Create agent in a remore machine docker in Ubuntu

### Create SSH Key

1. save a passphrase into a text file with descriptive name like `azure-docker-agent1-pass.txt`
2. generate key running `ssh-keygen -f azure-docker-agent1-key' and entering the saved passphrase

### Add Jenkins Credential

In Jenkins add credential of kind 'SSH Username with private key' in 'Global' scope with meaningful id like `azure-docker-agent1`.
Username will be `jenkins`, add the key and passprase and save it.

### Run Jenkins Agent Docker

On remote machine run jenkins agent in docker running 
```bash
sudo docker run --restart=always -d --name=agent1 -p 10022:22 -e "JENKINS_AGENT_SSH_PUBKEY=ssh-rsa AAAA...Z8aNs=" jenkins/ssh-agent:alpine
```
The `JENKINS_AGENT_SSH_PUBKEY` is the public part of the generated ssh key in file `azure-docker-agent1-key.pub`.

### Add Jenkins Agent in Jenkins Server

Must have used this hack [Jenkins ssh-node doesn't find Java](https://stackoverflow.com/a/57186137/5802615). So the `JavaPath` in agent advanced settings is set to `/opt/java/openjdk/bin/java`.

### Problems

- remote host key must be accepted manually when agent is connected
- swap file reported is 0B, the solution is
    - https://serverfault.com/questions/798817/jenkins-on-docker-free-swap-space-0
    - https://www.digitalocean.com/community/tutorials/how-to-add-swap-space-on-ubuntu-20-04

### CAsC or automated agent build

comparison of the casc plugin before agent and after agent config

## Remote Jenkins Agent on a Windows Machine

### Remote SSH Port Forwarding

[https://www.tecmint.com/create-ssh-tunneling-port-forwarding-in-linux/](https://www.tecmint.com/create-ssh-tunneling-port-forwarding-in-linux/)
[https://www.ssh.com/academy/ssh/tunneling/example](https://www.ssh.com/academy/ssh/tunneling/example)

Select a remote machine with public IP address. Set `/etc/ssh/sshd_config` to forward gateway ports by setting `GatewayPorts yes`.
Then restart sshd `sudo systemctl restart sshd`.

To set the connection just run `ssh -f -N admin@server1.example.com -R 5000:localhost:3000` with appropriate ports and user.

### Setting up Windows Agents

As described in [Jenkins Home Lab: Part 3 - Setting up Windows Agents](https://www.gdcorner.com/2019/12/30/JenkinsHomeLab-P3-WindowsAgents.html)

In Jenkins install PowerShell plugin. Add a permanent agent and fill values as described in the above link.

On the windows machine download the java open source version [https://jdk.java.net/17/](https://jdk.java.net/17/) for windows in zip. Unzip and copy to `c:\`. Add to `PATH` variable the path to `c:\java...\bin` as the first item in the `PATH`. 

Then in `c:\jenkins` create a `bat` file with the command from the agent details page in Jenkins server. Also download `agent.jar` from the link. Install [chocolatey](https://chocolatey.org/install), and nssm `choco install nssm`. Then create a service with 
```
nssm install JenkinsAgent C:\jenkins\JenkinsService.bat
nssm edit JenkinsAgent
```

In the nssm gui switch to `Log on` tab and select the `Virtual service account`. Then save with `Edit service` button. Start the service.


```
nssm start JenkinsAgent
```

Create a test job and run.



