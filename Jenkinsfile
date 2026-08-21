pipeline{
    agent any

    environment{
        CONTAINER_NAME = "nestjs-app"
        IMAGE_NAME = "nestjs-image"
        EMAIL ="bobbybhanumahankali@gmail.com"
        PORT = "3000"
    }

    stages{
        stages('Clone Repo'){
            steps{
                git branch: 'main',url:'https://github.com/mahankalibhanubabu/full-CICD.git'
            }
        }
        stages('Build Docker Image'){
            steps{
                sh 'docker build -t $IMAGE_NAME'
            }
        }
        stages('Stop & Remove Previous container'){
            steps{
                sh '''
                    docker stop $CONTAINER_NAME || true
                    docker rm $CONTAINER_NAME || true
                '''
            }
        }
        stages('Docker container Run'){
            steps{
                sh '''
                    docker run -d -p ${PORT}:${PORT}
                    --name $CONTAINER_NAME $IMAGE_NAME
                '''
            }
        }
        stages('Send email notifcation'){
            steps{
                emailtext(
                    subject: "Nestjs App Deployed Successfully on EC2!",
                    body: "Your Nest JS App is deployed !
                    here is he link : http://18.61.84.31:${PORT}/",
                    to:"${EMAIL}"
                )
            }
        }
    }
}