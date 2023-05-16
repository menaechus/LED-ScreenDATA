//a script that reads manufacturers.json and save that information to array called Manufacturers
//then it reads the Filename data from the array and populates a object called screens with that data so that it can be referended later with manufacturer name
//then it reads the Filaname data and populates another dropdown menu with that data
const manufacturersFile = 'manufacturers.json';
const resolutionsFile = 'resolutions.json';
const dataDirectory = 'data/';
const manufacturerDropdown = document.getElementById('manufacturer-select');
const deviceDropdown = document.getElementById('device-select');
var maximumPixelCount = 500000;
var tolerancePercentage = 20;
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
	loadCookie();
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
	saveCookie();
}

function drawGrid() {
	const deviceName = $('#device-select').dropdown('get value');
	const device = allScreens[currentManufacturer].find(device => device.Name === deviceName);
	numCols = document.getElementById('screen-cols').value;
	numRows = document.getElementById('screen-rows').value;
	if (numCols == 0) {
	  numCols = 1;
	}
	if (numRows == 0) {
	  numRows = 1;
	}
	
	// Calculate the size of each grid piece
	const gridPieceWidth = device.PixelWidth;
	const gridPieceHeight = device.PixelHeight;
  
	const gridContainer = document.querySelector('.grid-container');
	const hiddenContainer = document.querySelector('.hidden-container');
	hiddenContainer.innerHTML = "";
	gridContainer.innerHTML = "";
  
	let number = 1; // Running number
  
	// Get colors from odd-color and even-color inputs
	const oddColor = document.getElementById('odd-color ui').value;
	const evenColor = document.getElementById('even-color ui').value;
  
	// Create the grid columns and hidden columns and add them to the hidden container, also make the size of the grid piece to be the same as the device pixel size
	for (let i = 0; i < numRows; i++) {
		const row = document.createElement("div");
		row.classList.add("grid-row");
		row.style.backgroundColor = i % 2 === 0 ? oddColor : evenColor; // Apply oddColor or evenColor to the row

		for (let j = 0; j < numCols; j++) {
		  const column = document.createElement("div");
		  column.classList.add("grid-column");
		  column.textContent = number++; // Add the running number
		  column.style.backgroundColor = j % 2 === 0 ? evenColor : oddColor; // Apply evenColor or oddColor to the column

		  row.appendChild(column);
		}
		gridContainer.appendChild(row);
	}

	  const originalGrid = document.querySelector('.grid-container');
	  const clonedGrid = originalGrid.cloneNode(true); // Clone the original grid, including its children
	  
	  const clonedColumns = clonedGrid.querySelectorAll('.grid-column');
	  clonedColumns.forEach(column => {
		column.style.width = gridPieceWidth + 'px';
		column.style.height = gridPieceHeight + 'px';
		column.style.lineHeight = gridPieceHeight + 'px'; // Center the text vertically
		column.style.fontSize = Math.floor(gridPieceWidth * 0.6) + 'px'; // Adjust the font size based on the column width
	  });
	  hiddenContainer.style.width = imageWidth + 'px'; // Set the width of the hidden container to match the grid
	  hiddenContainer.style.height = imageHeight + 'px'; // Set the height of the hidden container to match the grid
	  // Add the cloned grid to the desired container element
	  hiddenContainer.innerHTML = ''; // Clear the container first
	  hiddenContainer.appendChild(clonedGrid);
	  
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
	const dataFeeds = calculateDataLines(TotalPixels)
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
	dimensions.innerHTML += "<br>Number of data feeds: " + dataFeeds;
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
		setResolution();
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
	var resolution = resolutions.find(resolution => resolution.Name === resolutionName);
	
	//if user selects custom resolution, show the custom resolution input fields called id="custom-res-width" and id="custom-res-height"
	// to enable them, we need to remove the class "hidden" from them
	if(resolutionName === 'Custom') {
		//console.log('custom resolution selected');
		$('#custom-res-width').removeClass('disabled');
		$('#custom-res-height').removeClass('disabled');
	}
	else {
		$('#custom-res-width').addClass('disabled');
		$('#custom-res-height').addClass('disabled');
	}
	// if custom resolution get the resolution width and height from the custom resolution input fields and set them to the resolution object
	if(resolutionName === 'Custom') {
		resolution.Width = $('#custom-res-width').val();
		resolution.Height = $('#custom-res-height').val();
		//console.log(resolution.Width + ' ' + resolution.Height);
	}
	
	imageWidth = resolution.Width;
	imageHeight = resolution.Height;
	//console.log(imageWidth);
}

