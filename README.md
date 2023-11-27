# Azure React Continuos Speech Recognition

This demo is an extension of the ![Speech_Recognition_Azure](https://github.com/DavidNavarroSaiz/Speech_Recognition_Azure) project, implemented using the React framework. It also incorporates Named Entity Recognition (NER) to extract various entities from recognized speech, such as names, addresses, dates, and more.
Results were good, but the analytics that can be extracted using NER of Azure are limited and other entities mustbe trained.



## How to run 
- you have to install the packages so in the speech_recognition_app folder runthe comman:
`npm install`

then create a .env file and copy paste the following variables:



```
REACT_APP_SUBSCRIPTION_KEY=""
REACT_APP_SERVICE_REGION=""
REACT_APP_AZURE_LANGUAGE_ENDPOINT = ""
REACT_APP_AZURE_LANGUAGE_KEY = ""
```

in each variable set the corresponding key:

REACT_APP_SUBSCRIPTION_KEY and REACT_APP_SERVICE_REGION are related with the speech recognition and the speech to text modules of azure.[azure portal](https://portal.azure.com/)

REACT_APP_AZURE_LANGUAGE_ENDPOINT and REACT_APP_AZURE_LANGUAGE_KEY are related with the NER(Named entity recognition) solution of Azure.


'npm start' Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.



## What you will find:

in the `./scr/app.js` file you will find 5 important functions:

### startRecognition():

is the function that get access to the microphone and start the speech recognition, this function is divided in 4 events that are related with the recognizer engine.

speechRecognizer.recognizing : displays in realtime what is the engine recognizing from the speech

speechRecognizer.recognized: when the user makes a pause in the speechit will take that pause as the beggining of a new phrase, so it will start again a new phrase and will separate the phrases by period(. ) at the moment that the user makes a pause the recognized event will be triggered

speechRecognizer.canceled: if the speech recognition fails or is it canceled then this event is activated.

speechRecognizer.sessionStopped: if it is used the command speechRecognizer.stopContinuousRecognitionAsync then the event will be triggered.


startRecognition functiontriggers the speech recognition module with the following command:
speechRecognizer.startContinuousRecognitionAsync()

### stopRecognition():

it is a function that activates the function speechRecognizer.stopContinuousRecognitionAsync();
which stops the recognition.

### clearResult():

the function cleans all the text areas in the web app, and the main variables, that is done to start again from the beggining

### Analyze results():

It uses PiiEntityRecognition of Azure solution(NER) it has a input parameter which is the text to be processed and then it writes in the corresponding cell the desired output.

### textToSpeech():

this is a function that uses Azure SpeechSDK to perform text to speech, it takes the text in the `text_to_speech` cell, and reades with a default voice of azure, that voice can be changed deppending on the language. works on different languages.

