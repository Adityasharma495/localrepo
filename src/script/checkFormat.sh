#!/bin/bash

path="/home/dev/cloud-telephony/backend/src/script/assets/voice/"
temppath="/home/dev/cloud-telephony/backend/src/script/temp/voice/"

# Create prompts directory if it doesn't exist
if [ ! -d "${path}${1}/prompts/" ]; then
    mkdir -p "${path}${1}/prompts/"
    chown -R www-data:www-data "${path}${1}/prompts/"
fi

# Check if the temp file exists
if [ -f "${temppath}${1}/prompts/${2}" ]; then
    format=$(soxi -t "${temppath}${1}/prompts/${2}")
    rate=$(soxi -r "${temppath}${1}/prompts/${2}")
    channels=$(soxi -c "${temppath}${1}/prompts/${2}")
    duration=$(soxi -D "${temppath}${1}/prompts/${2}")

    if [ "$format" = "wav" ]; then
        sox -t wav "${temppath}${1}/prompts/${2}" -b 16 -c 1 -r 8000 "${path}${1}/prompts/${2}"
        echo "$duration"
    elif [ "$format" = "mp3" ]; then
        sox -t mp3 "${temppath}${1}/prompts/${2}" -b 16 -c 1 -r 8000 -t wav "${path}${1}/prompts/${3}"
        echo "$duration"
    else
        echo "0"
    fi
else
    echo "0"
fi
