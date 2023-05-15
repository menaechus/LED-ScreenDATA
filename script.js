//a script that reads manufacturers.json and save that information to array called Manufacturers
//then it reads the Filename data from the array and populates a object called screens with that data so that it can be referended later with manufacturer name
//then it reads the Filaname data and populates another dropdown menu with that data
const manufacturersFile = 'manufacturers.json';
const resolutionsFile = 'resolutions.json';
const dataDirectory = 'data/';
const manufacturerDropdown = document.getElementById('manufacturer-select');
const deviceDropdown = document.getElementById('device-select');
var imageWidth = 1920;
var imageHeight = 1080;
var Manufacturers = [];
var allScreens = [];
var devices = [];
var resolutions = [];
var currentManufacturer;
var currentDevice;

function readManufacturers() {
	$.getJSON(manufacturersFile, function(data) {
		Manufacturers = data;
	}).fail(function() {
		alert('Error reading manufacturers file');
	}).done(function() {
		//console.log(Manufacturers);
		populateManufacturerDropdown(Manufacturers);
	});
}
		
function populateManufacturerDropdown(Manufacturers) {
	//sort manufacturers alphabetically
	Manufacturers.sort(function(a, b) {
		var nameA = a.Name.toUpperCase();
		var nameB = b.Name.toUpperCase();
		if (nameA < nameB) {
			return -1;
		}
		if (nameA > nameB) {
			return 1;
		}
		return 0;
	});

	Manufacturers.forEach(manufacturer => {
		var option = document.createElement('option');
			option.value = manufacturer.Name;
			option.text = manufacturer.Name;
		var option2 = $('<div class="item" data-value="' + manufacturer.Name + '">' + manufacturer.Name + '</div>');
		var manuDrop = $('#manufacturer-select .menu');
        manuDrop.append(option2);
	});
	$('.dropdown').dropdown('refresh');
	//default dropdown to first manufacturer
	currentManufacturer = Manufacturers[0].Name;
	$('#manufacturer-select').dropdown('set selected', currentManufacturer);
	readLedScreen(Manufacturers);
}

function readLedScreen(Manufacturers) {
	//Read the Manufacturers.Filename to get the filename of the LED screen data json file
	//then populate the allScreens array with the data from the json file
	Manufacturers.forEach(manufacturer => {
		$.getJSON(dataDirectory + manufacturer.Filename, function(data) {
			allScreens[manufacturer.Name] = data;
		}).fail(function() {
			alert('Error reading LED screen file');
		}).done(function() {
			//console.log(allScreens);
			populateDeviceDropdown();
		});
	});
} 

function populateDeviceDropdown() {
	//populate the device dropdown with the data from the allScreens array
	//dropdown should only be populated with the data from the selected manufacturer
	//clear the dropdown first
	currentManufacturer = $('#manufacturer-select').dropdown('get value');
	//console.log(currentManufacturer);
	var deviceDrop = $('#device-select .menu');
	$('#device-select .menu').empty();
	devices = allScreens[currentManufacturer];
	//console.log(devices);
	devices.forEach(device => {
		var option = document.createElement('option');
		option.value = device.Name;
		option.text = device.Name;
		var option2 = $('<div class="item" data-value="' + device.Name + '">' + device.Name + '</div>');
		deviceDrop.append(option2);
	});
	$('#device-select').dropdown('refresh');
	$('#device-select').dropdown('set selected', devices[0].Name);
	updateDeviceInfo();
}

function updateDeviceInfo() {
	//update the device information when the dropdown selection changes or the number of screen pieces changes
	//get the device name from the dropdown
	//get the device information from the allScreens array
	//calculate the total pixels and total power based on the number of screen pieces
	//add each piece of device information as a new paragraph
	//append the device information div to the main device information div
	const deviceName = $('#device-select').dropdown('get value');
	const device = allScreens[currentManufacturer].find(device => device.Name === deviceName);
	currentDevice = device;
	
	const deviceInfoDiv = document.querySelector('.device-info');
	// Clear any existing device information
	deviceInfoDiv.innerHTML = '';
	// Create a new div for the device information
	const deviceDiv = document.createElement('div');
	deviceDiv.classList.add('device-info');
	// Calculate total pixels and total power based on the number of screen pieces
	
	drawGrid();
	const totalPixels = device.PixelWidth * device.PixelHeight;
	const totalPower = device.PowerDraw * (numCols * numRows);
	// Add each piece of device information as a new paragraph
	Object.keys(device).forEach(key => {
		const p = document.createElement('p');
		if (key === 'TotalPixels') {
			p.textContent = `${key}: ${totalPixels}`;
		} else if (key === 'PowerDraw') {
			p.textContent = `${key}: ${totalPower} W`;
		} else {
			p.textContent = `${key}: ${device[key]}`;
		}
		deviceDiv.appendChild(p);
	});
	// Append the device information div to the main device information div
	deviceInfoDiv.appendChild(deviceDiv);
	
}

