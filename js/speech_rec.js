window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

// detect browser support for speech recognition API
if(typeof window.SpeechRecognition === "undefined") {
    console.log("Speech recognition not supported");
    $('#speakBtn').remove();
} else {
    var recognition = new window.SpeechRecognition();
    //recognition.continuous = false;
    recognition.lang = 'it';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = function (e) {
        $('#speakBtn').css('background-color', 'red');
    };
    recognition.onend = function (e) {
        $('#speakBtn').css('background-color', '#777777');
    };

    recognition.onresult = function(event) {
        // The SpeechRecognitionEvent results property returns a SpeechRecognitionResultList object
        // The SpeechRecognitionResultList object contains SpeechRecognitionResult objects.
        // It has a getter so it can be accessed like an array
        // The [last] returns the SpeechRecognitionResult at the last position.
        // Each SpeechRecognitionResult object contains SpeechRecognitionAlternative objects that contain individual results.
        // These also have getters so they can be accessed like arrays.
        // The [0] returns the SpeechRecognitionAlternative at position 0.
        // We then return the transcript property of the SpeechRecognitionAlternative object

        var last = event.results.length - 1;
        var words = event.results[last][0].transcript.toLowerCase();
        console.log("I heard " + words);
        console.log('Confidence: ' + event.results[0][0].confidence);
        $('#searchBox input').val(words).trigger('keyup');
    };

    recognition.onspeechend = function() {
        recognition.stop();
    };

    recognition.onnomatch = function(event) {
        console.log("I didn't recognise that word.");
    };

    recognition.onerror = function(event) {
        console.log('Error occurred in recognition: ' + event.error);
        alert('Error occurred in recognition: ' + event.error);
    };
}

