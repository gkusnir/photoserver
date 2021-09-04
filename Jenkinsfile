pipeline {
    agent any
    stages {
        stage('UITest') {
            steps {
                sh '''
                    echo "Testing UI with Puppeteer"

                    wdir=/media/data/projects/gkusnir/photoserver

                    # turn on virtualenv
                    cd $wdir/symlinks/.virtualenvs
                    . nodejs/bin/activate

                    # turn on puppeteer
                    cd $wdir/symlinks/.nodeenvs
                    . puppeteer/bin/activate

                    # run test
                    node $wdir/puppeteer/example.js


                '''
            }
        }
    }
}