function drawGrid() {
	const deviceName = $('#device-select').dropdown('get value');
	const device = allScreens[currentManufacturer].find(device => device.Name === deviceName);
	numCols = document.getElementById('screen-cols').value;
	numRows = document.getElementById('screen-rows').value;
	if(numCols==0){
		numCols=1;
	}
	if(numRows==0){
		numRows=1;
	}
	const gridContainer = document.querySelector('.grid-container');
	gridContainer.innerHTML = "";
	let number = 1; // Running number
	for (let i = 0; i < numRows; i++) {
	const row = document.createElement("div");
	row.classList.add("grid-row");
	for (let j = 0; j < numCols; j++) {
		const column = document.createElement("div");
		column.classList.add("grid-column");
		column.textContent = number++; // Add the running number
		row.appendChild(column);
		if ((i + j) % 2 === 0) {
		column.style.backgroundColor = "green";
		} else {
		column.style.backgroundColor = "red";
		}
	}
	gridContainer.appendChild(row);
	}

			
	const dimensions = document.querySelector(".grid-info");
	const totalPower = device.PowerDraw * (numCols * numRows);
	const AmountOfPhases = totalPower / 3000;
	var AmountOfPhasesF = AmountOfPhases.toFixed(1);
	const VerticalPixels  = device.PixelHeight * numRows; //y pixel - pysty
	const HorizontalPixels = device.PixelWidth * numCols; //x pixel - vaaka
	const totalAmount = numRows * numCols;const TotalPixels = VerticalPixels * HorizontalPixels;
	const totalWidth = device.PhysicalWidth * numCols;
	const totalHeight = device.PhysicalHeight * numRows;
	const totalWeight = device.Weight * totalAmount;
	var totalWeightF = totalWeight.toFixed(2);
	var totalHeightF = totalHeight.toFixed(2);
	var totalWidthF = totalWidth.toFixed(2);
			
	dimensions.innerHTML = '';
	dimensions.innerHTML = "Model: " + device.Name;
	dimensions.innerHTML += "<br>Total amount: " + totalAmount; 
	dimensions.innerHTML += "<br>Resolution: " + HorizontalPixels + "px * " + VerticalPixels + "px";
	dimensions.innerHTML += "<br>Total Pixels: " + TotalPixels + "px";
	dimensions.innerHTML += "<br>Physical dimensions: " + totalWidthF + "mm * " + totalHeightF + "mm";
	dimensions.innerHTML += "<br>Total powerdraw: " + totalPower + "w";
	dimensions.innerHTML += "<br>Number of phases (3000W): " + AmountOfPhasesF;
	dimensions.innerHTML += "<br>Total weight: " + totalWeightF + "kg";
	dimensions.innerHTML += "<br><br>";
}	

function readResolution() {
	//read resolutions.json and populate the dropdown with the data
	$.getJSON(resolutionsFile, function(data) {
		resolutions = data;
	}
	).fail(function() {
		alert('Error reading resolutions file');
	}
	).done(function() {
		//console.log(resolutions);
		populateResolutionDropdown(resolutions);
	}
	);
}

function populateResolutionDropdown(resolutions) {
	//populate the dropdown with the data from the resolutions array

	resolutions.forEach(resolution => {
		var option = document.createElement('option');
		option.value = resolution.Name;
		option.text = resolution.Name;
		var option2 = $('<div class="item" data-value="' + resolution.Name + '">' + resolution.Name + '</div>');
		var resoDrop = $('#resolution-select .menu');
		resoDrop.append(option2);
	});
	$('.dropdown').dropdown('refresh');
	//default dropdown to first resolution
	currentResolution = resolutions[0].Name;
	$('#resolution-select').dropdown('set selected', currentResolution);
}

