WebMidi.enable(function (err) {

    if (err) {
    console.log("WebMidi could not be enabled.", err);
    } else {
    console.log("WebMidi enabled!");
    }
  
    var circles = []
    for (var i = 1; i<13; i++) {
      circles.push(
        document.getElementById("c" + i.toString())
      )
    }
    // console.log(circles);

    var noteArray = new Array(12).fill(0); //12 zeroes

    var input = WebMidi.inputs[0];

    function update(state, e) {
      var note = e.note.number % 12;
      if (state == 'on') {
        noteArray[note]+=1;
        circles[note].setAttribute('data-n', noteArray[note]);
        if (noteArray[note] == 1) {
          circles[note].setAttribute('class', state);
        }
      }
      else {
        noteArray[note]-=1;
        circles[note].setAttribute('data-n', noteArray[note]);
        if (noteArray[note] == 0) {
          circles[note].setAttribute('class', state);
        }
      }
    }

    input.addListener('noteon',  "all", 
    function(e) {update('on',e);});
      
    input.addListener('noteoff', "all",
    function(e) {update('off',e);});
});