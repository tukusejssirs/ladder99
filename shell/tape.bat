:: tape - a nodejs app to play/record mqtt messages.
:: first param is folder relative to current directory.
:: specify play/record as parameter, eg
::     shell/tape models/ccs-pa/tape
::     shell/tape tape -m record -h host.docker.internal

:: if [ -z "$1" ]; then echo "Error: folder required as first argument"; exit 1; fi

:: get first param then remove it from $* array
set HOST_FOLDER=%1
shift

:: build docker image for tape
docker build --tag tape services/tape

:: run the docker image as a container
:: -it is for interactive terminal
:: --init passes ctrl-c to node
:: --rm removes the container when it's done
:: --volume links a host folder to a folder inside the container.
:: tape will write to the container folder,
:: and it'll be visible in the host folder.
:: $* passes remaining params to the tape node app.
set CONTAINER_FOLDER=c:\temp\tape
docker run --name tape -it --init --rm -p 1883:1883 ^
  --volume "%cd%"\%HOST_FOLDER%:%CONTAINER_FOLDER% ^
  tape --folder %CONTAINER_FOLDER% %*
