/**
BSD 3-Clause License

Copyright (c) 2020, MindEarth
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its
   contributors may be used to endorse or promote products derived from
   this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

function getJSON(url, callback) {

    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    
    xhr.onload = function() {
    
        var status = xhr.status;
        
        if (status == 200) {
            callback(null, xhr.response);
        } else {
            callback(status);
        }
    };
    
    xhr.send();
}

function loadImage(src, onload) {
    var img = new Image();
    img.onload = onload;
    img.src = src;

    return img;
}

function imageClick(event) {
    if (image_bb !== null) {

        const rect = canvas_elem.getBoundingClientRect();
        
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        if (x >= image_bb.xm && x <= image_bb.xM && y >= image_bb.ym && y <= image_bb.yM) {
            user_input.click = {"x": (x-image_bb.xm)/(image_bb.xM-image_bb.xm), "y": (y-image_bb.ym)/(image_bb.yM-image_bb.ym)};
            
            drawImage();

            canvas_elem.removeEventListener("click", imageClick);

            task_state = 2;
            stateTransition();
        }
    }
}

function clearImage() {
    var ctx = canvas_elem.getContext("2d");
    ctx.clearRect(0, 0, canvas_elem.width, canvas_elem.height);
}

function drawImage() {
    var ctx = canvas_elem.getContext("2d");                
                
    cw = canvas_elem.width;
    ch = canvas_elem.height;

    if (image.height/image.width*cw < ch) {

        ih = image.height/image.width*cw;
        off = (ch-ih)/2;

        clearImage();
        ctx.drawImage(image, 0, 0, image.width, image.height, 0, off, canvas_elem.width, canvas_elem.height-2*off);

        image_bb = {'xm': 0, 'xM': canvas_elem.width/dpi, 'ym': off/dpi, 'yM': (canvas_elem.height-off)/dpi};

        // draw mapillary logo
        if (mapillary_logo !== null) {
            ctx.drawImage(mapillary_logo, 0, 0, mapillary_logo.width, mapillary_logo.height, 0, off, canvas_elem.width/5, mapillary_logo.height/mapillary_logo.width*(canvas_elem.width/5));
        }

    } else if (image.width/image.height*ch < cw) {
        iw = image.width/image.height*ch;
        off = (cw-iw)/2;

        clearImage();
        ctx.drawImage(image, 0, 0, image.width, image.height, off, 0, canvas_elem.width-2*off, canvas_elem.height);

        image_bb = {'xm': off/dpi, 'xM': (canvas_elem.width-off)/dpi, 'ym': 0, 'yM': canvas_elem.height/dpi};

        if (mapillary_logo !== null) {
            ctx.drawImage(mapillary_logo, 0, 0, mapillary_logo.width, mapillary_logo.height, off, 0, canvas_elem.width/5, mapillary_logo.height/mapillary_logo.width*(canvas_elem.width/5));
        }
    }
    
    if (user_input.click !== undefined) {        

        ctx.strokeStyle = "#FF0000";
        //ctx.fillStyle = "#FF000040";
        ctx.lineWidth = 20/dpi;
        ctx.beginPath();

        var cc_x = user_input.click.x*(image_bb.xM-image_bb.xm)+image_bb.xm;
        var cc_y = user_input.click.y*(image_bb.yM-image_bb.ym)+image_bb.ym;

        ctx.arc(cc_x*dpi, cc_y*dpi, 300/dpi, 0, 2 * Math.PI);
        ctx.stroke();
        //ctx.fill();
    }
}

function set_floors(floors) {
    user_input.skip = false;
    user_input.reason = null;

    user_input.floors = floors;

    task_state = 4;
    stateTransition(); 
}

function floors_button_click(floors, event) {
    buttonClick(event, set_floors.bind(null, floors));
}

let dpi = window.devicePixelRatio;

canvas_elem = document.getElementById('image-canvas');
canvas_container_element = document.getElementById('swImageContainer');
buttons_elem = document.getElementById('buttons');
prompt_elem = document.getElementById('prompt');
taskinfo_elem = document.getElementById('header-info');

// canvas_elem.style.width='100%';
// canvas_elem.style.height='100%';
canvas_elem.height = canvas_elem.offsetHeight*dpi;
canvas_elem.width  = canvas_elem.offsetWidth*dpi;

mapillary_logo = null;
mapillary_logo = loadImage('/images/mapillary_logo.png', function() {});

var image = null;
var image_bb = null;

task_state = 0;
task_data = null;

var user_input = null;
var timeout_handle = null;

var stateTransition = function() {
    switch (task_state) {
        case 0:

            clearImage();
            buttons_elem.innerHTML = '';
            prompt_elem.innerHTML = 'Loading ...';
            
            var start_time = (user_input !== null && user_input.time_stats.completed !== null) ? user_input.time_stats.completed : new Date().getTime();

            // console.log(user_input !== null && user_input.time_stats.completed !== null);  
            // console.log(user_input ? user_input.time_stats : null);
            // console.log(start_time);

            user_input = {
                 // TODO: perfect user management
                'user': getCookie('uname'),                
                'task_type': 1
            };
            image_bb = null;

            user_input.time_stats = {
                'start' : start_time,
                'loaded' : null,
                'completed': null
            };
            

            // get the task data
            getJSON(`task/gettask/${user_input.user}`,
                function(err, ret) {
                    if (err === null) {
                        task_data = ret;

                        user_input.task_id = task_data.id;
                        
                        image = loadImage(task_data.image_url, function() {
                            drawImage();

                            user_input.time_stats.loaded = new Date().getTime();

                            task_state = 1;
                            stateTransition();                        
                        });

                    } else {
                        task_state = 6;
                        stateTransition();
                    }
                });



            break;

        case 1:
            // display the image and buttons

            user_input.canvas_w = (image_bb.xM-image_bb.xm);
            user_input.canvas_h = (image_bb.yM-image_bb.ym);

            taskinfo_elem.innerHTML = `Task ID: <b>${user_input.task_id}</b>`;
            
            canvas_elem.addEventListener('click', imageClick);

            buttons_elem.innerHTML = `                
                <div class="button buttonRow" id="skip-button"><div class="buttonText">Skip</div></div>
            `;

            prompt_elem.innerHTML = `Click on the TALLEST building`;
            
            var skip_button_elem = document.getElementById('skip-button');

            skip_button_elem.addEventListener('click',  
                function(event) {
                    buttonClick(event, function() {
                        user_input.skip = true;

                        task_state = 3;
                        stateTransition();                        
                    });
                }
            );

            //start the timeout
            if (timeout_handle !== null) {
                window.clearTimeout(timeout_handle);
            }

            timeout_handle = window.setTimeout( function() {
                task_state = 5;
                stateTransition();
                }, 30000);

            break;
        
        case 2:

            prompt_elem.innerHTML = `How many floors?`;

            var buttons = `<div class="button buttonRow" id="button-back"><div class="buttonText">Back</div></div>`;

            for (var i = 0; i < 9; ++i) {
                buttons = buttons + `<div class="button" id="button-${i}"><div class="buttonText" id="button-text-${i}">${(i === 8) ? '> ': ''}${i+1}</div></div>`;
            }

            buttons_elem.innerHTML = buttons;

            for (var i = 0; i < 9; ++i) {
                var cb = document.getElementById(`button-${i}`);

                cb.addEventListener('click', floors_button_click.bind(null, i+1));
            }

            bb = document.getElementById('button-back');

            bb.addEventListener('click', 
                function(event) {
                buttonClick(event, function() {
                    delete user_input.click;

                    task_state = 1;
                    stateTransition();                 
                });
            });

            break;

        case 3:
            prompt_elem.innerHTML = `Why?`;

            buttons_elem.innerHTML = `
                <div class="button buttonRow" id="button-back"><div class="buttonText">Back</div></div>
                <div class="button buttonRow" id="button-nobuildings"><div class="buttonText">There are no buildings</div></div>
                <div class="button buttonRow" id="button-obstruction"><div class="buttonText">I can't see (obstructions)</div></div>
                <div class="button buttonRow" id="button-difficult"><div class="buttonText">Others (difficult image)</div></div>
            `;

            var skip_button_elem = document.getElementById('button-back');

            skip_button_elem.addEventListener('click', 
                function(event) {
                buttonClick(event, function() {                    
                    delete user_input.skip;

                    task_state = 1;
                    stateTransition();               
                });
            });

            var nobuildings_button_elem = document.getElementById('button-nobuildings');

            nobuildings_button_elem.addEventListener('click', 
                function(event) {
                buttonClick(event, function() {                    
                    user_input.reason = 1;

                    task_state = 4;
                    stateTransition();               
                });
            });

            var obstruction_button_elem = document.getElementById('button-obstruction');

            obstruction_button_elem.addEventListener('click', 
                function(event) {
                buttonClick(event, function() {                    
                    user_input.reason = 2;

                    task_state = 4;
                    stateTransition();               
                });
            });

            var obstruction_button_elem = document.getElementById('button-difficult');

            obstruction_button_elem.addEventListener('click', 
                function(event) {
                buttonClick(event, function() {                    
                    user_input.reason = 3;

                    task_state = 4;
                    stateTransition();               
                });
            });

            break;

        case 4:            
            window.clearTimeout(timeout_handle);

            user_input.time_stats.completed = new Date().getTime();

            getJSON(`/task/solvetask/${encodeURIComponent(JSON.stringify(user_input))}`, 
                function(err,ret) {

                    user_input.time_stats.stored = new Date().getTime();

                    console.log(user_input.time_stats);

                    task_state = 0;
                    stateTransition();
                });

            break;

        case 5:
            canvas_elem.removeEventListener("click", imageClick);

            clearImage();

            prompt_elem.innerHTML = `This took too long`;

            buttons_elem.innerHTML = `
                <div class="button buttonRow" id="button-resume"><div class="buttonText">Resume</div></div>
            `;

            var resume_button_elem = document.getElementById('button-resume');

            resume_button_elem.addEventListener('click', 
                function(event) {
                buttonClick(event, function() {                    
                    task_state = 0;
                    stateTransition();               
                });
            });

            break;

        case 6:
            prompt_elem.innerHTML = `Sorry, no more tasks available`;

            buttons_elem.innerHTML = `
                <div class="button buttonRow" id="button-resume"><div class="buttonText">Retry tomorrow!</div></div>
            `;

            var resume_button_elem = document.getElementById('button-resume');

            resume_button_elem.addEventListener('click', 
                function(event) {
                buttonClick(event, function() {                    
                    task_state = 0;
                    stateTransition();               
                });
            });

            break;


    }   
}

stateTransition();




