var circles = [];
for (var i = 1; i<13; i++) {
  circles.push(
    document.getElementById("c" + i.toString())
  )
}

for (var i = 0; i<12.; i++) {
  circles[i].insertAdjacentHTML("afterend", '<circle cx="0" cy="0" r="21" class="cover"/>');
}

var svgGroups = [];
for (var i = 1; i<13; i++) {
  svgGroups.push(
    document.getElementById("g" + i.toString())
  );
}

function ChromToCOF(index) { //note C = 0, function works in reverse as well
    return (index * 7) % 12;
}

// 0 at top of circle, 1 at 1 o'clock etc.
function indexToCoordinates(index) {
    index-= 3;
    x = Math.cos(index * ((2*Math.PI)/12)) * 100;
    x+= 125;
    y = Math.sin(index * ((2*Math.PI)/12)) * 100;
    y+= 125;
    return [x,y];
}

//CoF=true->Circle of Fifths arrangement, CoF=false->Chromatic
function arrangeCircles(CoF) {
    for (var i = 0; i<12; i++) {
        if (CoF) {xy = indexToCoordinates(ChromToCOF(i));}
        else     {xy = indexToCoordinates(i);}
        pos = "translate("+xy[0].toFixed(3)+","+xy[1].toFixed(3)+")";
        svgGroups[i].setAttribute('transform', pos);
    }
}

arrangeCircles(true);

var layout = true;
function switchLayout() {
  if (layout == true) {layout = false;} else {layout = true}
  arrangeCircles(layout);
}

function switchText(element) {
  switch (element.textContent) {
    case "B♭": element.textContent = "A♯"; break;
    case "A♯": element.textContent = "B♭"; break;

    case "A♭": element.textContent = "G♯"; break;
    case "G♯": element.textContent = "A♭"; break;

    case "G♭": element.textContent = "F♯"; break;
    case "F♯": element.textContent = "G♭"; break;

    case "E♭": element.textContent = "D♯"; break;
    case "D♯": element.textContent = "E♭"; break;

    case "D♭": element.textContent = "C♯"; break;
    case "C♯": element.textContent = "D♭"; break;
  }
}

WebMidi.enable(function (err) {
    if (err) {
    console.log("WebMidi could not be enabled.", err);
    } else {
    console.log("WebMidi enabled!");
    }
  
    var sustainPedal = false; //sustainPedal Off

    var noteArray = new Array(12).fill(0); //12 zeroes,
    //noteArray contains -1 if the note is sustained, otherwise the number of keys of that note currently pressed

    console.log("Number of input devices:", WebMidi.inputs.length);
    var input = WebMidi.inputs[0]; //First and best input device

    if (input === undefined) {
      return;
    }

    function update(state, e) {
      var note = e.note.number % 12; //0 is C, 1 is Db etc.
      if (state == 'on') {
        noteArray[note]+=1;
        if (noteArray[note] == 0) {noteArray[note] = 1} //If note was sustained
        circles[note].setAttribute('data-n', noteArray[note]);
        if (noteArray[note] == 1) {
          circles[note].setAttribute('class', state);
        }
      }
      else { //if state == 'off'
        noteArray[note]-=1;
        if (noteArray[note] == 0) {
          if (sustainPedal == true) {noteArray[note] = -1; state = 'on';}
          circles[note].setAttribute('class', state);
        }
       circles[note].setAttribute('data-n', noteArray[note]);
      }
    }

    input.addListener('noteon',  "all", 
        function(e) {update('on', e);}
    );

    input.addListener('noteoff', "all",
        function(e) {update('off', e);}
    );

    input.addListener('controlchange', "all",
        function(e) {
              //console.log("Received 'controlchange' message ",e.controller.number,e.controller.name,e.value);
              if (e.controller.number == 64) { //Sustain Pedal = CC64 
                 if (e.value > 63) {
                   sustainPedal = true;
                 }
                 else
                 {
                   sustainPedal = false;
                   if (e.value != 0) {return} //only change already sustained notes when pedal is fully released
                   noteArray.forEach(function(value, index) {
                     if (value == -1) {
                       value = 0;
                       circles[index].setAttribute('data-n', 0);
                       // circles[index].setAttribute('class', 'off');
                       // Class is intentionally not set to off
                       // This enables special animation when pedal is released
                       }
                   });
                 }
              }
            }
    );
});