function setResolution() {
	//set the resolution based on the dropdown selection
	const resolutionName = $('#resolution-select').dropdown('get value');
	const resolution = resolutions.find(resolution => resolution.Name === resolutionName);
	imageWidth = resolution.Width;
	imageHeight = resolution.Height;
	console.log(imageWidth);
}

function generateImage(device, gridContainer) {
	emptyImages();
	if(gridContainer == null) {
	gridContainer = document.querySelector('.grid-img-holder');
	}
	html2canvas((gridContainer), { width: imageWidth, height: imageHeight }).then(function(canvas) {
		const img = new Image();
		img.backgroundColor = "#FFFFFF";
		img.src = canvas.toDataURL();
		document.getElementById('img-holder').appendChild(img);
		document.getElementById('img-holder').children[0].style.width = "90%";
	});
	//if we have created an image, show save button
	document.getElementById('img-holder').style.display = 'block';
	document.getElementById('save-button').style.display = 'block';

}

function callImgGen() {	
	const gridContainer = document.querySelector('.grid-container');
	const device = currentDevice;
	//this needs to call a function that generates the image with just the grid
	//it needs to redraw the grid with the correct number of rows and columns and the elements need to be the correct size in pixels
	//then it needs to call the generateImage function with the correct device information and the grid container
	//also needs to check the resolution of the led screen and set the image size to big enough to fit the grid from the list of resolutions

	//drawLedGrid();

	generateImage(device, gridContainer);
}

function drawLedGrid() {
	//draw the grid with the correct number of rows and columns and the elements need to be the correct size in pixels
	const deviceName = $('#device-select').dropdown('get value');
	const device = allScreens[currentManufacturer].find(device => device.Name === deviceName);
	numCols = document.getElementById('screen-cols').value;
	numRows = document.getElementById('screen-rows').value;
	if(numCols==0){
		numCols=1;
	}
	if(numRows==0){
		numRows=1;
	}
	//create a new hidden grid to draw the image from
	const gridContainer = document.querySelector('.grid-img-holder');
	gridContainer.innerHTML = "";
	const hiddenimg = gridContainer.appendChild(document.createElement('div'));
	hiddenimg.classList.add("grid-img");
	//hide hiddenimg from the user
	hiddenimg.style.display = 'none';
	//draw the grid into hiddenimg

	//make sure the grid is the correct size

	for (let i = 0; i < numRows; i++) {
		const row = document.createElement("div");
		row.style.height = device.PixelHeight + "px";
		row.style.width = device.PixelWidth + "px";
		row.classList.add("grid-row");

		for (let j = 0; j < numCols; j++) {
			const column = document.createElement("div");
			column.style.height = device.PixelHeight + "px";
			column.style.width = device.PixelWidth + "px";
			column.classList.add("grid-column");
			row.appendChild(column);
			if ((i + j) % 2 == 0) {
				column.style.backgroundColor = "green";
			} else {
				column.style.backgroundColor = "red";
			}
		}
		hiddenimg.appendChild(row);
	}
	generateImage(device, hiddenimg);
}

function clearButton() {
	document.getElementById('img-holder').style.display = 'none';
	emptyImages();
}

function saveImage() {
	const images = document.getElementById('img-holder');
	const image = images.children[0].src;
	const link = document.createElement('a');
	link.href = image;
	link.download = 'image.png';
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}

function emptyImages() {
	const images = document.getElementById('img-holder');
	while (images.hasChildNodes()) {
		images.removeChild(images.firstChild);
	}
}

function onLoad() {
	document.getElementById('calculate-button').addEventListener('click', callImgGen);
	document.getElementById('save-button').addEventListener('click', saveImage);
	document.getElementById('clear-button').addEventListener('click', clearButton);
	document.getElementById('manufacturer-select').addEventListener('change', populateDeviceDropdown);
	document.getElementById('screen-cols').addEventListener('input', drawGrid);
	document.getElementById('screen-rows').addEventListener('input', drawGrid);
	deviceDropdown.addEventListener('change', updateDeviceInfo);
	manufacturerDropdown.addEventListener('change', populateDeviceDropdown);	
	document.getElementById('save-button').style.display = 'none';
	document.getElementById('img-holder').style.display = 'none';
	readManufacturers();
	$('.dropdown').dropdown();
	readResolution();
	//add onchange event to resolution dropdown
	$('#resolution-select').dropdown({
		onChange: function(value, text, $selectedItem) {
			setResolution();
		}});
}