// - - - Global - - - - -

const img_path = "https://assets.codepen.io/172456/face-track--";
 
// - - - Utility Functions - - - - -

function constrainNum(val, min, max) {
	let output;
	if ( val >= max ) {
		output = max;
	}
	else if ( val <= min ) {
		output = min;
	} else {
		output = val
	}
	return output;
}

function roundFloat(num, dec=0) {
	return parseFloat(num).toFixed(dec);
}

// - - - Image Src Pool - - - - -

// The numbers here correspond to a SOURCE image grid. This grid should be thought of separate from the DISPLAYED image grid.

const total_cols = 5;
const total_rows = 5;
const total_srcs = total_cols * total_rows;
const img_pool_arry = [];

// 01. Create 2D Array
for (let row = 0; row < total_rows; row++) {
	for (let col = 0; col < total_cols; col++) {
		img_pool_arry[row] = [];
	}
}

// 02. Fill 2D array with rows and column index spaces.
for (let idx = 0; idx < total_srcs; idx++) {
	let col_num = idx % total_rows;
	let row_num = Math.floor( idx / total_cols );
	img_pool_arry[row_num][col_num] = idx;
}

// 03. Find the Center Src Img Indx
const center_row = (total_rows - 1) / 2;
const center_col = (total_cols - 1) / 2;
const center_src_idx = img_pool_arry[ center_row ][ center_col ];


// - - - - Image Src Pool - - - - -

class FaceImg {
	constructor(el, idx) {
		this.el = el;
		this.idx = parseInt(idx);
		this.el_img = this.el.querySelector('.face-track__img');
		this.debug = this.el.querySelector(`.face-track__debug`);
		this.calcSizePos();
		this.getAttr();
	}
	calcSizePos() {
		this.x = this.el.getBoundingClientRect().left;
		this.y = this.el.getBoundingClientRect().top;
		this.w = this.el.getBoundingClientRect().width;
		this.h = this.el.getBoundingClientRect().height;
		
		this.cX = roundFloat(this.x + this.w/2, 1);
		this.cY = roundFloat(this.y + this.h/2, 1);
	}
	getAttr() {
		this.row_id = parseInt(this.el.getAttribute('data-row'));
		this.col_id = parseInt(this.el.getAttribute('data-col'));
	}
	turnFace() {
		// 01. Get the distance from the pointer and this Img
		let pointer_dist_x = roundFloat( pointer_pos.x - this.x, 0);
		let pointer_dist_y = roundFloat( pointer_pos.y - this.y , 0);
		
		// 02. Convert that distance to be divisible by the img width, or in other words a unit width of the image. This is by how much the face should turn.
		let face_turn_x = Math.floor( pointer_dist_x / this.w );
		let face_turn_y = Math.floor( pointer_dist_y / this.h );
		
		// 03. Three things happening:
		// a) Reference the center idx of the img_src_pool with center_row and center_col.
		// b) Add the face turn amount to the center idx
		// c) Certain screen sizes and and point distances will yield turn idx numbers that are larger than the lengths of img_src_pool array rows and cols. So we constrain those idx numbers to the length of the row array (img_pool_arry.length -1) and the interior col arrays (img_pool_arry[0].length - 1).
		let calc_turn_row = constrainNum(center_row + face_turn_x, 0, img_pool_arry.length - 1);
		let calc_turn_col = constrainNum(center_col + face_turn_y, 0, img_pool_arry[0].length - 1);
		
		// 04. Look up the new_src_idx from img_pool_arry based off the calc_turn values and concatenate a strg.
		let new_src_idx = img_pool_arry[ calc_turn_col ][ calc_turn_row ];
		let new_src_strg = `${img_path}${new_src_idx}.jpg`;
		
		// 05. Replace the old src of the img with the new src.
		this.el_img.src = new_src_strg;
		
		if (this.debug.querySelector('input').checked ) {
			this.debug.querySelector('.debug__data--idx').textContent = `${this.idx}`;
			this.debug.querySelector('.debug__data--position').textContent = `x:${this.cX}, y:${this.cY}`;
			this.debug.querySelector('.debug__data--pointer').textContent = `x:${pointer_pos.x}, y:${pointer_pos.y}`;
			this.debug.querySelector('.debug__data--dist').textContent = `x:${pointer_dist_x}, y:${pointer_dist_y}`;
			this.debug.querySelector('.debug__data--faceturn').textContent = `x:${face_turn_x}, y:${face_turn_y}`;
			this.debug.querySelector('.debug__data--new-idx').textContent = `${new_src_idx}`;
		}
	}
}

// - - - Face Img Obj Creation - - -

let face_img_arry = [];
let face_imgs = document.querySelectorAll('.face-track__item');

face_imgs.forEach( (img, idx) => {
	face_img_arry.push( new FaceImg(img, idx) );
});

// - - - Debug Code - - -

let tracking = false;
let pollPosLoop = setInterval(()=> {
	requestAnimationFrame( ()=> {
		for (let f of face_img_arry ) {
			// if ( getComputedStyle(f.el).display === "block" ) {
			f.turnFace();
			// }
		}
	})
}, 60)
tracking = true;

// let debug_start_track = document.querySelector('.debug__start-track');
// const debug = document.querySelector('.debug');
// debug_start_track.addEventListener('click', () => {
// 	if ( !tracking ) {
// 		pollPosLoop = setInterval(()=> {
// 			requestAnimationFrame( ()=> {
// 				for (let f of face_img_arry ) {
// 					// if ( getComputedStyle(f.el).display === "block" ) {
// 						f.turnFace();
// 					// }
// 				}
// 			})
// 		}, 60)
// 		tracking = true;
// 		debug_start_track.textContent = "Stop Tracking";
// 	} else {
// 		clearInterval(pollPosLoop);
// 		tracking = false;
// 		debug_start_track.textContent = "Start Tracking";
// 	}
// },true);

// - - - Event Listeners - - -

const pointer_pos = {
	x : null,
	y : null
}

window.addEventListener('mousemove', e => {
	pointer_pos.x = e.clientX;
	pointer_pos.y = e.clientY;
});

window.addEventListener('resize', ()=> {
	for ( let f of face_img_arry ) {
		f.calcSizePos();
	}
});

window.addEventListener('touchmove', e => {
	pointer_pos.x = e.touches[0].clientX;
	pointer_pos.y = e.touches[0].clientY;
});


