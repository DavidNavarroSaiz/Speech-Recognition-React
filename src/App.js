import React, { useEffect, useState, useRef } from 'react';
import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';

function App() {
  // State variables
  const [result, setResult] = useState('');
  const [startRecognitionDisabled, setStartRecognitionDisabled] = useState(false);
  const [AnalizeDisabled, setAnalizeDisabled] = useState(true);
  const [stopRecognitionDisabled, setStopRecognitionDisabled] = useState(true);
  const [cleanDisabled, setcleanDisabled] = useState(true);
  const [textToSpeechDisabled, setTextToSpeechDisabled] = useState(false);
  const [inputText, setInputText] = useState('');
  const [languageSelect, setLanguageSelect] = useState('en-US');
  const [isListening, setIsListening] = useState(false);
  let finalText = '';

  // Azure Cognitive Services API credentials and client initialization
  const subscriptionKey = process.env.REACT_APP_SUBSCRIPTION_KEY;
  const serviceRegion = process.env.REACT_APP_SERVICE_REGION;
  const endpoint = process.env.REACT_APP_AZURE_LANGUAGE_ENDPOINT;
  const apiKey = process.env.REACT_APP_AZURE_LANGUAGE_KEY;
  const { TextAnalysisClient, AzureKeyCredential, } = require("@azure/ai-language-text");
  const client = new TextAnalysisClient(endpoint, new AzureKeyCredential(apiKey));
  const [speechRecognizer, setSpeechRecognizer] = useState(null);
  const [synthesizer, setSynthesizer] = useState(null);

  // State variables for storing recognized entities
  const [name, setName] = useState([]);
  const [age, setAge] = useState([]);
  const [address, setAddress] = useState([]);
  const [telephone, setTelephone] = useState([]);
  const [personType, setPersonType] = useState([]);
  const [dateTime, setDateTime] = useState([]);
  const [Email, setEmail] = useState([]);
  const [otherType, setOtherType] = useState([]);



  // Speech recognition related functions
  const startRecognition = () => {
    setIsListening(true);
    setStartRecognitionDisabled(true);
    setStopRecognitionDisabled(false);
    setcleanDisabled(true);

    const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(subscriptionKey, serviceRegion);
    speechConfig.speechRecognitionLanguage = languageSelect;
    const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
    const recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);
    recognizer.endSilenceTimeout = 3000;
    finalText = '';

    recognizer.recognizing = (_, e) => {
      console.log(`RECOGNIZING: Text=${e.result.text}`);
      setResult(finalText + e.result.text);
    };

    recognizer.recognized = async (_, e) => {
      if (e.result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
        finalText += e.result.text + ' '; // Add a space after each recognized word
        setResult(finalText);

        await AnalyzeResult();
        console.log(`RECOGNIZED: Text=${e.result.text}`);
      } else if (e.result.reason === SpeechSDK.ResultReason.NoMatch) {
        console.log('NOMATCH: Speech could not be recognized.');
      }
    };

    recognizer.canceled = (_, e) => {
      console.log(`CANCELED: Reason=${e.reason}`);

      if (e.reason === SpeechSDK.CancellationReason.Error) {
        console.log(`CANCELED: ErrorCode=${e.errorCode}`);
        console.log(`CANCELED: ErrorDetails=${e.errorDetails}`);
        console.log('CANCELED: Did you set the speech resource key and region values?');
      }

      recognizer.stopContinuousRecognitionAsync();
    };

    recognizer.sessionStopped = () => {
      console.log('\nSession stopped event.');
      recognizer.stopContinuousRecognitionAsync();
    };

    setSpeechRecognizer(recognizer);
  };

  const stopRecognition = () => {
    if (speechRecognizer) {
      speechRecognizer.stopContinuousRecognitionAsync();
      setStartRecognitionDisabled(false);
      setStopRecognitionDisabled(true);
      setcleanDisabled(false);
      setAnalizeDisabled(false);
      setIsListening(false);

      //optional 
      setName('')
      setAddress('')
      setAge('')
      setDateTime('')
      setEmail('')
      setOtherType('')
      setPersonType('')
      setTelephone('')
      AnalyzeResult();
    }
  };

  // useEffect to handle continuous recognition
  useEffect(() => {
    if (speechRecognizer) {
      if (isListening) {
        speechRecognizer.startContinuousRecognitionAsync();
      } else {
        speechRecognizer.stopContinuousRecognitionAsync();
      }
    }
  }, [speechRecognizer, isListening]);

  // Function to clear the results and recognized entities
  const clearResult = () => {
    setAnalizeDisabled(true)
    finalText = '';
    setResult('');
    setName('')
    setAddress('')
    setAge('')
    setDateTime('')
    setEmail('')
    setOtherType('')
    setPersonType('')
    setTelephone('')
  };

  // useRef to keep track of previous results for text analysis
  const previousResultRef = useRef();

  // Update the ref whenever the 'result' state changes
  useEffect(() => {
    previousResultRef.current = result;
  }, [result]);

  // Function to analyze the recognized text and extract entities
  const AnalyzeResult = async () => {
    const previousResult = previousResultRef.current;
    const analyze_lang = languageSelect.slice(0, 2)
    console.log(analyze_lang)

    // const document = {finalText, // The text you wa nt to analyze for PII entities
    // };
    if (previousResult != '') {
      const documents = [previousResult]; // Use the new variable


      const [resultado] = await client.analyze("PiiEntityRecognition", documents, analyze_lang, {
      });
      console.log(resultado)
      console.log(previousResult)



      for (const entity of resultado.entities) {
        console.log(`\t- "${entity.text}" of type ${entity.category}`);

        const { category, subCategory, text } = entity;

        if (category === "Person") {
          setName((prevNames) => new Set([...prevNames, text]));
        } else if (category === "Quantity" && subCategory === "Age") {
          setAge((prevAges) => new Set([...prevAges, text]));
        } else if (category === "Address") {
          setAddress((prevAddresses) => new Set([...prevAddresses, text]));
        } else if (category === "PhoneNumber") {
          setTelephone((prevTelephones) => new Set([...prevTelephones, text]));
        } else if (category === "PersonType") {
          setPersonType((prevPersonTypes) => new Set([...prevPersonTypes, text]));
        } else if (category === "DateTime" && subCategory === "Date") {
          setDateTime((prevDateTimes) => new Set([...prevDateTimes, text]));
        } else if (category === "Address" && subCategory === "Email") {
          setEmail((prevEmails) => new Set([...prevEmails, text]));
        } else {
          setOtherType((prevOtherTypes) => new Set([...prevOtherTypes, text]));
        }
      }
    }
  };

  // Function to perform text-to-speech synthesis
  const textToSpeech = () => {
    setTextToSpeechDisabled(true);

    const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(subscriptionKey, serviceRegion);
    speechConfig.speechSynthesisLanguage = languageSelect;
    const synthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig);

    synthesizer.speakTextAsync(
      inputText,
      (result) => {
        setTextToSpeechDisabled(false);
        if (result.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
          // setResult(`synthesis finished for "${inputText}".\n`);
        } else if (result.reason === SpeechSDK.ResultReason.Canceled) {
          setResult(`synthesis failed. Error detail: ${result.errorDetails}\n`);
        }
        window.console.log(result);
        synthesizer.close();
      },
      (err) => {
        setTextToSpeechDisabled(false);
        setResult(`Error: ${err}\n`);
        window.console.log(err);
        synthesizer.close();
      }
    );

    setSynthesizer(synthesizer);
  };
  
 // Render the app's UI
  return (
    <div className="container">
      <h1 className="text-center mt-5">Azure Speech Recognition</h1>
      <div className="row justify-content-center mt-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <div className="form-group">
                <label htmlFor="textToSpeech">Text to Speech:</label>
                <textarea
                  id="text_to_speech"
                  className="form-control"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
              </div>
              <div className="text-center">
                <button
                  id="speakButton"
                  className="btn btn-success"
                  onClick={textToSpeech}
                  disabled={textToSpeechDisabled}
                >
                  Speak
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row justify-content-center mt-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <div className="form-group">
                <label htmlFor="languageSelect">Select Language:</label>
                <select
                  id="languageSelect"
                  className="form-control"
                  value={languageSelect}
                  onChange={(e) => setLanguageSelect(e.target.value)}
                >
                  <option value="en-US">English</option>
                  <option value="es-ES">Spanish</option>
                </select>
              </div>
              <div className="text-center">
                <button
                  id="startButton"
                  className="btn btn-primary"
                  onClick={startRecognition}
                  disabled={startRecognitionDisabled}
                >
                  Start Listening
                </button>
                <button
                  id="stopButton"
                  className="btn btn-secondary"
                  onClick={stopRecognition}
                  disabled={stopRecognitionDisabled}
                >
                  Stop Listening
                </button>
                <button
                  id="clearButton"
                  className="btn btn-danger"
                  onClick={clearResult}
                  disabled={cleanDisabled}
                >
                  Clear Result
                </button>

              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row justify-content-center mt-4">
        <div className="col-md-6">
          <div className="card">
            <div className="form-group">
              <textarea id="result" className="form-control" value={result} readOnly />
            </div>
          </div>
        </div>
      </div>

      {/* Read-only cells for name, age, and address */}
      <div className="row justify-content-center mt-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              {/* Example displaying recognized names */}
              <div className="form-group">
                <label style={{ width: '120px' }}>Name:</label>
                <span>{Array.from(name).join(", ")}</span>
              </div>

              {/* Example displaying recognized person type */}
              <div className="form-group">
                <label style={{ width: '120px' }}>Person Type:</label>
                <span>{Array.from(personType).join(", ")}</span>
              </div>

              {/* Example displaying recognized ages */}
              <div className="form-group">
                <label style={{ width: '120px' }}>Ages:</label>
                <span>{Array.from(age).join(", ")}</span>
              </div>

              {/* Example displaying recognized addresses */}
              <div className="form-group">
                <label style={{ width: '120px' }}>Addresses:</label>
                <span>{Array.from(address).join(", ")}</span>
              </div>

              {/* Example displaying recognized dates */}
              <div className="form-group">
                <label style={{ width: '120px' }}>Date:</label>
                <span>{Array.from(dateTime).join(", ")}</span>
              </div>

              {/* Example displaying recognized phone numbers */}
              <div className="form-group">
                <label style={{ width: '120px' }}>Phone Numbers:</label>
                <span>{Array.from(telephone).join(", ")}</span>
              </div>
              {/* Example displaying recognized phone numbers */}
              <div className="form-group">
                <label style={{ width: '120px' }}>Email:</label>
                <span>{Array.from(Email).join(", ")}</span>
              </div>

              {/* Example displaying other recognized types */}
              <div className="form-group">
                <label style={{ width: '120px' }}>Other:</label>
                <span>{Array.from(otherType).join(", ")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