function generateImage(device, gridContainer) {
	emptyImages();
	if(gridContainer == null) {
	gridContainer = document.querySelector('.grid-img-holder');
	}
	html2canvas((gridContainer), { width: imageWidth, height: imageHeight , scale: 1}).then(function(canvas) {
		const img = new Image();
		img.backgroundColor = "#FFFFFF";
		img.src = canvas.toDataURL();
		document.getElementById('img-holder').appendChild(img);
		document.getElementById('img-holder').children[0].style.width = "90%";
	});
	//if we have created an image, show save button
	document.getElementById('img-holder').style.display = 'block';
	document.getElementById('save-button').style.display = 'block';
	document.getElementById('hidden-container').style.display = 'none';
}

function callImgGen() {	
	//this should generate one image with just the grid
	//one image with data lines and  one image with power lines
	//and one image with total weight and dimensions and if user selected the stacked option, one image with the stacked dimensions and needed ballast etc.
	//also in that one we should include the total powerdraw and number of phases
	const gridContainer = document.querySelector('.hidden-container');
	const device = currentDevice;
	
	var ledScreenWidth = device.PixelWidth * numCols;
	var ledScreenHeight = device.PixelHeight * numRows;
	if(ledScreenWidth > imageWidth || ledScreenHeight > imageHeight) {
		alert("The LED grid is too big for the image. Please select a bigger image or a smaller LED grid.");
	} else {
		document.getElementById('hidden-container').style.display = 'flex';
		generateImage(device, gridContainer);
	}

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

function calculateDataLines(pixelCount) {
	
	// Calculate the allowed pixel count range based on the tolerance
	const lowerBound = maximumPixelCount - (maximumPixelCount * tolerancePercentage / 100);
	const upperBound = maximumPixelCount + (maximumPixelCount * tolerancePercentage / 100);
	
	//if pixel count is less than the lower bound, return 1
	if(pixelCount < lowerBound) {
		return 1;
	}  
	

	
	// Calculate the number of data lines
	const dataLines = Math.ceil(pixelCount / maximumPixelCount);
	return dataLines;
  }

  //we should save the color selection to a cookie or something so that it is remembered when the user returns to the page
  //also the last used device and manufacturer should be remembered

function saveCookie() {
	//save the color selection to a cookie
	var oddColor = document.getElementById('odd-color ui').value;
	var evenColor = document.getElementById('even-color ui').value;
	var cookieValue = oddColor + ',' + evenColor;
	document.cookie = "color=" + cookieValue;
	
	//save the last used device and manufacturer to a cookie
	var device = $('#device-select').dropdown('get value');
	var manufacturer = $('#manufacturer-select').dropdown('get value');
	
	
	var cookieValue = device + ',' + manufacturer;
	document.cookie = "device=" + cookieValue;
	
}

function loadCookie() {

	//check if the cookie exists
	if(document.cookie.indexOf('color') == -1) {
		//if it doesn't exist, return
		return;	
	}

	//load the color selection from a cookie
	var cookieValue = document.cookie.replace(/(?:(?:^|.*;\s*)color\s*\=\s*([^;]*).*$)|^.*$/, "$1");
	var colors = cookieValue.split(',');
	document.getElementById('odd-color ui').value = colors[0];
	document.getElementById('even-color ui').value = colors[1];

	//load the last used device and manufacturer from a cookie
	var cookieValue = document.cookie.replace(/(?:(?:^|.*;\s*)device\s*\=\s*([^;]*).*$)|^.*$/, "$1");
	var device = cookieValue.split(',')[0];
	var manufacturer = cookieValue.split(',')[1];
	$('#device-select').dropdown('set selected', device);
	$('#manufacturer-select').dropdown('set selected', manufacturer);
	
}

//we should call saveCookie() when the user changes the color selection or the device selection


function onLoad() {
	document.getElementById('calculate-button').addEventListener('click', callImgGen);
	document.getElementById('save-button').addEventListener('click', saveImage);
	document.getElementById('clear-button').addEventListener('click', clearButton);
	document.getElementById('manufacturer-select').addEventListener('change', populateDeviceDropdown);
	document.getElementById('screen-cols').addEventListener('input', drawGrid);
	document.getElementById('screen-rows').addEventListener('input', drawGrid);
	document.getElementById('odd-color ui').addEventListener('change', drawGrid);
	document.getElementById('even-color ui').addEventListener('change', drawGrid);
	document.getElementById('resolution-select').addEventListener('change', setResolution);
	document.getElementById('custom-res-width').addEventListener('change', setResolution);
	document.getElementById('custom-res-height').addEventListener('change', setResolution);
	deviceDropdown.addEventListener('change', updateDeviceInfo);
	manufacturerDropdown.addEventListener('change', populateDeviceDropdown);	
	document.getElementById('save-button').style.display = 'none';
	document.getElementById('img-holder').style.display = 'none';
	document.getElementById('hidden-container').style.display = 'none';
	readManufacturers();
	$('.dropdown').dropdown();
	readResolution();
	//loadCookie();
	
	//add onchange event to resolution dropdown
	$('#resolution-select').dropdown({
		onChange: function(value, text, $selectedItem) {
			setResolution();
		}});
}