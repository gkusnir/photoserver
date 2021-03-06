# Photoserver
Home server for storing photos and other types of documents

## Continuous Delivery
I decided to follow some rules for enabling the power of continuous development principles as described in [Continuous Delivery Pipelines by Dave Farley](https://www.amazon.com/dp/B096YGZVZ9). So here are some steps to set up things to make the CD work

### Version Control
Version control in use is git provided by GitHub.

### UI Testing
For UI testing I chose Puppeteer. To install it I followed [https://developers.google.com/web/tools/puppeteer/get-started](https://developers.google.com/web/tools/puppeteer/get-started).

I am using python virtualenvs and virtualenvwrapper on my computer and there is a possibility to create virtual environment for nodejs and then run nodeenv, a virtual environment for nodejs in that virtualenv. To start working in those virtual environments run

`workon nodejs`

then create a new nodeenv by

`nodeenv puppeteer`

activate it by

`. puppeteer/bin/activate`

then cd to that directory

`cd puppeteer`

install puppeteer following the get-started page

`npm i puppeteer`

finally run some puppeteer test like the 'example.js'

`node example.js`

For this file the require must be set to see the puppeteer package or the file should be copied to ..nodeenv/puppeteer folder and `require('puppeteer');` should work.

To run puppeteer from anywhere (outside virtualenv) a special shell script must be used. There is the 'run-puppeteer.sh' in the puppeteer folder to use as a basic idea.

### Build Management System
I chose [Jenkins](https://www.jenkins.io/) as automation server based on some tips from Dave Farley's book. For now I installed it on my local machine to have access to other parts of CD pipeline.

Later I worked on automating the test environment setup as described in the article [How To Automate Jenkins Setup with Docker and Jenkins Configuration as Code](https://www.digitalocean.com/community/tutorials/how-to-automate-jenkins-setup-with-docker-and-jenkins-configuration-as-code). The build command is `docker build -t jenkins:jcasc .`. Unfortunately the docker build command did not work for some permission issues. 

The solution was to set up a docker in docker ([Docker in Docker](https://itnext.io/docker-in-docker-521958d34efd)). After starting docker in docker with `docker run -ti --rm -v /var/run/docker.sock:/var/run/docker.sock -v /absolute/path/to/jcasc-folder:/jcasc docker` the above build command worked.

To run the just created jenkins:jcasc docker image use the os and not the docker-in-docker: `docker run --name jenkins --rm -p 8080:8080 jenkins:jcasc`. To mount external jenkins_home folder use `docker run -v /media/data/projects/gkusnir/photoserver/jenkins_home:/var/jenkins_home --name jenkins --rm -p 8080:8080 jenkins:jcasc`. This way the jenkins_home folder can be backed up after the container is stopped and even removed.

To be able to force Jenkins to use specific language in UI, there is the [`Locale`](https://plugins.jenkins.io/locale/) plugin. Unfortunately there is, or at least I did not find, a possibility to use config-as-code to set up this plugin. To be able to inject the configuration I copied the `locale.xml` file from a manually set up Jenkins instance and in the `Dockerfile` there is the line

```dockerfile
COPY locale.xml /var/jenkins_home/locale.xml
```
so Jenkins gets this at startup. To be sure that there is no conflict with a future version of this plugin, in the `plugins.txt` the Locale plugin has a version specified

```txt
locale:1.4
```


#### GitHub OAuth

To set up GitHub OAuth authentification add `github-oauth:latest` to `plugins.txt`. Then add the config to `casc.yaml` file. Replace securityRealm

```yaml
  securityRealm:
    github:
      clientID: "xxxxxxxxxxx"
      clientSecret: "xxxxxxxxxxxxx"
      githubApiUri: "https://api.github.com"
      githubWebUri: "https://github.com"
      oauthScopes: "read:org,user:email,repo"
```

Set at least one user to be able to log in

```yaml
  authorizationStrategy:
    globalMatrix:
      permissions:
        - "Overall/Administer:githubusername"
```

On GitHub you must create an OAuth Application [https://github.com/settings/developers](https://github.com/settings/developers). Here comes the `clientID` and `clientSecret` from which is used above. Set the name, the Jenkins instance homepage, this can be also on a private network or even the localhost (e.g. `http://127.0.0.1:8080/`). The callback url is something like `http://127.0.0.1:8080/securityRealm/finishLogin`. The private part comes from the Jenkins GitHub OAuth Plugin.

## GitLab
I tried to run gitlab in docker to try it out. After trying I decided not to use it and go with public or private github repositories with jenkins as automation, puppeteer as ui testing and other testing as needed all integrated in one or more customized docker images.




