function renderCode(sel) {
  var selector = sel || 'example'
  var examples = document.getElementsByClassName(selector);
  if (examples.length > 0) {

    var sketches = examples[0].getElementsByTagName('code');
    var sketches_array = Array.prototype.slice.call(sketches);
    sketches_array.forEach(function(s) {
      setupCode(s);
      runCode(s);
    });
  }

  function setupCode(sketch) {

    var isRef = sketch.parentNode.tagName !== 'PRE';

    var sketchNode =  isRef ? sketch : sketch.parentNode;
    var sketchContainer = sketchNode.parentNode;

    if (isRef) {
      var pre = document.createElement('pre');
      pre.className = 'ref';
      pre.appendChild(sketchNode);
      sketchContainer.appendChild(pre);
      sketch.className = 'language-javascript';
    }

    sketchContainer.style.height = sketchNode.offsetHeight;

    // remove start and end lines
    var runnable = sketch.innerText;
    var rows = sketch.innerText.split('\n').length;

    // var h = Math.max(sketch.offsetHeight, 100) + 25;

    // store original sketch
    var orig_sketch = document.createElement('div');
    orig_sketch.innerHTML = sketch.innerHTML;

    // create canvas
    var cnv = document.createElement('div');
    cnv.className = 'cnv_div';
    if (isRef) {
      sketchContainer.appendChild(cnv);
    } else {
      sketchContainer.parentNode.insertBefore(cnv, sketchContainer);
    }


    // create edit space
    var edit_space = document.createElement('div');
    edit_space.className = 'edit_space';
    sketchContainer.appendChild(edit_space);

    //add buttons
    var edit_button = document.createElement('button');
    edit_button.value = 'edit';
    edit_button.innerHTML = 'edit';
    edit_space.appendChild(edit_button);
    edit_button.onclick = function(e) {
      if (edit_button.innerHTML === 'edit') { // edit
        setMode(sketch, 'edit');
      } else { // run
        setMode(sketch, 'run');
      }
    }

    var reset_button = document.createElement('button');
    reset_button.value = 'reset';
    reset_button.innerHTML = 'reset';
    reset_button.id = 'right_button';
    edit_space.appendChild(reset_button);
    reset_button.onclick = function() {
      edit_area.value = orig_sketch.innerText;
      setMode(sketch, 'run');
    };

    var edit_area = document.createElement('textarea');
    edit_area.value = runnable;
    edit_area.rows = rows;
    edit_area.cols = 65;
    // edit_area.position = 'absolute'
    edit_space.appendChild(edit_area);
    edit_area.style.display = 'none';


    function setMode(sketch, m) {
      if (m === 'edit') {
        edit_button.innerHTML = 'run';
        edit_area.style.display = 'block';
      } else {
        edit_button.innerHTML = 'edit';
        edit_area.style.display = 'none';
        sketch.innerHTML = edit_area.value;
        runCode(sketch);
      }
    }
  }

  function runCode(sketch) {

    var sketchNode = sketch.parentNode;
    var isRef = sketchNode.className.indexOf('ref') !== -1;
    var sketchContainer = sketchNode.parentNode;
    var parent = sketchContainer.parentNode;

    var runnable = sketch.innerText;
    var cnv;
    if (isRef) {
      cnv = sketchContainer.getElementsByClassName('cnv_div')[0];
    } else {
      cnv = parent.parentNode.getElementsByClassName('cnv_div')[0];
    }
    cnv.innerHTML = '';

    var s = function( p ) {

      if (runnable.indexOf('setup()') === -1 && runnable.indexOf('draw()') === -1){
        p.setup = function() {
          p.createCanvas(100, 100);
          p.background(200);
          with (p) {
            eval(runnable);
          }
        }
      }
      else {
 
        with (p) {
          eval(runnable);
        }

        var fxns = ['setup', 'draw', 'preload', 'mousePressed', 'mouseReleased', 
        'mouseMoved', 'mouseDragged', 'mouseClicked', 'mouseWheel', 
        'touchStarted', 'touchMoved', 'touchEnded', 
        'keyPressed', 'keyReleased', 'keyTyped'];
        fxns.forEach(function(f) { 
          if (runnable.indexOf(f) !== -1) {
            with (p) {
              p[f] = eval(f);
            }
          }
        });

        if (typeof p.setup === 'undefined') {
          p.setup = function() {
            p.createCanvas(100, 100);
            p.background(200);
          }
        }
      }
    };

    //if (typeof prettyPrint !== 'undefined') prettyPrint();
    if (typeof Prism !== 'undefined') Prism.highlightAll();

    $( document ).ready(function() {
      $( ".example-content" ).find('div').each(function() {
          $this = $( this );
          var pre = $this.find('pre')[0];
          if (pre) {
            $this.height( Math.max($(pre).height()*1.1, 100) + 20 );
          }
      });
    });

    setTimeout(function() {
      var myp5 = new p5(s, cnv);
    }); 
  }

}
