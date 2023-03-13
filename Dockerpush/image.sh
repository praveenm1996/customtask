#!/bin/bash

echo "praveen"
flag=$4
echo $flag;
docker login $3 -u $1 -p $2
pwd
if [ $flag = "build" ]
then
echo "inside the if loop"
pwd
docker build -f Dockerfile -t learnacrmp.azurecr.io/basicapp2 .
fi
if [ $flag =  "push" ]
then
docker push learnacrmp.azurecr.io/basicapp2
fi
docker logout

